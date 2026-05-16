import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(process.env.DB_FILE || path.join(dataDir, 'phoenix.sqlite'));
db.pragma('journal_mode = WAL');

const nowIso = () => new Date().toISOString();
const json = (value) => JSON.stringify(value ?? null);
const parseJson = (value, fallback = null) => {
  if (value === undefined || value === null || value === '') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const phaseJson = {
  goalSetting: { start: '2026-05-01T00:00:00.000Z', end: '2026-05-31T00:00:00.000Z', isOpen: true },
  q1Checkin: { start: '2026-07-01T00:00:00.000Z', end: '2026-07-31T00:00:00.000Z', isOpen: false },
  q2Checkin: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-31T00:00:00.000Z', isOpen: false },
  q3Checkin: { start: '2027-01-01T00:00:00.000Z', end: '2027-01-31T00:00:00.000Z', isOpen: false },
  q4Checkin: { start: '2027-03-01T00:00:00.000Z', end: '2027-04-30T00:00:00.000Z', isOpen: false },
  finalReview: { start: '2027-04-01T00:00:00.000Z', end: '2027-04-30T00:00:00.000Z', isOpen: false },
};

const users = [
  ['emp-001', 'John Smith', 'john.smith@company.com', 'employee', 'Senior Software Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-002', 'Jane Doe', 'jane.doe@company.com', 'employee', 'Product Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-003', 'Mike Johnson', 'mike.johnson@company.com', 'employee', 'Platform Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-004', 'Priya Nair', 'priya.nair@company.com', 'employee', 'QA Lead', 'mgr-001', 'dept-eng', 'Engineering'],
  ['mgr-001', 'Sarah Johnson', 'sarah.johnson@company.com', 'manager', 'Engineering Manager', null, 'dept-eng', 'Engineering'],
  ['admin-001', 'Alex Chen', 'alex.chen@company.com', 'admin', 'People Operations Admin', null, null, null],
];

const goals = [
  ['goal-001', 'emp-001', 'John Smith', 'Increase API Response Time by 25%', 'Optimize database queries and implement caching', 'Efficiency', '%', 'higher-is-better', 25, 20, 15, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-01-05T00:00:00.000Z', '2026-01-10T00:00:00.000Z', '2026-06-30T00:00:00.000Z'],
  ['goal-002', 'emp-001', 'John Smith', 'Maintain Zero Critical Launch Incidents', 'Keep critical production incidents at zero during mobile launch readiness', 'Innovation', 'Zero-based', 'zero-success', 1, 30, 100, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-01-06T00:00:00.000Z', '2026-05-10T00:00:00.000Z', '2026-09-30T00:00:00.000Z'],
  ['goal-003', 'emp-001', 'John Smith', 'Mentor 2 Junior Developers', 'Provide weekly 1:1 coaching sessions', 'Team Development', 'Numeric', 'higher-is-better', 2, 15, 50, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-01-07T00:00:00.000Z', '2026-05-15T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
  ['goal-004', 'emp-001', 'John Smith', 'Revenue Growth - Engineering Efficiency', 'Shared goal: Reduce infrastructure costs by 15%', 'Revenue', '%', 'lower-is-better', 15, 10, 8, 'approved', 'cycle-2026', 1, 'shared-eng-cost', 'emp-001', '2026-01-10T00:00:00.000Z', 0, '2026-01-08T00:00:00.000Z', '2026-05-12T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
  ['goal-005', 'emp-001', 'John Smith', 'Improve Search Reliability', 'Raise search success rate and reduce failed customer searches', 'Customer Success', '%', 'higher-is-better', 98, 15, 0, 'draft', 'cycle-2026', 0, null, null, null, 0, '2026-05-12T00:00:00.000Z', '2026-05-12T00:00:00.000Z', '2026-10-15T00:00:00.000Z'],
  ['goal-006', 'emp-001', 'John Smith', 'Reduce Incident MTTR', 'Cut production incident mean time to recovery through runbooks', 'Efficiency', 'Timeline', 'date-based', 45, 10, 0, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-05-13T00:00:00.000Z', '2026-05-13T00:00:00.000Z', '2026-08-31T00:00:00.000Z'],
  ['goal-007', 'emp-002', 'Jane Doe', 'Improve Activation Funnel', 'Lift new user activation through onboarding experiments', 'Revenue', '%', 'higher-is-better', 12, 30, 62, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-01-10T00:00:00.000Z', '2026-05-15T00:00:00.000Z', '2026-09-30T00:00:00.000Z'],
  ['goal-008', 'emp-002', 'Jane Doe', 'AI Triage Pilot', 'Ship a pilot workflow for support ticket classification', 'Innovation', 'Zero-based', 'zero-success', 1, 25, 30, 'pending', 'cycle-2026', 1, 'shared-ai-triage', 'emp-002', null, 0, '2026-02-02T00:00:00.000Z', '2026-05-11T00:00:00.000Z', '2026-07-31T00:00:00.000Z'],
  ['goal-009', 'emp-003', 'Mike Johnson', 'Cloud Cost Guardrails', 'Implement spend alerts and service owner reporting', 'Efficiency', 'Numeric', 'lower-is-better', 150000, 40, 22, 'approved', 'cycle-2026', 0, null, null, null, 0, '2026-02-01T00:00:00.000Z', '2026-05-09T00:00:00.000Z', '2026-05-01T00:00:00.000Z'],
  ['goal-010', 'emp-004', 'Priya Nair', 'Regression Automation Coverage', 'Increase automated coverage for release-critical journeys', 'Customer Success', '%', 'higher-is-better', 85, 35, 44, 'rework', 'cycle-2026', 0, null, null, null, 0, '2026-02-12T00:00:00.000Z', '2026-05-10T00:00:00.000Z', '2026-11-15T00:00:00.000Z'],
];

const checkIns = [
  ['checkin-001', 'goal-001', 'Q1', 8, 7, 'on-track', 28, null, 'Caching rollout is mostly complete.', json(['runbook.pdf']), null, null, null, '2026-03-28T00:00:00.000Z'],
  ['checkin-002', 'goal-002', 'Q1', 0, 0, 'completed', 100, null, 'No critical incidents reported.', json([]), null, null, null, '2026-03-28T00:00:00.000Z'],
  ['checkin-003', 'goal-004', 'Q1', 15, 14, 'on-track', 100, null, 'Infrastructure cost reduction is ahead of target.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
  ['checkin-004', 'goal-006', 'Q1', 45, 45, 'completed', 100, '2026-08-15T00:00:00.000Z', 'Runbooks completed before deadline.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
  ['checkin-005', 'goal-009', 'Q1', 150000, 175000, 'on-track', 86, null, 'Vendor data arrived late, but spend controls are moving.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
];

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL, title TEXT, manager_id TEXT, department_id TEXT, department_name TEXT);
    CREATE TABLE IF NOT EXISTS cycles (id TEXT PRIMARY KEY, name TEXT NOT NULL, year INTEGER NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, phases TEXT NOT NULL, is_active INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY, employee_id TEXT NOT NULL, employee_name TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL,
      thrust_area TEXT NOT NULL, unit_of_measure TEXT NOT NULL, scoring_direction TEXT NOT NULL, target REAL NOT NULL, weightage REAL NOT NULL,
      progress REAL NOT NULL, status TEXT NOT NULL, cycle_id TEXT NOT NULL, is_shared INTEGER NOT NULL, shared_goal_id TEXT, primary_owner_id TEXT,
      locked_at TEXT, unlocked_by_admin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deadline_date TEXT
    );
    CREATE TABLE IF NOT EXISTS shared_goal_groups (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, thrust_area TEXT NOT NULL, unit_of_measure TEXT NOT NULL, scoring_direction TEXT NOT NULL, target REAL NOT NULL, cycle_id TEXT NOT NULL, primary_owner_id TEXT NOT NULL, created_by TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS check_ins (id TEXT PRIMARY KEY, goal_id TEXT NOT NULL, quarter TEXT NOT NULL, planned_value REAL NOT NULL, actual_value REAL NOT NULL, status TEXT NOT NULL, progress_score REAL NOT NULL, achievement_date TEXT, comments TEXT, evidence_urls TEXT, manager_comment TEXT, manager_id TEXT, manager_commented_at TEXT, submitted_at TEXT, UNIQUE(goal_id, quarter));
    CREATE TABLE IF NOT EXISTS audit_logs (id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, changed_at TEXT, user_id TEXT NOT NULL, user_name TEXT NOT NULL, action TEXT NOT NULL, goal_id TEXT, goal_title TEXT, before_json TEXT, after_json TEXT, field_changes TEXT, changed_after_lock INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, link TEXT NOT NULL, is_read INTEGER NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS escalation_status_overrides (id TEXT PRIMARY KEY, status TEXT NOT NULL);
  `);

  if (db.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {
    const insertUser = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    users.forEach((row) => insertUser.run(...row));
    db.prepare('INSERT INTO cycles VALUES (?, ?, ?, ?, ?, ?, ?)').run('cycle-2026', 'FY 2026', 2026, '2026-05-01T00:00:00.000Z', '2027-04-30T00:00:00.000Z', json(phaseJson), 1);
    const insertGoal = db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    goals.forEach((row) => insertGoal.run(...row));
    const insertCheckIn = db.prepare('INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    checkIns.forEach((row) => insertCheckIn.run(...row));
    [
      ['notif-001', 'emp-001', 'approval', 'Goal Approved', 'Your goal "Increase API Response Time by 25%" has been approved', '/employee/my-goals', 0, '2026-05-15T00:00:00.000Z'],
      ['notif-002', 'emp-001', 'deadline', 'Deadline Approaching', 'Q2 Check-in deadline is in 3 days', '/employee/checkin', 0, '2026-05-14T00:00:00.000Z'],
      ['notif-003', 'mgr-001', 'approval', 'Approvals waiting', '3 submitted goals need manager review', '/manager/approvals', 0, '2026-05-16T00:00:00.000Z'],
      ['notif-004', 'admin-001', 'deadline', 'Escalations increased', '2 goals are overdue or at risk this cycle', '/admin/escalations', 0, '2026-05-16T00:00:00.000Z'],
    ].forEach((row) => db.prepare('INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(...row));
    addAudit({ userId: 'system', userName: 'Seeder', action: 'Seeded Demo Data', after: { goals: goals.length } });
  }
}

function mapGoal(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    title: row.title,
    description: row.description,
    thrustArea: row.thrust_area,
    unitOfMeasure: row.unit_of_measure,
    scoringDirection: row.scoring_direction,
    target: row.target,
    weightage: row.weightage,
    progress: row.progress,
    status: row.status,
    cycleId: row.cycle_id,
    isShared: Boolean(row.is_shared),
    sharedGoalId: row.shared_goal_id || undefined,
    primaryOwnerId: row.primary_owner_id || undefined,
    lockedAt: row.locked_at || undefined,
    unlockedByAdmin: Boolean(row.unlocked_by_admin),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deadlineDate: row.deadline_date || undefined,
  };
}

const mapCycle = (row) => ({ id: row.id, name: row.name, year: row.year, startDate: row.start_date, endDate: row.end_date, phases: parseJson(row.phases, {}), isActive: Boolean(row.is_active) });
const mapUser = (row) => ({ id: row.id, name: row.name, email: row.email, role: row.role, title: row.title, managerId: row.manager_id || undefined, departmentId: row.department_id || undefined, departmentName: row.department_name || undefined });
const mapTeamMember = (row) => ({ id: row.id, name: row.name, email: row.email, title: row.title, departmentId: row.department_id, departmentName: row.department_name, managerId: row.manager_id });
const mapCheckIn = (row) => ({ id: row.id, goalId: row.goal_id, quarter: row.quarter, plannedValue: row.planned_value, actualValue: row.actual_value, status: row.status, progressScore: row.progress_score, achievementDate: row.achievement_date || undefined, comments: row.comments || '', evidenceUrls: parseJson(row.evidence_urls, []), managerComment: parseJson(row.manager_comment, undefined), managerId: row.manager_id || undefined, managerCommentedAt: row.manager_commented_at || undefined, submittedAt: row.submitted_at || undefined });
const mapAudit = (row) => ({ id: row.id, timestamp: row.timestamp, changedAt: row.changed_at || undefined, userId: row.user_id, userName: row.user_name, action: row.action, goalId: row.goal_id || undefined, goalTitle: row.goal_title || undefined, before: parseJson(row.before_json, undefined), after: parseJson(row.after_json, undefined), fieldChanges: parseJson(row.field_changes, undefined), changedAfterLock: Boolean(row.changed_after_lock) });
const mapNotification = (row) => ({ id: row.id, userId: row.user_id, type: row.type, title: row.title, message: row.message, link: row.link, isRead: Boolean(row.is_read), createdAt: row.created_at });

function actor(req) {
  const id = req.get('x-user-id') || 'system';
  const role = req.get('x-user-role') || 'employee';
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return user ? { ...mapUser(user), role } : { id, role, name: 'Demo Workflow' };
}

function requireRole(req, roles) {
  const user = actor(req);
  if (!roles.includes(user.role)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }
  return user;
}

function activeCycle(cycleId) {
  return cycleId
    ? db.prepare('SELECT * FROM cycles WHERE id = ?').get(cycleId)
    : db.prepare('SELECT * FROM cycles WHERE is_active = 1 LIMIT 1').get();
}

function isGoalSettingOpen(cycleId) {
  const cycle = activeCycle(cycleId);
  return Boolean(cycle && parseJson(cycle.phases, {}).goalSetting?.isOpen);
}

function goalSheet(employeeId, cycleId) {
  return db.prepare('SELECT * FROM goals WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?)').all(employeeId, cycleId || null, cycleId || null).map(mapGoal);
}

function validateGoalSheet(employeeId, cycleId, suppliedGoals) {
  const sheetGoals = suppliedGoals || goalSheet(employeeId, cycleId);
  const totalWeightage = sheetGoals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const checks = [
    { label: 'Total weightage equals 100%', passed: totalWeightage === 100 },
    { label: 'Maximum 8 goals', passed: sheetGoals.length > 0 && sheetGoals.length <= 8 },
    { label: 'Each goal has at least 10% weightage', passed: sheetGoals.length > 0 && sheetGoals.every((goal) => Number(goal.weightage) >= 10) },
  ];
  return { totalWeightage, goalCount: sheetGoals.length, canSubmit: checks.every((check) => check.passed), errors: checks.filter((check) => !check.passed).map((check) => check.label), checks };
}

function defaultScoring(unit) {
  if (unit === 'Timeline') return 'date-based';
  if (unit === 'Zero-based') return 'zero-success';
  return 'higher-is-better';
}

function scoreGoal(goal, checkIn) {
  const actual = Number(checkIn.actualValue);
  const target = Number(goal.target);
  const clamp = (value) => (!Number.isFinite(value) || value < 0 ? 0 : Math.min(100, Math.round(value)));
  if (goal.scoringDirection === 'lower-is-better') return target <= 0 || actual <= 0 ? 0 : clamp((target / actual) * 100);
  if (goal.scoringDirection === 'date-based') return checkIn.achievementDate && goal.deadlineDate && new Date(checkIn.achievementDate) <= new Date(goal.deadlineDate) ? 100 : 0;
  if (goal.scoringDirection === 'zero-success') return Number.isFinite(actual) && actual === 0 ? 100 : 0;
  return target <= 0 ? 0 : clamp((actual / target) * 100);
}

function addAudit({ userId, userName, action, goalId, goalTitle, before, after, fieldChanges, changedAfterLock = false }) {
  db.prepare('INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nowIso(),
    nowIso(),
    userId,
    userName,
    action,
    goalId || null,
    goalTitle || null,
    json(before),
    json(after),
    json(fieldChanges),
    changedAfterLock ? 1 : 0
  );
}

function fieldChanges(before, after) {
  return Object.keys(after)
    .filter((field) => field !== 'updatedAt')
    .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]))
    .map((field) => ({ field, before: before[field], after: after[field] }));
}

function bootstrap() {
  const activities = [
    { id: 'activity-001', title: 'Goal approved', description: 'Increase API Response Time by 25% was approved by Sarah Johnson.', tone: 'success', createdAt: '2026-05-16T09:15:00.000Z', link: '/employee/my-goals' },
    { id: 'activity-002', title: 'Q2 check-in window', description: 'Employee check-ins are due in 5 days.', tone: 'warning', createdAt: '2026-05-15T12:00:00.000Z', link: '/employee/checkin' },
    { id: 'activity-003', title: 'Analytics refreshed', description: 'Team completion trends were recalculated for FY 2026.', tone: 'analytics', createdAt: '2026-05-15T08:00:00.000Z', link: '/manager/analytics' },
    { id: 'activity-004', title: 'Escalation opened', description: 'Cloud Cost Guardrails is overdue and below target progress.', tone: 'error', createdAt: '2026-05-14T15:00:00.000Z', link: '/admin/escalations' },
  ];
  const escalations = [
    { id: 'esc-001', title: 'Cloud Cost Guardrails overdue', owner: 'Mike Johnson', severity: 'high', reason: 'Deadline passed with 22% completion.', status: 'open', createdAt: '2026-05-02T00:00:00.000Z' },
    { id: 'esc-002', title: 'Regression coverage needs rework', owner: 'Priya Nair', severity: 'medium', reason: 'Manager requested goal revision.', status: 'monitoring', createdAt: '2026-05-14T00:00:00.000Z' },
    { id: 'esc-003', title: 'AI Triage Pilot pending approval', owner: 'Jane Doe', severity: 'low', reason: 'Pending more than 5 business days.', status: 'monitoring', createdAt: '2026-05-12T00:00:00.000Z' },
  ];
  const escalationRules = [
    { id: 'rule-goal-submit', name: 'Goal sheet not submitted', condition: 'goal-not-submitted', thresholdDays: 7, managerAfterDays: 10, hrAfterDays: 14, active: true },
    { id: 'rule-manager-approval', name: 'Manager approval overdue', condition: 'manager-not-approved', thresholdDays: 5, managerAfterDays: 7, hrAfterDays: 10, active: true },
    { id: 'rule-quarter-checkin', name: 'Quarterly check-in incomplete', condition: 'checkin-not-completed', thresholdDays: 2, managerAfterDays: 5, hrAfterDays: 8, active: true },
  ];
  return {
    goals: db.prepare('SELECT * FROM goals ORDER BY created_at, id').all().map(mapGoal),
    cycles: db.prepare('SELECT * FROM cycles ORDER BY year DESC').all().map(mapCycle),
    checkIns: db.prepare('SELECT * FROM check_ins ORDER BY id').all().map(mapCheckIn),
    auditLogs: db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all().map(mapAudit),
    notifications: db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all().map(mapNotification),
    teamMembers: db.prepare("SELECT * FROM users WHERE role = 'employee' ORDER BY name").all().map(mapTeamMember),
    activities,
    escalations,
    escalationRules,
    escalationStatusOverrides: Object.fromEntries(db.prepare('SELECT * FROM escalation_status_overrides').all().map((row) => [row.id, row.status])),
  };
}

migrate();

export const app = express();
export const closeDb = () => db.close();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/bootstrap', (_req, res) => res.json(bootstrap()));
app.get('/api/goal-sheets/:employeeId/validate', (req, res) => res.json(validateGoalSheet(req.params.employeeId, req.query.cycleId)));

app.post('/api/goals', (req, res) => {
  const user = actor(req);
  const data = req.body || {};
  if (!isGoalSettingOpen(data.cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  if (user.role === 'employee' && data.employeeId !== user.id) return res.status(403).json({ error: 'Employees can only create their own goals.' });
  if (goalSheet(data.employeeId, data.cycleId).length >= 8) return res.status(422).json({ error: 'Maximum number of goals per employee is 8.' });
  if (Number(data.weightage) < 10) return res.status(422).json({ error: 'Minimum goal weightage is 10%.' });
  const employee = db.prepare('SELECT * FROM users WHERE id = ?').get(data.employeeId);
  if (!employee) return res.status(404).json({ error: 'Employee not found.' });
  const id = `goal-${Date.now()}`;
  const createdAt = nowIso();
  db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, data.employeeId, employee.name, data.title, data.description, data.thrustArea, data.unitOfMeasure,
    data.scoringDirection || defaultScoring(data.unitOfMeasure), Number(data.target), Number(data.weightage), Number(data.progress || 0),
    data.status || 'draft', data.cycleId, data.isShared ? 1 : 0, data.sharedGoalId || null, data.primaryOwnerId || null, null, 0,
    createdAt, createdAt, data.deadlineDate || null
  );
  addAudit({ userId: user.id, userName: user.name, action: 'Created Goal', goalId: id, goalTitle: data.title, after: { status: data.status || 'draft', weightage: data.weightage } });
  res.status(201).json(bootstrap());
});

app.patch('/api/goals/:id', (req, res) => {
  const user = actor(req);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(row);
  const updates = req.body || {};
  const updateKeys = Object.keys(updates).filter((key) => key !== 'adminOverride');
  const achievementUpdate = updateKeys.length > 0 && updateKeys.every((key) => ['progress', 'updatedAt'].includes(key));
  const adminOverride = user.role === 'admin' || updates.adminOverride === true;

  if (goal.status === 'approved' && !goal.unlockedByAdmin && !adminOverride && !achievementUpdate) return res.status(423).json({ error: 'Approved goals are locked.' });
  if (!adminOverride && !achievementUpdate && !isGoalSettingOpen(goal.cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  if (user.role === 'employee' && user.id !== goal.employeeId) return res.status(403).json({ error: 'Employees can only update their own goals.' });
  const isSharedRecipient = goal.isShared && goal.employeeId !== goal.primaryOwnerId && !adminOverride;
  if (isSharedRecipient && achievementUpdate) return res.status(403).json({ error: 'Only the primary owner can update shared achievement.' });

  const allowed = isSharedRecipient ? ['weightage'] : ['title', 'description', 'thrustArea', 'unitOfMeasure', 'scoringDirection', 'target', 'weightage', 'progress', 'deadlineDate', 'status'];
  const blocked = updateKeys.filter((key) => !allowed.includes(key));
  if (blocked.length) return res.status(403).json({ error: `Read-only shared goal fields: ${blocked.join(', ')}` });
  if (updates.weightage !== undefined && Number(updates.weightage) < 10) return res.status(422).json({ error: 'Minimum goal weightage is 10%.' });

  const next = { ...goal, ...updates, updatedAt: nowIso() };
  db.prepare(`UPDATE goals SET title = ?, description = ?, thrust_area = ?, unit_of_measure = ?, scoring_direction = ?, target = ?, weightage = ?, progress = ?, status = ?, locked_at = ?, unlocked_by_admin = ?, updated_at = ?, deadline_date = ? WHERE id = ?`).run(
    next.title, next.description, next.thrustArea, next.unitOfMeasure, next.scoringDirection || defaultScoring(next.unitOfMeasure), next.target, next.weightage, next.progress, next.status,
    updates.status === 'approved' ? nowIso() : next.lockedAt || null, updates.status === 'approved' ? 0 : next.unlockedByAdmin ? 1 : 0, next.updatedAt, next.deadlineDate || null, goal.id
  );
  if (goal.isShared && goal.sharedGoalId && goal.employeeId === goal.primaryOwnerId && updates.progress !== undefined) {
    db.prepare('UPDATE goals SET progress = ?, updated_at = ? WHERE shared_goal_id = ? AND id <> ?').run(Number(updates.progress), nowIso(), goal.sharedGoalId, goal.id);
  }
  const changes = fieldChanges(goal, updates);
  addAudit({ userId: user.id, userName: user.name, action: goal.lockedAt ? 'Updated Locked Goal' : 'Updated Goal', goalId: goal.id, goalTitle: goal.title, before: Object.fromEntries(changes.map((item) => [item.field, item.before])), after: Object.fromEntries(changes.map((item) => [item.field, item.after])), fieldChanges: changes, changedAfterLock: Boolean(goal.lockedAt && changes.length) });
  res.json(bootstrap());
});

app.delete('/api/goals/:id', (req, res) => {
  const user = actor(req);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(row);
  if (goal.status === 'approved' && !goal.unlockedByAdmin) return res.status(423).json({ error: 'Approved goals are locked.' });
  if (goal.status === 'pending' || goal.isShared) return res.status(409).json({ error: 'Submitted or shared goals cannot be deleted.' });
  if (user.role === 'employee' && goal.employeeId !== user.id) return res.status(403).json({ error: 'Employees can only delete their own goals.' });
  db.prepare('DELETE FROM goals WHERE id = ?').run(goal.id);
  addAudit({ userId: user.id, userName: user.name, action: 'Deleted Goal', goalId: goal.id, goalTitle: goal.title, before: { status: goal.status } });
  res.json(bootstrap());
});

app.post('/api/goal-sheets/:employeeId/submit', (req, res) => {
  const user = actor(req);
  const { cycleId } = req.body || {};
  if (user.role === 'employee' && user.id !== req.params.employeeId) return res.status(403).json({ error: 'Employees can only submit their own goal sheet.' });
  if (!isGoalSettingOpen(cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  const validation = validateGoalSheet(req.params.employeeId, cycleId);
  if (!validation.canSubmit) return res.status(422).json({ error: 'Goal sheet validation failed.', validation });
  db.prepare("UPDATE goals SET status = 'pending', updated_at = ? WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?) AND status IN ('draft', 'rework')").run(nowIso(), req.params.employeeId, cycleId || null, cycleId || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Submitted Goal Sheet', after: { status: 'pending', totalWeightage: validation.totalWeightage } });
  res.json(bootstrap());
});

app.post('/api/goal-sheets/:employeeId/approve', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { cycleId, edits = {} } = req.body || {};
  if (!isGoalSettingOpen(cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  const sheet = goalSheet(req.params.employeeId, cycleId).map((goal) => ({ ...goal, ...(edits[goal.id] || {}) }));
  const validation = validateGoalSheet(req.params.employeeId, cycleId, sheet);
  if (!validation.canSubmit) return res.status(422).json({ error: 'Goal sheet validation failed.', validation });
  const tx = db.transaction(() => {
    Object.entries(edits).forEach(([id, edit]) => {
      db.prepare('UPDATE goals SET target = COALESCE(?, target), weightage = COALESCE(?, weightage), updated_at = ? WHERE id = ? AND employee_id = ? AND status = ?').run(edit.target ?? null, edit.weightage ?? null, nowIso(), id, req.params.employeeId, 'pending');
    });
    db.prepare("UPDATE goals SET status = 'approved', locked_at = ?, unlocked_by_admin = 0, updated_at = ? WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?) AND status = 'pending'").run(nowIso(), nowIso(), req.params.employeeId, cycleId || null, cycleId || null);
  });
  tx();
  addAudit({ userId: user.id, userName: user.name, action: 'Approved Goal Sheet', after: { status: 'approved', totalWeightage: validation.totalWeightage } });
  res.json(bootstrap());
});

app.post('/api/goal-sheets/:employeeId/return', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { cycleId } = req.body || {};
  if (!isGoalSettingOpen(cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  db.prepare("UPDATE goals SET status = 'rework', updated_at = ? WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?) AND status = 'pending'").run(nowIso(), req.params.employeeId, cycleId || null, cycleId || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Requested Goal Sheet Rework', after: { status: 'rework', employeeId: req.params.employeeId } });
  res.json(bootstrap());
});

app.post('/api/shared-goals', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { goal, employeeIds = [], primaryOwnerId } = req.body || {};
  if (!goal || !primaryOwnerId) return res.status(400).json({ error: 'Goal and primary owner are required.' });
  if (!isGoalSettingOpen(goal.cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  if (Number(goal.weightage) < 10) return res.status(422).json({ error: 'Minimum goal weightage is 10%.' });
  const sharedGoalId = `shared-${Date.now()}`;
  const recipients = Array.from(new Set([primaryOwnerId, ...employeeIds]));
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO shared_goal_groups VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(sharedGoalId, goal.title, goal.description, goal.thrustArea, goal.unitOfMeasure, goal.scoringDirection || defaultScoring(goal.unitOfMeasure), Number(goal.target), goal.cycleId, primaryOwnerId, user.id, nowIso());
    recipients.forEach((employeeId, index) => {
      if (goalSheet(employeeId, goal.cycleId).length >= 8) return;
      const employee = db.prepare('SELECT * FROM users WHERE id = ?').get(employeeId);
      if (!employee) return;
      const id = `goal-${Date.now()}-${index}`;
      db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, employee.id, employee.name, goal.title, goal.description, goal.thrustArea, goal.unitOfMeasure, goal.scoringDirection || defaultScoring(goal.unitOfMeasure), Number(goal.target), Number(goal.weightage), 0, 'draft', goal.cycleId, 1, sharedGoalId, primaryOwnerId, null, 0, nowIso(), nowIso(), goal.deadlineDate || null);
    });
  });
  tx();
  addAudit({ userId: user.id, userName: user.name, action: 'Pushed Shared KPI', goalTitle: goal.title, after: { recipients: recipients.length, primaryOwnerId, sharedGoalId } });
  res.status(201).json(bootstrap());
});

app.post('/api/goals/:id/unlock', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(row);
  db.prepare("UPDATE goals SET status = 'rework', locked_at = NULL, unlocked_by_admin = 1, updated_at = ? WHERE id = ?").run(nowIso(), goal.id);
  addAudit({ userId: user.id, userName: user.name, action: 'Admin Unlocked Goal', goalId: goal.id, goalTitle: goal.title, before: { status: goal.status, lockedAt: goal.lockedAt }, after: { status: 'rework', unlockedByAdmin: true } });
  res.json(bootstrap());
});

app.post('/api/check-ins', (req, res) => {
  const user = actor(req);
  const data = req.body || {};
  const goalRow = db.prepare('SELECT * FROM goals WHERE id = ?').get(data.goalId);
  if (!goalRow) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(goalRow);
  if (user.role === 'employee' && user.id !== goal.employeeId) return res.status(403).json({ error: 'Employees can only submit their own check-ins.' });
  const progressScore = scoreGoal(goal, data);
  const id = `checkin-${Date.now()}-${goal.id}`;
  db.prepare(`
    INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(goal_id, quarter) DO UPDATE SET planned_value = excluded.planned_value, actual_value = excluded.actual_value, status = excluded.status, progress_score = excluded.progress_score, achievement_date = excluded.achievement_date, comments = excluded.comments, evidence_urls = excluded.evidence_urls, submitted_at = excluded.submitted_at
  `).run(id, goal.id, data.quarter, Number(data.plannedValue), Number(data.actualValue), data.status, progressScore, data.achievementDate || null, data.comments || '', json(data.evidenceUrls || []), null, null, null, data.submittedAt || nowIso());
  db.prepare('UPDATE goals SET progress = ?, updated_at = ? WHERE id = ?').run(progressScore, nowIso(), goal.id);
  if (goal.isShared && goal.sharedGoalId && goal.employeeId === goal.primaryOwnerId) {
    db.prepare('UPDATE goals SET progress = ?, updated_at = ? WHERE shared_goal_id = ?').run(progressScore, nowIso(), goal.sharedGoalId);
  }
  addAudit({ userId: user.id, userName: user.name, action: 'Submitted Quarterly Check-in', goalId: goal.id, goalTitle: goal.title, after: { quarter: data.quarter, actualValue: data.actualValue, progressScore, status: data.status } });
  res.json(bootstrap());
});

app.post('/api/check-ins/:goalId/manager-comment', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { quarter, managerComment } = req.body || {};
  const existing = db.prepare('SELECT * FROM check_ins WHERE goal_id = ? AND quarter = ?').get(req.params.goalId, quarter);
  const id = existing?.id || `checkin-${Date.now()}-${req.params.goalId}`;
  db.prepare(`
    INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(goal_id, quarter) DO UPDATE SET manager_comment = excluded.manager_comment, manager_id = excluded.manager_id, manager_commented_at = excluded.manager_commented_at
  `).run(id, req.params.goalId, quarter, existing?.planned_value || 0, existing?.actual_value || 0, existing?.status || 'not-started', existing?.progress_score || 0, existing?.achievement_date || null, existing?.comments || '', existing?.evidence_urls || json([]), json(managerComment), user.id, nowIso(), existing?.submitted_at || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Saved Manager Check-in Comment', goalId: req.params.goalId, after: managerComment });
  res.json(bootstrap());
});

app.patch('/api/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json(bootstrap());
});

app.patch('/api/cycles/:id/phases/:phase', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM cycles WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Cycle not found.' });
  const phases = parseJson(row.phases, {});
  phases[req.params.phase] = { ...phases[req.params.phase], ...(req.body || {}) };
  db.prepare('UPDATE cycles SET phases = ? WHERE id = ?').run(json(phases), req.params.id);
  addAudit({ userId: user.id, userName: user.name, action: req.body?.isOpen ? 'Opened Cycle Phase' : 'Updated Cycle Phase', after: { phase: req.params.phase, ...req.body } });
  res.json(bootstrap());
});

app.patch('/api/escalation-logs/:id/status', (req, res) => {
  requireRole(req, ['admin']);
  db.prepare('INSERT INTO escalation_status_overrides VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status').run(req.params.id, req.body?.status || 'open');
  res.json(bootstrap());
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Unexpected server error.' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`Phoenix API listening on http://localhost:${port}`));
}
