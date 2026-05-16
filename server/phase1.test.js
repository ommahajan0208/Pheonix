import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const tmpDb = path.join(os.tmpdir(), `phoenix-phase1-${Date.now()}.sqlite`);
process.env.DB_FILE = tmpDb;

const { app, closeDb } = await import(`./index.js?test=${Date.now()}`);

const server = http.createServer(app);
await new Promise((resolve) => server.listen(0, resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;

const api = async (pathName, options = {}) => {
  const response = await fetch(`${baseUrl}${pathName}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': options.userId || 'mgr-001',
      'x-user-role': options.role || 'manager',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

const rawApi = async (pathName, options = {}) => fetch(`${baseUrl}${pathName}`, {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': options.userId || 'admin-001',
    'x-user-role': options.role || 'admin',
    ...(options.headers || {}),
  },
});

const isoDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const setPhase = (phase, updates) => api(`/api/cycles/cycle-2026/phases/${phase}`, {
  method: 'PATCH',
  userId: 'admin-001',
  role: 'admin',
  body: JSON.stringify(updates),
});

const openQ1Window = () => setPhase('q1Checkin', {
  start: isoDaysFromNow(-1),
  end: isoDaysFromNow(1),
  isOpen: true,
});

const submitCheckIn = (goalId, overrides = {}) => api('/api/check-ins', {
  method: 'POST',
  userId: overrides.userId || 'emp-001',
  role: overrides.role || 'employee',
  body: JSON.stringify({
    goalId,
    quarter: 'Q1',
    plannedValue: 10,
    actualValue: 10,
    status: 'on-track',
    comments: 'Quarterly progress captured.',
    evidenceUrls: [],
    ...overrides.body,
  }),
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  closeDb();
  for (const suffix of ['', '-wal', '-shm']) {
    const file = `${tmpDb}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
});

test('rejects invalid goal sheet submission when total weightage is not 100', async () => {
  const { response, body } = await api('/api/goal-sheets/emp-003/submit', {
    method: 'POST',
    userId: 'emp-003',
    role: 'employee',
    body: JSON.stringify({ cycleId: 'cycle-2026' }),
  });

  assert.equal(response.status, 422);
  assert.equal(body.validation.totalWeightage, 40);
  assert.equal(body.validation.canSubmit, false);
});

test('rejects ninth goal for an employee in a cycle', async () => {
  for (let index = 0; index < 7; index += 1) {
    const { response } = await api('/api/goals', {
      method: 'POST',
      userId: 'emp-003',
      role: 'employee',
      body: JSON.stringify({
        employeeId: 'emp-003',
        title: `Capacity Goal ${index}`,
        description: 'Fill the sheet up to the configured goal limit.',
        thrustArea: 'Efficiency',
        unitOfMeasure: 'Numeric',
        scoringDirection: 'higher-is-better',
        target: 1,
        weightage: 10,
        progress: 0,
        status: 'draft',
        cycleId: 'cycle-2026',
        isShared: false,
      }),
    });
    assert.equal(response.status, 201);
  }

  const { response, body } = await api('/api/goals', {
    method: 'POST',
    userId: 'emp-003',
    role: 'employee',
    body: JSON.stringify({
      employeeId: 'emp-003',
      title: 'Ninth Goal',
      description: 'This should not be accepted.',
      thrustArea: 'Efficiency',
      unitOfMeasure: 'Numeric',
      scoringDirection: 'higher-is-better',
      target: 1,
      weightage: 10,
      progress: 0,
      status: 'draft',
      cycleId: 'cycle-2026',
      isShared: false,
    }),
  });

  assert.equal(response.status, 422);
  assert.match(body.error, /Maximum number of goals/);
});

test('rejects non-admin edits to locked approved goals', async () => {
  const { response, body } = await api('/api/goals/goal-001', {
    method: 'PATCH',
    userId: 'emp-001',
    role: 'employee',
    body: JSON.stringify({ target: 40 }),
  });

  assert.equal(response.status, 423);
  assert.match(body.error, /locked/i);
});

test('allows manager approval with inline target and weightage edits', async () => {
  const { response, body } = await api('/api/goal-sheets/emp-002/approve', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      cycleId: 'cycle-2026',
      edits: {
        'goal-008': { target: 2, weightage: 70 },
      },
    }),
  });

  assert.equal(response.status, 200);
  const approved = body.goals.find((goal) => goal.id === 'goal-008');
  assert.equal(approved.status, 'approved');
  assert.equal(approved.target, 2);
  assert.equal(approved.weightage, 70);
  assert.ok(approved.lockedAt);
});

