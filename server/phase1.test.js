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
  const updatedRecipient = synced.body.goals.find((goal) => goal.id === recipient.id);
  assert.equal(updatedRecipient.progress, 77);
});