test('keeps shared KPI recipient fields read-only and syncs primary owner progress', async () => {
  const created = await api('/api/shared-goals', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      primaryOwnerId: 'emp-004',
      employeeIds: ['emp-004', 'emp-002'],
      goal: {
        title: 'Shared Reliability KPI',
        description: 'Keep reliability achievement linked across recipients.',
        thrustArea: 'Customer Success',
        unitOfMeasure: '%',
        scoringDirection: 'higher-is-better',
        target: 95,
        weightage: 10,
        cycleId: 'cycle-2026',
        deadlineDate: '2026-12-31T00:00:00.000Z',
      },
    }),
  });

  assert.equal(created.response.status, 201);
  const shared = created.body.goals.filter((goal) => goal.title === 'Shared Reliability KPI');
  const primary = shared.find((goal) => goal.employeeId === 'emp-004');
  const recipient = shared.find((goal) => goal.employeeId === 'emp-002');
  assert.ok(primary);
  assert.ok(recipient);

  const blocked = await api(`/api/goals/${recipient.id}`, {
    method: 'PATCH',
    userId: 'emp-002',
    role: 'employee',
    body: JSON.stringify({ target: 88 }),
  });
  assert.equal(blocked.response.status, 403);

  const synced = await api(`/api/goals/${primary.id}`, {
    method: 'PATCH',
    userId: 'emp-004',
    role: 'employee',
    body: JSON.stringify({ progress: 77 }),
  });
  assert.equal(synced.response.status, 200);
  const adminView = await api('/api/bootstrap', {
    userId: 'admin-001',
    role: 'admin',
  });
  const updatedRecipient = adminView.body.goals.find((goal) => goal.id === recipient.id);
  assert.equal(updatedRecipient.progress, 77);
});

test('rejects employee check-in when the quarter window is closed', async () => {
  await setPhase('q1Checkin', {
    start: isoDaysFromNow(-1),
    end: isoDaysFromNow(1),
    isOpen: false,
  });

  const { response, body } = await submitCheckIn('goal-003', {
    body: { actualValue: 1 },
  });

  assert.equal(response.status, 409);
  assert.match(body.error, /window is closed/i);
});

test('rejects employee check-in outside the configured quarter dates', async () => {
  await setPhase('q1Checkin', {
    start: isoDaysFromNow(2),
    end: isoDaysFromNow(5),
    isOpen: true,
  });

  const { response, body } = await submitCheckIn('goal-003', {
    body: { actualValue: 1 },
  });

  assert.equal(response.status, 409);
  assert.match(body.error, /window is closed/i);
});

test('accepts employee check-ins during an open quarter window and computes progress scores', async () => {
  await openQ1Window();

  const higher = await submitCheckIn('goal-003', {
    body: { actualValue: 1, plannedValue: 1 },
  });
  assert.equal(higher.response.status, 200);
  assert.equal(higher.body.checkIns.find((checkIn) => checkIn.goalId === 'goal-003' && checkIn.quarter === 'Q1').progressScore, 50);

  const lower = await submitCheckIn('goal-004', {
    body: { actualValue: 30, plannedValue: 15 },
  });
  assert.equal(lower.response.status, 200);
  assert.equal(lower.body.checkIns.find((checkIn) => checkIn.goalId === 'goal-004' && checkIn.quarter === 'Q1').progressScore, 50);

  const timeline = await submitCheckIn('goal-006', {
    body: { actualValue: 45, achievementDate: '2026-08-15T00:00:00.000Z', plannedValue: 45, status: 'completed' },
  });
  assert.equal(timeline.response.status, 200);
  assert.equal(timeline.body.checkIns.find((checkIn) => checkIn.goalId === 'goal-006' && checkIn.quarter === 'Q1').progressScore, 100);

  const zero = await submitCheckIn('goal-002', {
    body: { actualValue: 1, plannedValue: 0 },
  });
  assert.equal(zero.response.status, 200);
  assert.equal(zero.body.checkIns.find((checkIn) => checkIn.goalId === 'goal-002' && checkIn.quarter === 'Q1').progressScore, 0);
});

test('rejects invalid quarter and status for employee check-ins', async () => {
  await openQ1Window();

  const badQuarter = await submitCheckIn('goal-003', {
    body: { quarter: 'Q5' },
  });
  assert.equal(badQuarter.response.status, 422);
  assert.match(badQuarter.body.error, /invalid quarter/i);

  const badStatus = await submitCheckIn('goal-003', {
    body: { status: 'blocked' },
  });
  assert.equal(badStatus.response.status, 422);
  assert.match(badStatus.body.error, /invalid check-in status/i);
});

test('rejects unauthorized employee check-in submission', async () => {
  await openQ1Window();

  const { response, body } = await submitCheckIn('goal-003', {
    userId: 'emp-002',
    role: 'employee',
    body: { actualValue: 2 },
  });

  assert.equal(response.status, 403);
  assert.match(body.error, /yourself or direct reports/i);
});

test('rejects manager comment for a non-report goal', async () => {
  await openQ1Window();

  const { response, body } = await api('/api/check-ins/goal-007/manager-comment', {
    method: 'POST',
    userId: 'emp-001',
    role: 'manager',
    body: JSON.stringify({
      quarter: 'Q1',
      managerComment: {
        discussionSummary: 'Reviewed progress.',
        blockersSupportNeeded: 'None.',
        nextActions: 'Continue execution.',
      },
    }),
  });

  assert.equal(response.status, 403);
  assert.match(body.error, /direct reports/i);
});

test('rejects manager comment before employee check-in exists', async () => {
  await openQ1Window();

  const { response, body } = await api('/api/check-ins/goal-007/manager-comment', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      quarter: 'Q1',
      managerComment: {
        discussionSummary: 'Reviewed planned work.',
        blockersSupportNeeded: 'Awaiting data.',
        nextActions: 'Employee to submit progress.',
      },
    }),
  });

  assert.equal(response.status, 409);
  assert.match(body.error, /must be submitted/i);
});

test('accepts structured manager comment for a direct report during the open window', async () => {
  await openQ1Window();
  const submitted = await submitCheckIn('goal-007', {
    userId: 'emp-002',
    role: 'employee',
    body: { actualValue: 6, plannedValue: 6 },
  });
  assert.equal(submitted.response.status, 200);

  const { response, body } = await api('/api/check-ins/goal-007/manager-comment', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      quarter: 'Q1',
      managerComment: {
        discussionSummary: 'Activation experiments are progressing as planned.',
        blockersSupportNeeded: 'No blockers.',
        nextActions: 'Prepare Q2 experiment readout.',
      },
    }),
  });

  assert.equal(response.status, 200);
  const checkIn = body.checkIns.find((item) => item.goalId === 'goal-007' && item.quarter === 'Q1');
  assert.equal(checkIn.managerId, 'mgr-001');
  assert.ok(checkIn.managerCommentedAt);
  assert.equal(checkIn.managerComment.nextActions, 'Prepare Q2 experiment readout.');
});

test('scopes bootstrap payloads by role', async () => {
  const employee = await api('/api/bootstrap', {
    userId: 'emp-001',
    role: 'employee',
  });
  assert.equal(employee.response.status, 200);
  assert.ok(employee.body.goals.length > 0);
  assert.ok(employee.body.goals.every((goal) => goal.employeeId === 'emp-001'));
  assert.deepEqual(employee.body.auditLogs, []);

  const manager = await api('/api/bootstrap', {
    userId: 'mgr-001',
    role: 'manager',
  });
  assert.equal(manager.response.status, 200);
  assert.ok(manager.body.goals.every((goal) => ['emp-001', 'emp-002', 'emp-003', 'emp-004'].includes(goal.employeeId)));

  const admin = await api('/api/bootstrap', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(admin.response.status, 200);
  assert.ok(admin.body.auditLogs.length > 0);
});

test('rejects manager approval for non-direct reports', async () => {
  const { response, body } = await api('/api/goal-sheets/emp-002/approve', {
    method: 'POST',
    userId: 'emp-001',
    role: 'manager',
    body: JSON.stringify({ cycleId: 'cycle-2026' }),
  });

  assert.equal(response.status, 403);
  assert.match(body.error, /direct reports/i);
});

test('returns achievement report JSON and CSV with planned vs actual data', async () => {
  const jsonReport = await api('/api/reports/achievement?quarter=Q1&managerId=mgr-001&status=approved', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(jsonReport.response.status, 200);
  const row = jsonReport.body.rows.find((item) => item.goalId === 'goal-001');
  assert.ok(row);
  assert.equal(row.plannedValue, 8);
  assert.equal(row.actualValue, 7);
  assert.equal(row.managerName, 'Sarah Johnson');

  const csvReport = await rawApi('/api/reports/achievement?quarter=Q1&format=csv', {
    userId: 'admin-001',
    role: 'admin',
  });
  const text = await csvReport.text();
  assert.equal(csvReport.status, 200);
  assert.match(csvReport.headers.get('content-type') || '', /text\/csv/);
  assert.match(text, /Employee,Manager,Department,Quarter,Goal/);
  assert.match(text, /John Smith/);
});

test('returns completion dashboard rows with employee and manager completion', async () => {
  const { response, body } = await api('/api/reports/completion?quarter=Q1&managerId=mgr-001', {
    userId: 'admin-001',
    role: 'admin',
  });

  assert.equal(response.status, 200);
  const jane = body.rows.find((row) => row.employeeId === 'emp-002');
  assert.ok(jane);
  assert.equal(jane.managerName, 'Sarah Johnson');
  assert.ok(jane.employeeSubmitted >= 1);
  assert.ok(jane.managerCompleted >= 1);
  assert.match(jane.status, /complete|manager-pending|employee-pending/);
});

test('restricts report APIs to managers and admins', async () => {
  const { response, body } = await api('/api/reports/achievement?quarter=Q1', {
    userId: 'emp-001',
    role: 'employee',
  });

  assert.equal(response.status, 403);
  assert.match(body.error, /Forbidden/i);
});

test('returns org hierarchy and supports admin-only user management', async () => {
  const hierarchy = await api('/api/org-hierarchy', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(hierarchy.response.status, 200);
  const engineering = hierarchy.body.children.find((department) => department.name === 'Engineering');
  assert.ok(engineering);
  assert.ok(engineering.children.some((manager) => manager.name === 'Sarah Johnson'));

  const blocked = await api('/api/users', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      id: 'emp-900',
      name: 'Blocked User',
      email: 'blocked@example.com',
      role: 'employee',
    }),
  });
  assert.equal(blocked.response.status, 403);

  const invalidManager = await api('/api/users', {
    method: 'POST',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({
      id: 'emp-901',
      name: 'Invalid Manager User',
      email: 'invalid@example.com',
      role: 'employee',
      managerId: 'emp-001',
    }),
  });
  assert.equal(invalidManager.response.status, 422);

  const created = await api('/api/users', {
    method: 'POST',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({
      id: 'emp-902',
      name: 'New Analyst',
      email: 'analyst@example.com',
      role: 'employee',
      title: 'Business Analyst',
      managerId: 'mgr-001',
      departmentId: 'dept-eng',
      departmentName: 'Engineering',
    }),
  });
  assert.equal(created.response.status, 201);
  assert.ok(created.body.teamMembers.some((member) => member.id === 'emp-902'));

  const updated = await api('/api/users/emp-902', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ title: 'Senior Business Analyst' }),
  });
  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.teamMembers.find((member) => member.id === 'emp-902').title, 'Senior Business Analyst');

  const loop = await api('/api/users/mgr-001', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ managerId: 'mgr-001' }),
  });
  assert.equal(loop.response.status, 422);
  assert.match(loop.body.error, /reporting loop/i);
});

test('logs locked goal changes and exports audit logs as CSV', async () => {
  const changed = await api('/api/goals/goal-008', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ target: 3, adminOverride: true }),
  });
  assert.equal(changed.response.status, 200);

  const lockedLogs = await api('/api/audit-logs?lockedOnly=true&goalId=goal-008', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(lockedLogs.response.status, 200);
  const log = lockedLogs.body.rows.find((row) => row.action === 'Updated Locked Goal');
  assert.ok(log);
  assert.equal(log.changedAfterLock, true);
  assert.ok(log.fieldChanges.some((change) => change.field === 'target'));

  const blocked = await api('/api/audit-logs', {
    userId: 'mgr-001',
    role: 'manager',
  });
  assert.equal(blocked.response.status, 403);

  const exported = await rawApi('/api/audit-logs?format=csv&lockedOnly=true', {
    userId: 'admin-001',
    role: 'admin',
  });
  const text = await exported.text();
  assert.equal(exported.status, 200);
  assert.match(text, /Timestamp,User ID,User,Action,Goal ID/);
  assert.match(text, /Updated Locked Goal/);
});

test('supports admin escalation rule creation and updates only', async () => {
  const blocked = await api('/api/escalation-rules', {
    method: 'POST',
    userId: 'mgr-001',
    role: 'manager',
    body: JSON.stringify({
      id: 'rule-blocked',
      name: 'Blocked',
      condition: 'goal-not-submitted',
      thresholdDays: 1,
      managerAfterDays: 2,
      hrAfterDays: 3,
    }),
  });
  assert.equal(blocked.response.status, 403);

  const created = await api('/api/escalation-rules', {
    method: 'POST',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({
      id: 'rule-test-created',
      name: 'Test Rule',
      condition: 'goal-not-submitted',
      thresholdDays: 0,
      managerAfterDays: 1,
      hrAfterDays: 2,
      active: true,
    }),
  });
  assert.equal(created.response.status, 201);
  assert.ok(created.body.rules.some((rule) => rule.id === 'rule-test-created'));

  const updated = await api('/api/escalation-rules/rule-test-created', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ name: 'Updated Test Rule', active: false }),
  });
  assert.equal(updated.response.status, 200);
  const rule = updated.body.rules.find((item) => item.id === 'rule-test-created');
  assert.equal(rule.name, 'Updated Test Rule');
  assert.equal(rule.active, false);
});

test('computes escalation logs for all configured conditions and persists resolution status', async () => {
  await api('/api/escalation-rules/rule-goal-submit', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ thresholdDays: 0, managerAfterDays: 0, hrAfterDays: 0, active: true }),
  });
  await api('/api/escalation-rules/rule-manager-approval', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ thresholdDays: 0, managerAfterDays: 0, hrAfterDays: 0, active: true }),
  });
  await api('/api/escalation-rules/rule-quarter-checkin', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ thresholdDays: 0, managerAfterDays: 0, hrAfterDays: 0, active: true }),
  });
  await api('/api/goals/goal-010', {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ status: 'pending', adminOverride: true }),
  });
  await setPhase('q2Checkin', {
    start: isoDaysFromNow(-5),
    end: isoDaysFromNow(-1),
    isOpen: false,
  });

  const logs = await api('/api/escalation-logs', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(logs.response.status, 200);
  assert.ok(logs.body.rows.some((log) => log.condition === 'goal-not-submitted'));
  assert.ok(logs.body.rows.some((log) => log.condition === 'manager-not-approved'));
  assert.ok(logs.body.rows.some((log) => log.condition === 'checkin-not-completed'));
  assert.ok(logs.body.rows.every((log) => log.currentLevel === 'hr'));

  const target = logs.body.rows.find((log) => log.condition === 'checkin-not-completed');
  const resolved = await api(`/api/escalation-logs/${target.id}/status`, {
    method: 'PATCH',
    userId: 'admin-001',
    role: 'admin',
    body: JSON.stringify({ status: 'resolved' }),
  });
  assert.equal(resolved.response.status, 200);

  const filtered = await api('/api/escalation-logs?status=resolved&condition=checkin-not-completed', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(filtered.response.status, 200);
  assert.ok(filtered.body.rows.some((log) => log.id === target.id && log.status === 'resolved'));
});

test('runs escalation notifications deterministically without duplicates', async () => {
  const first = await api('/api/escalations/run', {
    method: 'POST',
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(first.response.status, 200);
  assert.ok(first.body.evaluated > 0);
  assert.ok(first.body.inserted > 0);

  const second = await api('/api/escalations/run', {
    method: 'POST',
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(second.response.status, 200);
  assert.equal(second.body.inserted, 0);

  const adminView = await api('/api/bootstrap', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.ok(adminView.body.notifications.some((notification) => notification.id.startsWith('notif-rule-')));
});

test('returns scoped QoQ analytics for employees and managers', async () => {
  const employee = await api('/api/analytics/qoq?scope=individual&employeeId=emp-002', {
    userId: 'emp-001',
    role: 'employee',
  });
  assert.equal(employee.response.status, 200);
  assert.equal(employee.body.rows.length, 4);
  assert.ok(employee.body.rows.every((row) => row.scope === 'individual'));

  const manager = await api('/api/analytics/qoq?scope=team&managerId=admin-001', {
    userId: 'mgr-001',
    role: 'manager',
  });
  assert.equal(manager.response.status, 200);
  assert.equal(manager.body.rows.length, 4);
  assert.ok(manager.body.rows.some((row) => row.approvedGoals > 0));
});

test('returns heatmap, goal distribution, and manager effectiveness analytics', async () => {
  const heatmap = await api('/api/analytics/completion-heatmap?quarter=Q1', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(heatmap.response.status, 200);
  assert.ok(heatmap.body.rows.some((row) => row.departmentName === 'Engineering' && row.managerName === 'Sarah Johnson'));

  const distribution = await api('/api/analytics/goal-distribution', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(distribution.response.status, 200);
  assert.ok(distribution.body.thrustAreas.length > 0);
  assert.ok(distribution.body.uomTypes.length > 0);
  assert.ok(distribution.body.statuses.length > 0);

  const effectiveness = await api('/api/analytics/manager-effectiveness?quarter=Q1', {
    userId: 'admin-001',
    role: 'admin',
  });
  assert.equal(effectiveness.response.status, 200);
  const sarah = effectiveness.body.rows.find((row) => row.managerId === 'mgr-001');
  assert.ok(sarah);
  assert.ok(sarah.employeeCompletion >= 0);

  const blocked = await api('/api/analytics/goal-distribution', {
    userId: 'emp-001',
    role: 'employee',
  });
  assert.equal(blocked.response.status, 403);
});
