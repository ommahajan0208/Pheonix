import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
const dbPath = process.env.DB_FILE || path.join(dataDir, 'pheonix.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
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
const csv = (headers, rows) => {
  const escapeCell = (value) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
};

const phaseJson = {
  goalSetting: { start: '2026-05-01T00:00:00.000Z', end: '2026-05-31T00:00:00.000Z', isOpen: true },
  q1Checkin: { start: '2026-07-01T00:00:00.000Z', end: '2026-07-31T00:00:00.000Z', isOpen: false },
  q2Checkin: { start: '2026-10-01T00:00:00.000Z', end: '2026-10-31T00:00:00.000Z', isOpen: false },
  q3Checkin: { start: '2027-01-01T00:00:00.000Z', end: '2027-01-31T00:00:00.000Z', isOpen: false },
  q4Checkin: { start: '2027-03-01T00:00:00.000Z', end: '2027-04-30T00:00:00.000Z', isOpen: false },
  finalReview: { start: '2027-04-01T00:00:00.000Z', end: '2027-04-30T00:00:00.000Z', isOpen: false },
};

const quarterPhaseMap = {
  Q1: 'q1Checkin',
  Q2: 'q2Checkin',
  Q3: 'q3Checkin',
  Q4: 'q4Checkin',
};
const validCheckInStatuses = new Set(['not-started', 'on-track', 'completed']);
const validRoles = new Set(['employee', 'manager', 'admin']);
const validEscalationConditions = new Set(['goal-not-submitted', 'manager-not-approved', 'checkin-not-completed']);
const validEscalationStatuses = new Set(['open', 'monitoring', 'resolved']);
const validDeliveryChannels = new Set(['email', 'teams']);
const managerCommentFields = ['discussionSummary', 'blockersSupportNeeded', 'nextActions'];
const appBaseUrl = (process.env.APP_BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const notificationRetryLimit = Number(process.env.NOTIFICATION_RETRY_LIMIT || 3);
const reminderWindowDays = Number(process.env.CHECKIN_REMINDER_DAYS || 7);

const users = [
  ['emp-001', 'John Smith', 'john.smith@company.com', 'employee', 'Senior Software Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-002', 'Jane Doe', 'jane.doe@company.com', 'employee', 'Product Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-003', 'Mike Johnson', 'mike.johnson@company.com', 'employee', 'Platform Engineer', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-004', 'Priya Nair', 'priya.nair@company.com', 'employee', 'QA Lead', 'mgr-001', 'dept-eng', 'Engineering'],
  ['emp-005', 'Aarav Mehta', 'aarav.mehta@company.com', 'employee', 'Product Manager', 'mgr-002', 'dept-product', 'Product'],
  ['emp-006', 'Emily Chen', 'emily.chen@company.com', 'employee', 'UX Researcher', 'mgr-002', 'dept-product', 'Product'],
  ['emp-007', 'Carlos Rivera', 'carlos.rivera@company.com', 'employee', 'Account Executive', 'mgr-003', 'dept-sales', 'Sales'],
  ['emp-008', 'Lisa Wong', 'lisa.wong@company.com', 'employee', 'Customer Success Manager', 'mgr-003', 'dept-sales', 'Sales'],
  ['emp-009', 'Neha Kapoor', 'neha.kapoor@company.com', 'employee', 'People Operations Specialist', 'admin-001', 'dept-hr', 'Human Resources'],
  ['emp-010', 'Owen Brooks', 'owen.brooks@company.com', 'employee', 'Data Analyst', 'mgr-002', 'dept-product', 'Product'],
  ['emp-011', 'Iris Moreno', 'iris.moreno@company.com', 'employee', 'Lifecycle Marketing Manager', 'mgr-003', 'dept-sales', 'Sales'],
  ['emp-012', 'Dev Patel', 'dev.patel@company.com', 'employee', 'Business Systems Analyst', 'mgr-002', 'dept-product', 'Product'],
  ['mgr-001', 'Sarah Johnson', 'sarah.johnson@company.com', 'manager', 'Engineering Manager', null, 'dept-eng', 'Engineering'],
  ['mgr-002', 'Robert Davis', 'robert.davis@company.com', 'manager', 'Product Lead', null, 'dept-product', 'Product'],
  ['mgr-003', 'Maya Patel', 'maya.patel@company.com', 'manager', 'Sales Manager', null, 'dept-sales', 'Sales'],
  ['admin-001', 'Alex Chen', 'alex.chen@company.com', 'admin', 'People Operations Admin', null, null, null],
  ['admin-002', 'Fatima Khan', 'fatima.khan@company.com', 'admin', 'HR Governance Partner', null, 'dept-hr', 'Human Resources'],
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
  ['goal-011', 'emp-005', 'Aarav Mehta', 'Launch Self-Serve Onboarding', 'Release guided onboarding for small business customers', 'Customer Success', '%', 'higher-is-better', 75, 35, 55, 'approved', 'cycle-2026', 0, null, null, '2026-05-18T00:00:00.000Z', 0, '2026-02-15T00:00:00.000Z', '2026-05-18T00:00:00.000Z', '2026-10-31T00:00:00.000Z'],
  ['goal-012', 'emp-005', 'Aarav Mehta', 'Reduce Feature Cycle Time', 'Cut discovery-to-release cycle time for priority features', 'Efficiency', 'Numeric', 'lower-is-better', 21, 25, 40, 'approved', 'cycle-2026', 0, null, null, '2026-05-18T00:00:00.000Z', 0, '2026-02-16T00:00:00.000Z', '2026-05-18T00:00:00.000Z', '2026-12-15T00:00:00.000Z'],
  ['goal-013', 'emp-006', 'Emily Chen', 'Improve Research Participation', 'Increase qualified customer interviews for product discovery', 'Innovation', 'Numeric', 'higher-is-better', 40, 50, 65, 'approved', 'cycle-2026', 0, null, null, '2026-05-19T00:00:00.000Z', 0, '2026-02-18T00:00:00.000Z', '2026-05-19T00:00:00.000Z', '2026-09-30T00:00:00.000Z'],
  ['goal-014', 'emp-006', 'Emily Chen', 'Accessibility Audit Closure', 'Close priority accessibility findings across onboarding flows', 'Customer Success', '%', 'higher-is-better', 90, 30, 35, 'pending', 'cycle-2026', 0, null, null, null, 0, '2026-03-02T00:00:00.000Z', '2026-05-20T00:00:00.000Z', '2026-11-30T00:00:00.000Z'],
  ['goal-015', 'emp-007', 'Carlos Rivera', 'Grow Mid-Market Pipeline', 'Build qualified pipeline through partner-led campaigns', 'Revenue', 'Numeric', 'higher-is-better', 1200000, 45, 70, 'approved', 'cycle-2026', 0, null, null, '2026-05-20T00:00:00.000Z', 0, '2026-02-20T00:00:00.000Z', '2026-05-20T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
  ['goal-016', 'emp-007', 'Carlos Rivera', 'Improve Forecast Accuracy', 'Maintain forecast variance below target threshold', 'Efficiency', '%', 'lower-is-better', 8, 25, 60, 'approved', 'cycle-2026', 0, null, null, '2026-05-20T00:00:00.000Z', 0, '2026-02-21T00:00:00.000Z', '2026-05-20T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
  ['goal-017', 'emp-008', 'Lisa Wong', 'Increase Renewal Readiness', 'Complete executive business reviews for priority accounts', 'Customer Success', '%', 'higher-is-better', 95, 40, 58, 'approved', 'cycle-2026', 0, null, null, '2026-05-21T00:00:00.000Z', 0, '2026-02-22T00:00:00.000Z', '2026-05-21T00:00:00.000Z', '2026-10-31T00:00:00.000Z'],
  ['goal-018', 'emp-008', 'Lisa Wong', 'Reduce Escalated Support Cases', 'Lower escalated support cases in strategic accounts', 'Efficiency', 'Numeric', 'lower-is-better', 12, 25, 45, 'approved', 'cycle-2026', 0, null, null, '2026-05-21T00:00:00.000Z', 0, '2026-02-23T00:00:00.000Z', '2026-05-21T00:00:00.000Z', '2026-09-30T00:00:00.000Z'],
  ['goal-019', 'emp-009', 'Neha Kapoor', 'Complete HR Policy Refresh', 'Update policy documents and launch employee acknowledgement workflow', 'Team Development', '%', 'higher-is-better', 100, 50, 75, 'approved', 'cycle-2026', 0, null, null, '2026-05-22T00:00:00.000Z', 0, '2026-02-24T00:00:00.000Z', '2026-05-22T00:00:00.000Z', '2026-08-31T00:00:00.000Z'],
  ['goal-020', 'emp-009', 'Neha Kapoor', 'Zero Payroll Exceptions', 'Keep payroll processing errors at zero during quarterly cycles', 'Efficiency', 'Zero-based', 'zero-success', 0, 30, 100, 'approved', 'cycle-2026', 0, null, null, '2026-05-22T00:00:00.000Z', 0, '2026-02-25T00:00:00.000Z', '2026-05-22T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
  ['goal-021', 'emp-010', 'Owen Brooks', 'Publish Product Analytics Scorecard', 'Create recurring scorecard for activation, retention, and expansion metrics', 'Innovation', 'Timeline', 'date-based', 1, 45, 0, 'approved', 'cycle-2026', 0, null, null, '2026-05-23T00:00:00.000Z', 0, '2026-02-26T00:00:00.000Z', '2026-05-23T00:00:00.000Z', '2026-09-15T00:00:00.000Z'],
  ['goal-022', 'emp-010', 'Owen Brooks', 'Improve Dashboard Adoption', 'Drive weekly active dashboard usage among product teams', 'Customer Success', '%', 'higher-is-better', 80, 35, 42, 'draft', 'cycle-2026', 0, null, null, null, 0, '2026-03-01T00:00:00.000Z', '2026-05-24T00:00:00.000Z', '2026-11-30T00:00:00.000Z'],
  ['goal-023', 'emp-004', 'Priya Nair', 'Stabilize Release Readiness', 'Reduce escaped defects through pre-release quality gates', 'Customer Success', '%', 'higher-is-better', 90, 25, 72, 'approved', 'cycle-2026', 0, null, null, '2026-05-25T00:00:00.000Z', 0, '2026-03-03T00:00:00.000Z', '2026-05-25T00:00:00.000Z', '2026-12-15T00:00:00.000Z'],
  ['goal-024', 'emp-004', 'Priya Nair', 'Complete Test Data Refresh', 'Refresh test data coverage for billing and onboarding journeys', 'Efficiency', 'Timeline', 'date-based', 1, 20, 0, 'pending', 'cycle-2026', 0, null, null, null, 0, '2026-05-08T00:00:00.000Z', '2026-05-25T00:00:00.000Z', '2026-08-15T00:00:00.000Z'],
  ['goal-025', 'emp-011', 'Iris Moreno', 'Improve Expansion Campaign Conversion', 'Lift campaign conversion from strategic customer segments', 'Revenue', '%', 'higher-is-better', 18, 45, 61, 'approved', 'cycle-2026', 0, null, null, '2026-05-24T00:00:00.000Z', 0, '2026-03-04T00:00:00.000Z', '2026-05-24T00:00:00.000Z', '2026-10-31T00:00:00.000Z'],
  ['goal-026', 'emp-011', 'Iris Moreno', 'Launch Win-back Journey', 'Ship a segmented journey for churn-risk customers', 'Customer Success', '%', 'higher-is-better', 70, 35, 28, 'pending', 'cycle-2026', 0, null, null, null, 0, '2026-03-05T00:00:00.000Z', '2026-05-24T00:00:00.000Z', '2026-11-30T00:00:00.000Z'],
  ['goal-027', 'emp-012', 'Dev Patel', 'Automate Governance Data Imports', 'Automate HRIS and goal-cycle data imports for reporting', 'Efficiency', '%', 'higher-is-better', 95, 50, 50, 'approved', 'cycle-2026', 0, null, null, '2026-05-26T00:00:00.000Z', 0, '2026-03-06T00:00:00.000Z', '2026-05-26T00:00:00.000Z', '2026-09-30T00:00:00.000Z'],
  ['goal-028', 'emp-012', 'Dev Patel', 'Reduce Manual Report Prep', 'Cut manual preparation time for monthly governance reports', 'Efficiency', 'Numeric', 'lower-is-better', 4, 30, 35, 'approved', 'cycle-2026', 0, null, null, '2026-05-26T00:00:00.000Z', 0, '2026-03-07T00:00:00.000Z', '2026-05-26T00:00:00.000Z', '2026-12-31T00:00:00.000Z'],
];

const checkIns = [
  ['checkin-001', 'goal-001', 'Q1', 8, 7, 'on-track', 28, null, 'Caching rollout is mostly complete.', json(['runbook.pdf']), null, null, null, '2026-03-28T00:00:00.000Z'],
  ['checkin-002', 'goal-002', 'Q1', 0, 0, 'completed', 100, null, 'No critical incidents reported.', json([]), null, null, null, '2026-03-28T00:00:00.000Z'],
  ['checkin-003', 'goal-004', 'Q1', 15, 14, 'on-track', 100, null, 'Infrastructure cost reduction is ahead of target.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
  ['checkin-004', 'goal-006', 'Q1', 45, 45, 'completed', 100, '2026-08-15T00:00:00.000Z', 'Runbooks completed before deadline.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
  ['checkin-005', 'goal-009', 'Q1', 150000, 175000, 'on-track', 86, null, 'Vendor data arrived late, but spend controls are moving.', json([]), null, null, null, '2026-03-29T00:00:00.000Z'],
  ['checkin-006', 'goal-011', 'Q1', 25, 30, 'on-track', 40, null, 'Guided setup shipped to pilot users.', json(['onboarding-metrics.csv']), json({ discussionSummary: 'Pilot is healthy.', blockersSupportNeeded: 'Need design support for mobile edge cases.', nextActions: 'Expand to the next customer cohort.' }), 'mgr-002', '2026-07-20T00:00:00.000Z', '2026-07-18T00:00:00.000Z'],
  ['checkin-007', 'goal-012', 'Q1', 28, 24, 'on-track', 88, null, 'Cycle time trending down after roadmap triage changes.', json([]), json({ discussionSummary: 'Solid improvement.', blockersSupportNeeded: 'Keep dependency reviews weekly.', nextActions: 'Validate with Q2 release metrics.' }), 'mgr-002', '2026-07-20T00:00:00.000Z', '2026-07-18T00:00:00.000Z'],
  ['checkin-008', 'goal-013', 'Q1', 12, 16, 'completed', 40, null, 'Research panel refreshed and interview cadence improved.', json(['research-plan.docx']), json({ discussionSummary: 'Customer discovery momentum is good.', blockersSupportNeeded: 'Recruiting help for enterprise users.', nextActions: 'Create Q2 synthesis pack.' }), 'mgr-002', '2026-07-21T00:00:00.000Z', '2026-07-19T00:00:00.000Z'],
  ['checkin-009', 'goal-015', 'Q1', 300000, 360000, 'on-track', 30, null, 'Partner campaigns are producing qualified opportunities.', json([]), json({ discussionSummary: 'Pipeline quality is improving.', blockersSupportNeeded: 'Need legal review for co-sell agreement.', nextActions: 'Prioritize top 20 accounts.' }), 'mgr-003', '2026-07-22T00:00:00.000Z', '2026-07-19T00:00:00.000Z'],
  ['checkin-010', 'goal-016', 'Q1', 10, 9, 'on-track', 89, null, 'Forecast inspection cadence helped reduce variance.', json([]), null, null, null, '2026-07-19T00:00:00.000Z'],
  ['checkin-011', 'goal-017', 'Q1', 30, 34, 'on-track', 36, null, 'EBR completion picked up with new account templates.', json(['ebr-tracker.xlsx']), json({ discussionSummary: 'Template adoption is strong.', blockersSupportNeeded: 'Need exec availability for two accounts.', nextActions: 'Close remaining EBRs by next month.' }), 'mgr-003', '2026-07-23T00:00:00.000Z', '2026-07-20T00:00:00.000Z'],
  ['checkin-012', 'goal-018', 'Q1', 15, 14, 'on-track', 86, null, 'Escalations are slightly above target but trending down.', json([]), null, null, null, '2026-07-20T00:00:00.000Z'],
  ['checkin-013', 'goal-019', 'Q1', 50, 65, 'on-track', 65, null, 'Policy refresh drafted and stakeholder reviews started.', json(['policy-refresh.pdf']), json({ discussionSummary: 'Good governance progress.', blockersSupportNeeded: 'Need finance sign-off.', nextActions: 'Prepare employee acknowledgement launch.' }), 'admin-001', '2026-07-24T00:00:00.000Z', '2026-07-20T00:00:00.000Z'],
  ['checkin-014', 'goal-020', 'Q1', 0, 0, 'completed', 100, null, 'No payroll exceptions reported.', json([]), json({ discussionSummary: 'Excellent control discipline.', blockersSupportNeeded: 'None.', nextActions: 'Maintain audit checklist.' }), 'admin-001', '2026-07-24T00:00:00.000Z', '2026-07-20T00:00:00.000Z'],
  ['checkin-015', 'goal-021', 'Q1', 1, 1, 'completed', 100, '2026-09-01T00:00:00.000Z', 'Scorecard prototype completed before deadline.', json(['scorecard-preview.png']), json({ discussionSummary: 'Useful analytics foundation.', blockersSupportNeeded: 'Need product leadership review.', nextActions: 'Automate weekly refresh.' }), 'mgr-002', '2026-07-25T00:00:00.000Z', '2026-07-21T00:00:00.000Z'],
  ['checkin-016', 'goal-023', 'Q1', 35, 65, 'on-track', 72, null, 'Quality gates are in place for the next release train.', json(['release-quality-dashboard.pdf']), json({ discussionSummary: 'Release readiness has improved materially.', blockersSupportNeeded: 'Need platform support for flaky integration tests.', nextActions: 'Close remaining high-risk suites before Q2.' }), 'mgr-001', '2026-07-22T00:00:00.000Z', '2026-07-19T00:00:00.000Z'],
  ['checkin-017', 'goal-025', 'Q1', 6, 11, 'on-track', 61, null, 'Expansion campaigns are resonating with healthcare accounts.', json(['campaign-readout.xlsx']), json({ discussionSummary: 'Strong early signal from segmented messaging.', blockersSupportNeeded: 'Need customer marketing review for enterprise copy.', nextActions: 'Prioritize top-performing segments for Q2.' }), 'mgr-003', '2026-07-24T00:00:00.000Z', '2026-07-21T00:00:00.000Z'],
  ['checkin-018', 'goal-027', 'Q1', 30, 48, 'on-track', 51, null, 'HRIS import mapping is complete; goal-cycle sync is next.', json(['import-mapping.csv']), json({ discussionSummary: 'Good progress on data plumbing.', blockersSupportNeeded: 'Need API access approval for HRIS sandbox.', nextActions: 'Complete automated reconciliation job.' }), 'mgr-002', '2026-07-26T00:00:00.000Z', '2026-07-22T00:00:00.000Z'],
  ['checkin-019', 'goal-028', 'Q1', 10, 12, 'on-track', 33, null, 'Report prep time is improving, but manual validation remains heavy.', json([]), null, null, null, '2026-07-22T00:00:00.000Z'],
];

const escalationRuleSeeds = [
  ['rule-goal-submit', 'Goal sheet not submitted', 'goal-not-submitted', 7, 10, 14, 1],
  ['rule-manager-approval', 'Manager approval overdue', 'manager-not-approved', 5, 7, 10, 1],
  ['rule-quarter-checkin', 'Quarterly check-in incomplete', 'checkin-not-completed', 2, 5, 8, 1],
];

const notificationSeeds = [
  ['notif-001', 'emp-001', 'approval', 'Goal Approved', 'Your goal "Increase API Response Time by 25%" has been approved', '/employee/my-goals', 0, '2026-05-15T00:00:00.000Z'],
  ['notif-002', 'emp-001', 'deadline', 'Deadline Approaching', 'Q2 Check-in deadline is in 3 days', '/employee/checkin', 0, '2026-05-14T00:00:00.000Z'],
  ['notif-003', 'mgr-001', 'approval', 'Approvals waiting', '3 submitted goals need manager review', '/manager/approvals', 0, '2026-05-16T00:00:00.000Z'],
  ['notif-004', 'admin-001', 'deadline', 'Escalations increased', '2 goals are overdue or at risk this cycle', '/admin/escalations', 0, '2026-05-16T00:00:00.000Z'],
  ['notif-005', 'mgr-002', 'checkin', 'Product check-ins ready', '3 product team check-ins are ready for manager comments', '/manager/checkin', 0, '2026-07-19T00:00:00.000Z'],
  ['notif-006', 'mgr-003', 'comment', 'Sales feedback pending', '2 sales team check-ins still need feedback notes', '/manager/checkin', 0, '2026-07-20T00:00:00.000Z'],
  ['notif-007', 'admin-002', 'deadline', 'Governance review', 'Review completion heatmap and unresolved escalations', '/admin/reports', 0, '2026-07-21T00:00:00.000Z'],
  ['notif-008', 'emp-001', 'comment', 'Manager feedback added', 'Sarah added Q1 feedback on your engineering efficiency goal', '/employee/checkin', 0, '2026-07-22T00:00:00.000Z'],
  ['notif-009', 'emp-001', 'checkin', 'Shared KPI needs attention', 'Update evidence for the shared engineering efficiency KPI before Q2 closes', '/employee/shared-goals', 0, '2026-07-23T00:00:00.000Z'],
  ['notif-010', 'mgr-001', 'checkin', 'Priya check-in reviewed', 'Release readiness feedback was saved for Priya Nair', '/manager/checkin', 1, '2026-07-22T00:00:00.000Z'],
  ['notif-011', 'mgr-001', 'approval', 'Rework returned', 'Priya Nair has one goal in rework and one pending review', '/manager/approvals', 0, '2026-05-25T00:00:00.000Z'],
  ['notif-012', 'admin-001', 'comment', 'Locked goal edited', 'Admin override changed the AI Triage Pilot target after lock', '/admin/audit-logs', 0, '2026-07-25T00:00:00.000Z'],
  ['notif-013', 'admin-001', 'checkin', 'Manager comments lagging', 'Several approved goals have employee check-ins without manager comments', '/admin/reports', 0, '2026-07-26T00:00:00.000Z'],
];

const auditLogSeeds = [
  ['audit-seed-001', '2026-05-16T09:15:00.000Z', '2026-05-16T09:15:00.000Z', 'mgr-001', 'Sarah Johnson', 'Approved Goal Sheet', null, null, null, json({ employeeId: 'emp-001', status: 'approved', totalWeightage: 100 }), json([{ field: 'status', before: 'pending', after: 'approved' }]), 0],
  ['audit-seed-002', '2026-05-25T10:00:00.000Z', '2026-05-25T10:00:00.000Z', 'mgr-001', 'Sarah Johnson', 'Requested Goal Sheet Rework', 'goal-010', 'Regression Automation Coverage', json({ status: 'pending' }), json({ status: 'rework', employeeId: 'emp-004' }), json([{ field: 'status', before: 'pending', after: 'rework' }]), 0],
  ['audit-seed-003', '2026-07-22T14:30:00.000Z', '2026-07-22T14:30:00.000Z', 'mgr-001', 'Sarah Johnson', 'Saved Manager Check-in Comment', 'goal-023', 'Stabilize Release Readiness', null, json({ quarter: 'Q1', employeeId: 'emp-004' }), null, 0],
  ['audit-seed-004', '2026-07-25T11:20:00.000Z', '2026-07-25T11:20:00.000Z', 'admin-001', 'Alex Chen', 'Updated Locked Goal', 'goal-008', 'AI Triage Pilot', json({ target: 1 }), json({ target: 2 }), json([{ field: 'target', before: 1, after: 2 }]), 1],
  ['audit-seed-005', '2026-07-26T08:45:00.000Z', '2026-07-26T08:45:00.000Z', 'admin-001', 'Alex Chen', 'Opened Cycle Phase', null, null, null, json({ phase: 'q1Checkin', isOpen: true }), null, 0],
  ['audit-seed-006', '2026-07-26T13:10:00.000Z', '2026-07-26T13:10:00.000Z', 'admin-002', 'Fatima Khan', 'Updated Escalation Status', null, null, null, json({ condition: 'checkin-not-completed', status: 'monitoring' }), null, 0],
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
    CREATE TABLE IF NOT EXISTS delivery_outbox (
      id TEXT PRIMARY KEY, event_key TEXT NOT NULL, channel TEXT NOT NULL, recipient_id TEXT NOT NULL, recipient_address TEXT,
      payload TEXT NOT NULL, status TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(event_key, channel, recipient_id)
    );
    CREATE TABLE IF NOT EXISTS teams_conversation_refs (
      user_id TEXT PRIMARY KEY, aad_object_id TEXT, conversation_id TEXT NOT NULL, service_url TEXT NOT NULL, tenant_id TEXT,
      bot_id TEXT, reference_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS escalation_rules (id TEXT PRIMARY KEY, name TEXT NOT NULL, condition TEXT NOT NULL, threshold_days INTEGER NOT NULL, manager_after_days INTEGER NOT NULL, hr_after_days INTEGER NOT NULL, active INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS escalation_status_overrides (id TEXT PRIMARY KEY, status TEXT NOT NULL);
  `);

  if (db.prepare('SELECT COUNT(*) AS count FROM escalation_rules').get().count === 0) {
    const insertRule = db.prepare('INSERT INTO escalation_rules VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    escalationRuleSeeds.forEach((row) => insertRule.run(...row, nowIso(), nowIso()));
  }

  if (db.prepare('SELECT COUNT(*) AS count FROM users').get().count === 0) {
    const insertUser = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    users.forEach((row) => insertUser.run(...row));
    db.prepare('INSERT INTO cycles VALUES (?, ?, ?, ?, ?, ?, ?)').run('cycle-2026', 'FY 2026', 2026, '2026-05-01T00:00:00.000Z', '2027-04-30T00:00:00.000Z', json(phaseJson), 1);
    const insertGoal = db.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    goals.forEach((row) => insertGoal.run(...row));
    const insertCheckIn = db.prepare('INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    checkIns.forEach((row) => insertCheckIn.run(...row));
    notificationSeeds.forEach((row) => db.prepare('INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(...row));
    auditLogSeeds.forEach((row) => db.prepare('INSERT INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(...row));
    addAudit({ userId: 'system', userName: 'Seeder', action: 'Seeded Demo Data', after: { goals: goals.length } });
  }

  const ensureUser = db.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  users.forEach((row) => ensureUser.run(...row));
  db.prepare('INSERT OR IGNORE INTO cycles VALUES (?, ?, ?, ?, ?, ?, ?)').run('cycle-2026', 'FY 2026', 2026, '2026-05-01T00:00:00.000Z', '2027-04-30T00:00:00.000Z', json(phaseJson), 1);
  const ensureGoal = db.prepare('INSERT OR IGNORE INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  goals.forEach((row) => ensureGoal.run(...row));
  const ensureCheckIn = db.prepare('INSERT OR IGNORE INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  checkIns.forEach((row) => ensureCheckIn.run(...row));
  const ensureNotification = db.prepare('INSERT OR IGNORE INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  notificationSeeds.forEach((row) => ensureNotification.run(...row));
  const ensureAuditLog = db.prepare('INSERT OR IGNORE INTO audit_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  auditLogSeeds.forEach((row) => ensureAuditLog.run(...row));
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
const mapEscalationRule = (row) => ({ id: row.id, name: row.name, condition: row.condition, thresholdDays: row.threshold_days, managerAfterDays: row.manager_after_days, hrAfterDays: row.hr_after_days, active: Boolean(row.active), createdAt: row.created_at, updatedAt: row.updated_at });
const mapDelivery = (row) => ({ id: row.id, eventKey: row.event_key, channel: row.channel, recipientId: row.recipient_id, recipientAddress: row.recipient_address || undefined, payload: parseJson(row.payload, {}), status: row.status, attempts: row.attempts, error: row.error || undefined, createdAt: row.created_at, updatedAt: row.updated_at });

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

function forbidden(message = 'Forbidden') {
  const err = new Error(message);
  err.status = 403;
  return err;
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

function inclusiveWindowContains(phase, now = new Date()) {
  if (!phase?.start || !phase?.end) return false;
  const start = new Date(phase.start);
  const end = new Date(phase.end);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return now >= start && now <= end;
}

function checkInWindow(cycleId, quarter) {
  const phaseKey = quarterPhaseMap[quarter];
  if (!phaseKey) return { ok: false, status: 422, error: 'Invalid quarter.' };
  const cycle = activeCycle(cycleId);
  if (!cycle) return { ok: false, status: 404, error: 'Cycle not found.' };
  const phase = parseJson(cycle.phases, {})[phaseKey];
  if (!phase) return { ok: false, status: 409, error: `${quarter} check-in window is not configured.` };
  if (!phase.isOpen || !inclusiveWindowContains(phase)) return { ok: false, status: 409, error: `${quarter} check-in window is closed.` };
  return { ok: true, cycle: mapCycle(cycle), phaseKey, phase };
}

function isDirectReport(managerId, employeeId) {
  return Boolean(db.prepare('SELECT 1 FROM users WHERE id = ? AND manager_id = ?').get(employeeId, managerId));
}

function canAccessEmployee(user, employeeId) {
  if (user.role === 'admin') return true;
  if (user.role === 'manager') return isDirectReport(user.id, employeeId);
  return user.id === employeeId;
}

function requireEmployeeAccess(user, employeeId, message = 'You cannot access this employee.') {
  if (!canAccessEmployee(user, employeeId)) throw forbidden(message);
}

function userScope(user) {
  if (user.role === 'admin') return { clause: '1 = 1', params: [] };
  if (user.role === 'manager') return { clause: 'employee_id IN (SELECT id FROM users WHERE manager_id = ?)', params: [user.id] };
  return { clause: 'employee_id = ?', params: [user.id] };
}

function teamMemberScope(user) {
  if (user.role === 'admin') return { clause: "role = 'employee'", params: [] };
  if (user.role === 'manager') return { clause: "role = 'employee' AND manager_id = ?", params: [user.id] };
  return { clause: 'id = ?', params: [user.id] };
}

function isStructuredManagerComment(comment) {
  return Boolean(
    comment &&
    typeof comment === 'object' &&
    managerCommentFields.every((field) => typeof comment[field] === 'string')
  );
}

function createsManagementLoop(userId, managerId) {
  let current = managerId;
  const seen = new Set();
  while (current) {
    if (current === userId) return true;
    if (seen.has(current)) return true;
    seen.add(current);
    current = db.prepare('SELECT manager_id FROM users WHERE id = ?').get(current)?.manager_id;
  }
  return false;
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

function getUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row ? mapUser(row) : undefined;
}

function managerForEmployee(employeeId) {
  const employee = getUserById(employeeId);
  return employee?.managerId ? getUserById(employee.managerId) : undefined;
}

function absoluteAppUrl(pathName) {
  if (/^https?:\/\//i.test(pathName)) return pathName;
  return `${appBaseUrl}${pathName.startsWith('/') ? pathName : `/${pathName}`}`;
}

function teamsDeepLink(pathName, label) {
  const webUrl = absoluteAppUrl(pathName);
  if (!process.env.TEAMS_APP_ID) return webUrl;
  const entityId = encodeURIComponent(pathName.split('?')[0].replace(/^\//, '') || 'home');
  const params = new URLSearchParams({
    webUrl,
    label: label || 'Pheonix',
  });
  if (process.env.MS_TENANT_ID) params.set('tenantId', process.env.MS_TENANT_ID);
  return `https://teams.microsoft.com/l/entity/${process.env.TEAMS_APP_ID}/${entityId}?${params.toString()}`;
}

function addNotification({ eventKey, userId, type, title, message, link }) {
  const id = `notif-${eventKey}-${userId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  db.prepare('INSERT OR IGNORE INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, userId, type, title, message, link, 0, nowIso());
  return id;
}

function emailPayload({ subject, body, link, recipient }) {
  return {
    subject,
    body,
    link: absoluteAppUrl(link),
    message: {
      subject,
      body: {
        contentType: 'HTML',
        content: `<p>${body}</p><p><a href="${absoluteAppUrl(link)}">Open in Pheonix</a></p>`,
      },
      toRecipients: [{ emailAddress: { address: recipient.email, name: recipient.name } }],
    },
    saveToSentItems: false,
  };
}

function teamsCardPayload({ title, body, link, facts = [] }) {
  const url = teamsDeepLink(link, title);
  return {
    type: 'message',
    attachments: [{
      contentType: 'application/vnd.microsoft.card.adaptive',
      content: {
        $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
        type: 'AdaptiveCard',
        version: '1.5',
        body: [
          { type: 'TextBlock', text: title, weight: 'Bolder', size: 'Medium', wrap: true },
          { type: 'TextBlock', text: body, wrap: true },
          ...(facts.length ? [{ type: 'FactSet', facts }] : []),
        ],
        actions: [{ type: 'Action.OpenUrl', title: 'Open in Pheonix', url }],
      },
    }],
  };
}

function enqueueDelivery({ eventKey, channel, recipient, payload }) {
  if (!validDeliveryChannels.has(channel) || !recipient?.id) return undefined;
  const id = `delivery-${eventKey}-${channel}-${recipient.id}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  const createdAt = nowIso();
  db.prepare(`
    INSERT OR IGNORE INTO delivery_outbox VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, eventKey, channel, recipient.id, recipient.email || null, json(payload), 'queued', 0, null, createdAt, createdAt);
  const row = db.prepare('SELECT * FROM delivery_outbox WHERE id = ?').get(id);
  if (row?.status === 'queued') {
    prepareDeliveryAttempt(mapDelivery(row));
  }
  return id;
}

function markDelivery(id, status, attempts, error = null) {
  db.prepare('UPDATE delivery_outbox SET status = ?, attempts = ?, error = ?, updated_at = ? WHERE id = ?').run(status, attempts, error, nowIso(), id);
}

async function graphAccessToken() {
  if (!process.env.MS_TENANT_ID || !process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET) {
    throw new Error('Microsoft Graph credentials are not configured.');
  }
  const response = await fetch(`https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID,
      client_secret: process.env.MS_CLIENT_SECRET,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error_description || payload.error || 'Unable to get Microsoft Graph token.');
  return payload.access_token;
}

async function botAccessToken() {
  if (!process.env.TEAMS_BOT_ID || !process.env.TEAMS_BOT_PASSWORD) {
    throw new Error('Teams bot credentials are not configured.');
  }
  const response = await fetch('https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TEAMS_BOT_ID,
      client_secret: process.env.TEAMS_BOT_PASSWORD,
      scope: 'https://api.botframework.com/.default',
      grant_type: 'client_credentials',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error_description || payload.error || 'Unable to get Bot Framework token.');
  return payload.access_token;
}

async function deliverEmail(delivery) {
  if (!process.env.MS_MAIL_SENDER_UPN) throw new Error('MS_MAIL_SENDER_UPN is not configured.');
  const token = await graphAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${encodeURIComponent(process.env.MS_MAIL_SENDER_UPN)}/sendMail`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: delivery.payload.message, saveToSentItems: false }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Graph sendMail failed with ${response.status}.`);
  }
}

async function deliverTeams(delivery) {
  const ref = db.prepare('SELECT * FROM teams_conversation_refs WHERE user_id = ?').get(delivery.recipientId);
  if (!ref) throw new Error('No Teams conversation reference found. The manager must install or message the bot first.');
  const token = await botAccessToken();
  const base = ref.service_url.replace(/\/$/, '');
  const response = await fetch(`${base}/v3/conversations/${encodeURIComponent(ref.conversation_id)}/activities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(delivery.payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Teams proactive send failed with ${response.status}.`);
  }
}

function prepareDeliveryAttempt(delivery) {
  if (delivery.channel === 'teams' && !db.prepare('SELECT 1 FROM teams_conversation_refs WHERE user_id = ?').get(delivery.recipientId)) {
    markDelivery(delivery.id, 'failed', delivery.attempts + 1, 'No Teams conversation reference found. The manager must install or message the bot first.');
    return;
  }
  if (delivery.channel === 'email' && (!process.env.MS_MAIL_SENDER_UPN || !process.env.MS_TENANT_ID || !process.env.MS_CLIENT_ID || !process.env.MS_CLIENT_SECRET)) {
    db.prepare('UPDATE delivery_outbox SET error = ?, updated_at = ? WHERE id = ?').run('Microsoft Graph mail credentials are not configured; delivery remains queued.', nowIso(), delivery.id);
    return;
  }
  const attempt = delivery.channel === 'email' ? deliverEmail(delivery) : deliverTeams(delivery);
  attempt
    .then(() => markDelivery(delivery.id, 'sent', delivery.attempts + 1, null))
    .catch((error) => {
      const attempts = delivery.attempts + 1;
      markDelivery(delivery.id, attempts >= notificationRetryLimit ? 'failed' : 'queued', attempts, error.message);
    });
}

function queueEmail(eventKey, recipient, subject, body, link) {
  return enqueueDelivery({ eventKey, channel: 'email', recipient, payload: emailPayload({ subject, body, link, recipient }) });
}

function queueTeamsCard(eventKey, recipient, title, body, link, facts = []) {
  return enqueueDelivery({ eventKey, channel: 'teams', recipient, payload: teamsCardPayload({ title, body, link, facts }) });
}

function notifyGoalSubmitted(employeeId, cycleId) {
  const employee = getUserById(employeeId);
  const manager = managerForEmployee(employeeId);
  if (!employee || !manager) return;
  const link = `/manager/approvals?employeeId=${encodeURIComponent(employeeId)}${cycleId ? `&cycleId=${encodeURIComponent(cycleId)}` : ''}`;
  const eventKey = `goal-submitted-${employeeId}-${cycleId || 'active'}`;
  const message = `${employee.name} submitted a goal sheet for review.`;
  addNotification({ eventKey, userId: manager.id, type: 'submission', title: 'Goal sheet submitted', message, link });
  queueEmail(eventKey, manager, 'Goal sheet submitted', message, link);
  queueTeamsCard(eventKey, manager, 'Goal sheet submitted', message, link, [{ title: 'Employee', value: employee.name }]);
}

function notifyGoalDecision(employeeId, cycleId, approved) {
  const employee = getUserById(employeeId);
  if (!employee) return;
  const link = `/employee/my-goals${cycleId ? `?cycleId=${encodeURIComponent(cycleId)}` : ''}`;
  const eventKey = `goal-${approved ? 'approved' : 'returned'}-${employeeId}-${cycleId || 'active'}`;
  const title = approved ? 'Goal sheet approved' : 'Goal sheet returned for rework';
  const message = approved ? 'Your goal sheet has been approved and locked.' : 'Your manager returned your goal sheet for updates.';
  addNotification({ eventKey, userId: employee.id, type: approved ? 'approval' : 'rework', title, message, link });
  queueEmail(eventKey, employee, title, message, link);
}

function notifyGoalUpdatedForManager(goal) {
  const manager = managerForEmployee(goal.employeeId);
  if (!manager) return;
  const link = `/manager/approvals?employeeId=${encodeURIComponent(goal.employeeId)}&cycleId=${encodeURIComponent(goal.cycleId)}`;
  const eventKey = `goal-updated-${goal.id}-${Date.now()}`;
  const message = `${goal.employeeName} updated "${goal.title}".`;
  queueEmail(eventKey, manager, 'Goal updated', message, link);
  queueTeamsCard(eventKey, manager, 'Goal updated', message, link, [{ title: 'Employee', value: goal.employeeName }, { title: 'Goal', value: goal.title }]);
}

function notifyCheckInSubmitted(goal, quarter) {
  const manager = managerForEmployee(goal.employeeId);
  if (!manager) return;
  const link = `/manager/checkin?employeeId=${encodeURIComponent(goal.employeeId)}&goalId=${encodeURIComponent(goal.id)}&quarter=${encodeURIComponent(quarter)}`;
  const eventKey = `checkin-submitted-${goal.id}-${quarter}`;
  const message = `${goal.employeeName} submitted a ${quarter} check-in for "${goal.title}".`;
  queueEmail(eventKey, manager, `${quarter} check-in submitted`, message, link);
  queueTeamsCard(eventKey, manager, `${quarter} check-in submitted`, message, link, [{ title: 'Employee', value: goal.employeeName }, { title: 'Goal', value: goal.title }]);
}

function runCheckInReminders() {
  const today = new Date();
  const dateKey = today.toISOString().slice(0, 10);
  const activeCycles = db.prepare('SELECT * FROM cycles WHERE is_active = 1').all().map(mapCycle);
  const inserted = [];
  activeCycles.forEach((cycle) => {
    Object.entries(quarterPhaseMap).forEach(([quarter, phaseKey]) => {
      const phase = cycle.phases?.[phaseKey];
      if (!phase?.isOpen) return;
      const start = new Date(phase.start);
      const end = new Date(phase.end);
      if (today < start || today > end) return;
      const daysRemaining = Math.ceil((end.getTime() - today.getTime()) / 86400000);
      if (daysRemaining > reminderWindowDays) return;
      const rows = db.prepare(`
        SELECT g.employee_id AS employeeId, COUNT(*) AS missingCount
        FROM goals g
        WHERE g.status = 'approved' AND g.cycle_id = ?
          AND NOT EXISTS (SELECT 1 FROM check_ins ci WHERE ci.goal_id = g.id AND ci.quarter = ? AND ci.submitted_at IS NOT NULL)
        GROUP BY g.employee_id
      `).all(cycle.id, quarter);
      rows.forEach((row) => {
        const employee = getUserById(row.employeeId);
        if (!employee) return;
        const link = `/employee/checkin?quarter=${encodeURIComponent(quarter)}`;
        const eventKey = `checkin-reminder-${dateKey}-${quarter}-${employee.id}`;
        const id = queueEmail(eventKey, employee, `${quarter} check-in reminder`, `${row.missingCount} approved goal check-in(s) are still incomplete.`, link);
        if (id) inserted.push(id);
      });
    });
  });
  return inserted;
}

function integrationStatus() {
  const failedDeliveries = db.prepare("SELECT COUNT(*) AS count FROM delivery_outbox WHERE status = 'failed'").get().count;
  const queuedDeliveries = db.prepare("SELECT COUNT(*) AS count FROM delivery_outbox WHERE status = 'queued'").get().count;
  const conversationReferences = db.prepare('SELECT COUNT(*) AS count FROM teams_conversation_refs').get().count;
  return {
    graphMail: {
      configured: Boolean(process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET && process.env.MS_MAIL_SENDER_UPN),
      sender: process.env.MS_MAIL_SENDER_UPN || null,
    },
    teamsBot: {
      configured: Boolean(process.env.TEAMS_BOT_ID && process.env.TEAMS_BOT_PASSWORD),
      appIdConfigured: Boolean(process.env.TEAMS_APP_ID),
      conversationReferences,
    },
    deliveryOutbox: {
      queued: queuedDeliveries,
      failed: failedDeliveries,
      retryLimit: notificationRetryLimit,
    },
  };
}

function managerName(managerId) {
  if (!managerId) return 'Unassigned';
  return db.prepare('SELECT name FROM users WHERE id = ?').get(managerId)?.name || managerId;
}

function getReportGoals(user) {
  const scope = userScope(user);
  return db.prepare(`SELECT * FROM goals WHERE ${scope.clause} ORDER BY employee_name, title`).all(...scope.params).map(mapGoal);
}

function getScopedTeamMembers(user) {
  const scope = teamMemberScope(user);
  return db.prepare(`SELECT * FROM users WHERE ${scope.clause} ORDER BY name`).all(...scope.params).map(mapTeamMember);
}

function buildAchievementRows(user, filters = {}) {
  const quarter = filters.quarter || 'Q1';
  const goals = getReportGoals(user);
  return goals
    .map((goal) => {
      const member = db.prepare('SELECT * FROM users WHERE id = ?').get(goal.employeeId);
      const checkIn = db.prepare('SELECT * FROM check_ins WHERE goal_id = ? AND quarter = ?').get(goal.id, quarter);
      const row = {
        employeeId: goal.employeeId,
        employeeName: goal.employeeName,
        managerId: member?.manager_id || null,
        managerName: managerName(member?.manager_id),
        departmentId: member?.department_id || null,
        departmentName: member?.department_name || 'Unassigned',
        quarter,
        goalId: goal.id,
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        unitOfMeasure: goal.unitOfMeasure,
        status: goal.status,
        target: goal.target,
        plannedValue: checkIn?.planned_value ?? 'Not submitted',
        actualValue: checkIn?.actual_value ?? 'Not submitted',
        progressScore: checkIn?.progress_score ?? 0,
        checkInStatus: checkIn?.status || 'not-started',
        submittedAt: checkIn?.submitted_at || null,
        managerCommentedAt: checkIn?.manager_commented_at || null,
      };
      return row;
    })
    .filter((row) => !filters.department || row.departmentName === filters.department || row.departmentId === filters.department)
    .filter((row) => !filters.managerId || row.managerId === filters.managerId)
    .filter((row) => !filters.status || row.status === filters.status);
}

function buildCompletionRows(user, filters = {}) {
  const quarter = filters.quarter || 'Q1';
  return getScopedTeamMembers(user)
    .filter((member) => !filters.department || member.departmentName === filters.department || member.departmentId === filters.department)
    .filter((member) => !filters.managerId || member.managerId === filters.managerId)
    .map((member) => {
      const approvedGoals = db.prepare("SELECT * FROM goals WHERE employee_id = ? AND status = 'approved'").all(member.id).map(mapGoal);
      const goalIds = new Set(approvedGoals.map((goal) => goal.id));
      const checkIns = db.prepare('SELECT * FROM check_ins WHERE quarter = ?').all(quarter).filter((checkIn) => goalIds.has(checkIn.goal_id));
      const employeeSubmitted = checkIns.filter((checkIn) => Boolean(checkIn.submitted_at)).length;
      const managerCompleted = checkIns.filter((checkIn) => Boolean(checkIn.manager_commented_at)).length;
      const employeeCompletionRate = approvedGoals.length ? Math.round((employeeSubmitted / approvedGoals.length) * 100) : 0;
      const managerCompletionRate = approvedGoals.length ? Math.round((managerCompleted / approvedGoals.length) * 100) : 0;
      return {
        employeeId: member.id,
        employeeName: member.name,
        managerId: member.managerId,
        managerName: managerName(member.managerId),
        departmentId: member.departmentId,
        departmentName: member.departmentName,
        quarter,
        approvedGoals: approvedGoals.length,
        employeeSubmitted,
        managerCompleted,
        employeeCompletionRate,
        managerCompletionRate,
        status: employeeCompletionRate < 100 ? 'employee-pending' : managerCompletionRate < 100 ? 'manager-pending' : 'complete',
      };
    });
}

function daysBetween(start, end = new Date()) {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000));
}

function escalationLevel(rule, ageDays) {
  if (ageDays >= rule.hrAfterDays) return 'hr';
  if (ageDays >= rule.managerAfterDays) return 'manager';
  return 'employee';
}

function escalationNotificationTargets(log) {
  if (log.currentLevel === 'hr') {
    return db.prepare("SELECT id FROM users WHERE role = 'admin'").all().map((row) => row.id);
  }
  if (log.currentLevel === 'manager') return log.managerId ? [log.managerId] : [];
  return [log.employeeId];
}

function getEscalationRules() {
  return db.prepare('SELECT * FROM escalation_rules ORDER BY id').all().map(mapEscalationRule);
}

function getStatusOverrides() {
  return Object.fromEntries(db.prepare('SELECT * FROM escalation_status_overrides').all().map((row) => [row.id, row.status]));
}

function buildEscalationLogs(filters = {}, now = new Date()) {
  const cycle = activeCycle();
  if (!cycle) return [];
  const cycleData = mapCycle(cycle);
  const phases = parseJson(cycle.phases, {});
  const rules = getEscalationRules().filter((rule) => rule.active);
  const overrides = getStatusOverrides();
  const members = db.prepare("SELECT * FROM users WHERE role = 'employee' ORDER BY name").all().map(mapTeamMember);
  const goals = db.prepare('SELECT * FROM goals WHERE cycle_id = ? ORDER BY employee_name, title').all(cycle.id).map(mapGoal);

  const logs = rules.flatMap((rule) => {
    if (rule.condition === 'goal-not-submitted') {
      const start = new Date(phases.goalSetting?.start || cycle.start_date);
      const age = daysBetween(start, now);
      if (age < rule.thresholdDays) return [];
      return members
        .filter((member) => {
          const sheet = goals.filter((goal) => goal.employeeId === member.id);
          return sheet.length === 0 || sheet.some((goal) => goal.status === 'draft' || goal.status === 'rework');
        })
        .map((member) => {
          const id = `${rule.id}-${member.id}`;
          const log = {
            id,
            ruleId: rule.id,
            ruleName: rule.name,
            condition: rule.condition,
            employeeId: member.id,
            employeeName: member.name,
            managerId: member.managerId,
            managerName: managerName(member.managerId),
            departmentId: member.departmentId,
            departmentName: member.departmentName,
            currentLevel: escalationLevel(rule, age),
            reason: `Goals are not fully submitted ${age} day(s) after cycle open.`,
            status: overrides[id] || 'open',
            triggeredAt: start.toISOString(),
            ageDays: age,
          };
          return { ...log, notificationTargets: escalationNotificationTargets(log) };
        });
    }

    if (rule.condition === 'manager-not-approved') {
      return goals
        .filter((goal) => goal.status === 'pending')
        .map((goal) => {
          const age = daysBetween(new Date(goal.updatedAt), now);
          if (age < rule.thresholdDays) return null;
          const member = db.prepare('SELECT * FROM users WHERE id = ?').get(goal.employeeId);
          const id = `${rule.id}-${goal.id}`;
          const log = {
            id,
            ruleId: rule.id,
            ruleName: rule.name,
            condition: rule.condition,
            employeeId: goal.employeeId,
            employeeName: goal.employeeName,
            managerId: member?.manager_id || null,
            managerName: managerName(member?.manager_id),
            departmentId: member?.department_id || null,
            departmentName: member?.department_name || 'Unassigned',
            goalId: goal.id,
            goalTitle: goal.title,
            currentLevel: escalationLevel(rule, age),
            reason: `Manager approval is pending ${age} day(s) after submission.`,
            status: overrides[id] || 'open',
            triggeredAt: goal.updatedAt,
            ageDays: age,
          };
          return { ...log, notificationTargets: escalationNotificationTargets(log) };
        })
        .filter(Boolean);
    }

    return Object.entries(quarterPhaseMap).flatMap(([quarter, phaseKey]) => {
      const phase = phases[phaseKey];
      if (!phase || phase.isOpen || now <= new Date(phase.end)) return [];
      const age = daysBetween(new Date(phase.end), now);
      if (age < rule.thresholdDays) return [];
      return goals
        .filter((goal) => goal.status === 'approved')
        .filter((goal) => !db.prepare('SELECT 1 FROM check_ins WHERE goal_id = ? AND quarter = ? AND submitted_at IS NOT NULL').get(goal.id, quarter))
        .map((goal) => {
          const member = db.prepare('SELECT * FROM users WHERE id = ?').get(goal.employeeId);
          const id = `${rule.id}-${goal.id}-${quarter}`;
          const log = {
            id,
            ruleId: rule.id,
            ruleName: rule.name,
            condition: rule.condition,
            employeeId: goal.employeeId,
            employeeName: goal.employeeName,
            managerId: member?.manager_id || null,
            managerName: managerName(member?.manager_id),
            departmentId: member?.department_id || null,
            departmentName: member?.department_name || 'Unassigned',
            goalId: goal.id,
            goalTitle: goal.title,
            quarter,
            currentLevel: escalationLevel(rule, age),
            reason: `${quarter} check-in is incomplete ${age} day(s) after the window closed.`,
            status: overrides[id] || 'open',
            triggeredAt: phase.end,
            ageDays: age,
          };
          return { ...log, notificationTargets: escalationNotificationTargets(log) };
        });
    });
  });

  return logs
    .filter((log) => !filters.status || log.status === filters.status)
    .filter((log) => !filters.level || log.currentLevel === filters.level)
    .filter((log) => !filters.condition || log.condition === filters.condition)
    .map((log) => ({ ...log, cycleId: cycleData.id, cycleName: cycleData.name }));
}

function scopedGoalsForAnalytics(user) {
  return getReportGoals(user);
}

function scopedTeamMembersForAnalytics(user) {
  return getScopedTeamMembers(user);
}

function average(values) {
  const clean = values.filter((value) => Number.isFinite(value));
  return clean.length ? Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length) : 0;
}

function buildQoqAnalytics(user, filters = {}) {
  const scope = filters.scope || (user.role === 'employee' ? 'individual' : 'team');
  const goals = scopedGoalsForAnalytics(user).filter((goal) => {
    if (scope === 'individual') return goal.employeeId === (filters.employeeId || user.id);
    if (scope === 'team') {
      const managerId = user.role === 'manager' ? user.id : filters.managerId;
      if (!managerId) return true;
      return isDirectReport(managerId, goal.employeeId);
    }
    if (scope === 'department') {
      const member = db.prepare('SELECT * FROM users WHERE id = ?').get(goal.employeeId);
      return !filters.department || member?.department_name === filters.department || member?.department_id === filters.department;
    }
    return true;
  });
  const goalIds = new Set(goals.map((goal) => goal.id));
  return Object.keys(quarterPhaseMap).map((quarter) => {
    const checkIns = db.prepare('SELECT * FROM check_ins WHERE quarter = ?').all(quarter).filter((checkIn) => goalIds.has(checkIn.goal_id));
    const approved = goals.filter((goal) => goal.status === 'approved').length;
    return {
      quarter,
      scope,
      averageAchievement: average(checkIns.map((checkIn) => Number(checkIn.progress_score))),
      checkInCompletion: approved ? Math.round((checkIns.filter((checkIn) => checkIn.submitted_at).length / approved) * 100) : 0,
      managerCompletion: approved ? Math.round((checkIns.filter((checkIn) => checkIn.manager_commented_at).length / approved) * 100) : 0,
      submittedCount: checkIns.filter((checkIn) => checkIn.submitted_at).length,
      approvedGoals: approved,
    };
  });
}

function buildCompletionHeatmap(user, quarter = 'Q1') {
  const members = scopedTeamMembersForAnalytics(user);
  const groups = new Map();
  members.forEach((member) => {
    const key = `${member.departmentName || 'Unassigned'}|${member.managerId || 'unassigned'}`;
    if (!groups.has(key)) {
      groups.set(key, {
        departmentId: member.departmentId,
        departmentName: member.departmentName || 'Unassigned',
        managerId: member.managerId || null,
        managerName: managerName(member.managerId),
        employees: [],
      });
    }
    groups.get(key).employees.push(member);
  });
  return Array.from(groups.values()).map((group) => {
    const approvedGoals = group.employees.flatMap((member) => db.prepare("SELECT * FROM goals WHERE employee_id = ? AND status = 'approved'").all(member.id));
    const goalIds = new Set(approvedGoals.map((goal) => goal.id));
    const checkIns = db.prepare('SELECT * FROM check_ins WHERE quarter = ?').all(quarter).filter((checkIn) => goalIds.has(checkIn.goal_id));
    return {
      departmentId: group.departmentId,
      departmentName: group.departmentName,
      managerId: group.managerId,
      managerName: group.managerName,
      quarter,
      employeeCount: group.employees.length,
      approvedGoals: approvedGoals.length,
      employeeCompletionRate: approvedGoals.length ? Math.round((checkIns.filter((checkIn) => checkIn.submitted_at).length / approvedGoals.length) * 100) : 0,
      managerCompletionRate: approvedGoals.length ? Math.round((checkIns.filter((checkIn) => checkIn.manager_commented_at).length / approvedGoals.length) * 100) : 0,
    };
  });
}

function bucketCounts(items, keyFn) {
  return Object.entries(items.reduce((acc, item) => {
    const key = keyFn(item) || 'Unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
}

function buildGoalDistribution(user) {
  const goals = scopedGoalsForAnalytics(user);
  return {
    thrustAreas: bucketCounts(goals, (goal) => goal.thrustArea),
    uomTypes: bucketCounts(goals, (goal) => goal.unitOfMeasure),
    statuses: bucketCounts(goals, (goal) => goal.status),
  };
}

function buildManagerEffectiveness(user, quarter = 'Q1') {
  const managers = user.role === 'manager'
    ? [db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)].filter(Boolean)
    : db.prepare("SELECT * FROM users WHERE role = 'manager' ORDER BY name").all();
  return managers.map((manager) => {
    const members = db.prepare("SELECT * FROM users WHERE role = 'employee' AND manager_id = ?").all(manager.id).map(mapTeamMember);
    const approvedGoals = members.flatMap((member) => db.prepare("SELECT * FROM goals WHERE employee_id = ? AND status = 'approved'").all(member.id));
    const goalIds = new Set(approvedGoals.map((goal) => goal.id));
    const checkIns = db.prepare('SELECT * FROM check_ins WHERE quarter = ?').all(quarter).filter((checkIn) => goalIds.has(checkIn.goal_id));
    return {
      managerId: manager.id,
      managerName: manager.name,
      departmentId: manager.department_id || null,
      departmentName: manager.department_name || 'Unassigned',
      quarter,
      employees: members.length,
      approvedGoals: approvedGoals.length,
      employeeCompletion: approvedGoals.length ? Math.round((checkIns.filter((checkIn) => checkIn.submitted_at).length / approvedGoals.length) * 100) : 0,
      managerCompletion: approvedGoals.length ? Math.round((checkIns.filter((checkIn) => checkIn.manager_commented_at).length / approvedGoals.length) * 100) : 0,
    };
  });
}

function buildOrgHierarchy() {
  const users = db.prepare('SELECT * FROM users ORDER BY department_name, role, name').all().map(mapUser);
  const departments = new Map();
  users.filter((user) => user.role === 'employee' || user.role === 'manager').forEach((user) => {
    const departmentId = user.departmentId || 'unassigned';
    const departmentName = user.departmentName || 'Unassigned';
    if (!departments.has(departmentId)) {
      departments.set(departmentId, { id: departmentId, name: departmentName, type: 'department', children: [] });
    }
  });
  const managers = users.filter((user) => user.role === 'manager');
  departments.forEach((department) => {
    const departmentManagers = managers.filter((manager) => (manager.departmentId || 'unassigned') === department.id);
    department.children = departmentManagers.map((manager) => ({
      id: manager.id,
      name: manager.name,
      title: manager.title,
      email: manager.email,
      type: 'manager',
      children: users
        .filter((employee) => employee.role === 'employee' && employee.managerId === manager.id)
        .map((employee) => ({ id: employee.id, name: employee.name, title: employee.title, email: employee.email, type: 'employee' })),
    }));
    const unmanaged = users
      .filter((employee) => employee.role === 'employee' && (employee.departmentId || 'unassigned') === department.id && !employee.managerId)
      .map((employee) => ({ id: employee.id, name: employee.name, title: employee.title, email: employee.email, type: 'employee' }));
    if (unmanaged.length) department.children.push({ id: `${department.id}-unassigned`, name: 'Unassigned Manager', type: 'manager', children: unmanaged });
  });
  return { id: 'company', name: 'Company', type: 'company', children: Array.from(departments.values()) };
}

function getAuditLogs(filters = {}) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all()
    .map(mapAudit)
    .filter((log) => !filters.action || log.action === filters.action)
    .filter((log) => !filters.userId || log.userId === filters.userId)
    .filter((log) => !filters.goalId || log.goalId === filters.goalId)
    .filter((log) => !filters.lockedOnly || log.changedAfterLock);
}

function bootstrap(user = { role: 'admin' }) {
  const activities = [
    { id: 'activity-001', title: 'Goal approved', description: 'Increase API Response Time by 25% was approved by Sarah Johnson.', tone: 'success', createdAt: '2026-05-16T09:15:00.000Z', link: '/employee/my-goals' },
    { id: 'activity-002', title: 'Q2 check-in window', description: 'Employee check-ins are due in 5 days.', tone: 'warning', createdAt: '2026-05-15T12:00:00.000Z', link: '/employee/checkin' },
    { id: 'activity-003', title: 'Analytics refreshed', description: 'Team completion trends were recalculated for FY 2026.', tone: 'analytics', createdAt: '2026-05-15T08:00:00.000Z', link: '/manager/analytics' },
    { id: 'activity-004', title: 'Escalation opened', description: 'Cloud Cost Guardrails is overdue and below target progress.', tone: 'error', createdAt: '2026-05-14T15:00:00.000Z', link: '/admin/escalations' },
  ];
  const escalationLogs = user.role === 'admin' ? buildEscalationLogs() : [];
  const escalations = escalationLogs.slice(0, 5).map((log) => ({
    id: log.id,
    title: log.goalTitle || log.ruleName,
    owner: log.employeeName,
    severity: log.currentLevel === 'hr' ? 'high' : log.currentLevel === 'manager' ? 'medium' : 'low',
    reason: log.reason,
    status: log.status,
    createdAt: log.triggeredAt,
  }));
  return {
    goals: getReportGoals(user),
    cycles: db.prepare('SELECT * FROM cycles ORDER BY year DESC').all().map(mapCycle),
    checkIns: db.prepare(`SELECT ci.* FROM check_ins ci JOIN goals g ON g.id = ci.goal_id WHERE ${userScope(user).clause.replaceAll('employee_id', 'g.employee_id')} ORDER BY ci.id`).all(...userScope(user).params).map(mapCheckIn),
    auditLogs: user.role === 'admin' ? getAuditLogs() : [],
    notifications: db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all().map(mapNotification),
    teamMembers: getScopedTeamMembers(user),
    activities,
    escalations,
    escalationRules: user.role === 'admin' ? getEscalationRules() : [],
    escalationStatusOverrides: getStatusOverrides(),
    deliveryOutbox: user.role === 'admin' ? db.prepare('SELECT * FROM delivery_outbox ORDER BY created_at DESC').all().map(mapDelivery) : [],
  };
}

migrate();

export const app = express();
const reminderIntervalMs = Number(process.env.CHECKIN_REMINDER_CRON || 86400000);
const reminderTimer = setInterval(() => {
  try {
    runCheckInReminders();
  } catch (error) {
    console.error('Check-in reminder job failed', error);
  }
}, Number.isFinite(reminderIntervalMs) && reminderIntervalMs > 0 ? reminderIntervalMs : 86400000);
reminderTimer.unref?.();

export const closeDb = () => {
  clearInterval(reminderTimer);
  db.close();
};
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/bootstrap', (req, res) => res.json(bootstrap(actor(req))));
app.get('/api/goal-sheets/:employeeId/validate', (req, res) => res.json(validateGoalSheet(req.params.employeeId, req.query.cycleId)));

app.get('/api/integrations/status', (req, res) => {
  requireRole(req, ['admin']);
  res.json(integrationStatus());
});

app.post('/api/notifications/reminders/run', (req, res) => {
  const user = requireRole(req, ['admin']);
  const inserted = runCheckInReminders();
  addAudit({ userId: user.id, userName: user.name, action: 'Ran Check-in Reminders', after: { inserted: inserted.length } });
  res.json({ inserted: inserted.length, deliveryIds: inserted });
});

app.post('/api/teams/messages', (req, res) => {
  const activity = req.body || {};
  const aadObjectId = activity.from?.aadObjectId || activity.channelData?.from?.aadObjectId || activity.channelData?.user?.id || null;
  const email = activity.from?.email || activity.channelData?.user?.email || activity.value?.email || null;
  const appUserId = activity.value?.userId || activity.userId || (email ? db.prepare('SELECT id FROM users WHERE lower(email) = lower(?)').get(email)?.id : null);
  const userId = appUserId || activity.from?.id;
  if (!userId || !activity.conversation?.id || !activity.serviceUrl) {
    return res.status(202).json({ ok: true, stored: false, reason: 'Teams activity did not include a mappable user, conversation id, or serviceUrl.' });
  }
  const now = nowIso();
  db.prepare(`
    INSERT INTO teams_conversation_refs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET aad_object_id = excluded.aad_object_id, conversation_id = excluded.conversation_id, service_url = excluded.service_url, tenant_id = excluded.tenant_id, bot_id = excluded.bot_id, reference_json = excluded.reference_json, updated_at = excluded.updated_at
  `).run(
    userId,
    aadObjectId,
    activity.conversation.id,
    activity.serviceUrl,
    activity.conversation?.tenantId || activity.channelData?.tenant?.id || null,
    activity.recipient?.id || process.env.TEAMS_BOT_ID || null,
    json(activity),
    now,
    now
  );
  res.json({ ok: true, stored: true, userId });
});

app.get('/api/reports/achievement', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const filters = {
    quarter: req.query.quarter || 'Q1',
    department: req.query.department,
    managerId: user.role === 'manager' ? user.id : req.query.managerId,
    status: req.query.status,
  };
  if (!quarterPhaseMap[filters.quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  const rows = buildAchievementRows(user, filters);
  if (req.query.format === 'csv') {
    addAudit({ userId: user.id, userName: user.name, action: 'Exported Achievement Report', after: filters });
    const body = csv(
      ['Employee', 'Manager', 'Department', 'Quarter', 'Goal', 'Thrust Area', 'UoM', 'Status', 'Target', 'Planned', 'Actual', 'Score', 'Check-in Status', 'Submitted At', 'Manager Commented At'],
      rows.map((row) => [row.employeeName, row.managerName, row.departmentName, row.quarter, row.goalTitle, row.thrustArea, row.unitOfMeasure, row.status, row.target, row.plannedValue, row.actualValue, row.progressScore, row.checkInStatus, row.submittedAt || '', row.managerCommentedAt || ''])
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="achievement-report-${filters.quarter}.csv"`);
    return res.send(body);
  }
  res.json({ rows });
});

app.get('/api/reports/completion', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const filters = {
    quarter: req.query.quarter || 'Q1',
    department: req.query.department,
    managerId: user.role === 'manager' ? user.id : req.query.managerId,
  };
  if (!quarterPhaseMap[filters.quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  res.json({ rows: buildCompletionRows(user, filters) });
});

app.get('/api/org-hierarchy', (req, res) => {
  requireRole(req, ['admin']);
  res.json(buildOrgHierarchy());
});

app.post('/api/users', (req, res) => {
  const user = requireRole(req, ['admin']);
  const data = req.body || {};
  if (!data.name || !data.email || !validRoles.has(data.role)) return res.status(422).json({ error: 'Name, email and valid role are required.' });
  const id = data.id || `user-${Date.now()}`;
  if (db.prepare('SELECT 1 FROM users WHERE id = ?').get(id)) return res.status(409).json({ error: 'User already exists.' });
  if (data.managerId) {
    if (createsManagementLoop(id, data.managerId)) return res.status(422).json({ error: 'Manager assignment would create a reporting loop.' });
    const manager = db.prepare('SELECT * FROM users WHERE id = ?').get(data.managerId);
    if (!manager || manager.role !== 'manager') return res.status(422).json({ error: 'Manager must be an existing manager user.' });
  }
  db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.name, data.email, data.role, data.title || null, data.managerId || null, data.departmentId || null, data.departmentName || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Created User', after: { id, name: data.name, role: data.role, managerId: data.managerId || null, departmentId: data.departmentId || null } });
  res.status(201).json(bootstrap(user));
});

app.patch('/api/users/:id', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'User not found.' });
  const before = mapUser(row);
  const updates = req.body || {};
  const next = {
    ...before,
    name: updates.name ?? before.name,
    email: updates.email ?? before.email,
    role: updates.role ?? before.role,
    title: updates.title ?? before.title,
    managerId: updates.managerId === undefined ? before.managerId : updates.managerId || undefined,
    departmentId: updates.departmentId === undefined ? before.departmentId : updates.departmentId || undefined,
    departmentName: updates.departmentName === undefined ? before.departmentName : updates.departmentName || undefined,
  };
  if (!validRoles.has(next.role)) return res.status(422).json({ error: 'Invalid role.' });
  if (next.managerId) {
    if (createsManagementLoop(before.id, next.managerId)) return res.status(422).json({ error: 'Manager assignment would create a reporting loop.' });
    const manager = db.prepare('SELECT * FROM users WHERE id = ?').get(next.managerId);
    if (!manager || manager.role !== 'manager') return res.status(422).json({ error: 'Manager must be an existing manager user.' });
  }
  db.prepare('UPDATE users SET name = ?, email = ?, role = ?, title = ?, manager_id = ?, department_id = ?, department_name = ? WHERE id = ?').run(next.name, next.email, next.role, next.title || null, next.managerId || null, next.departmentId || null, next.departmentName || null, before.id);
  if (next.name !== before.name) {
    db.prepare('UPDATE goals SET employee_name = ? WHERE employee_id = ?').run(next.name, before.id);
  }
  const changes = fieldChanges(before, next);
  addAudit({ userId: user.id, userName: user.name, action: 'Updated User', before: Object.fromEntries(changes.map((item) => [item.field, item.before])), after: Object.fromEntries(changes.map((item) => [item.field, item.after])), fieldChanges: changes });
  res.json(bootstrap(user));
});

app.get('/api/audit-logs', (req, res) => {
  const user = requireRole(req, ['admin']);
  const filters = {
    action: req.query.action,
    userId: req.query.userId,
    goalId: req.query.goalId,
    lockedOnly: req.query.lockedOnly === 'true',
  };
  const rows = getAuditLogs(filters);
  if (req.query.format === 'csv') {
    addAudit({ userId: user.id, userName: user.name, action: 'Exported Audit Logs', after: filters });
    const body = csv(
      ['Timestamp', 'User ID', 'User', 'Action', 'Goal ID', 'Goal', 'Changed After Lock', 'Fields Changed', 'Before', 'After'],
      rows.map((row) => [row.timestamp, row.userId, row.userName, row.action, row.goalId || '', row.goalTitle || '', row.changedAfterLock ? 'Yes' : 'No', row.fieldChanges?.map((change) => change.field).join('; ') || '', row.before ? JSON.stringify(row.before) : '', row.after ? JSON.stringify(row.after) : ''])
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
    return res.send(body);
  }
  res.json({ rows });
});

app.get('/api/escalation-rules', (req, res) => {
  requireRole(req, ['admin']);
  res.json({ rules: getEscalationRules() });
});

app.post('/api/escalation-rules', (req, res) => {
  const user = requireRole(req, ['admin']);
  const data = req.body || {};
  if (!data.name || !validEscalationConditions.has(data.condition)) return res.status(422).json({ error: 'Name and valid condition are required.' });
  const id = data.id || `rule-${Date.now()}`;
  if (db.prepare('SELECT 1 FROM escalation_rules WHERE id = ?').get(id)) return res.status(409).json({ error: 'Escalation rule already exists.' });
  const thresholdDays = Number(data.thresholdDays ?? 1);
  const managerAfterDays = Number(data.managerAfterDays ?? thresholdDays);
  const hrAfterDays = Number(data.hrAfterDays ?? managerAfterDays);
  if ([thresholdDays, managerAfterDays, hrAfterDays].some((value) => !Number.isFinite(value) || value < 0)) return res.status(422).json({ error: 'Escalation intervals must be non-negative numbers.' });
  db.prepare('INSERT INTO escalation_rules VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, data.name, data.condition, thresholdDays, managerAfterDays, hrAfterDays, data.active === false ? 0 : 1, nowIso(), nowIso());
  addAudit({ userId: user.id, userName: user.name, action: 'Created Escalation Rule', after: { id, name: data.name, condition: data.condition } });
  res.status(201).json({ rules: getEscalationRules() });
});

app.patch('/api/escalation-rules/:id', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM escalation_rules WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Escalation rule not found.' });
  const before = mapEscalationRule(row);
  const updates = req.body || {};
  const next = {
    ...before,
    name: updates.name ?? before.name,
    condition: updates.condition ?? before.condition,
    thresholdDays: updates.thresholdDays ?? before.thresholdDays,
    managerAfterDays: updates.managerAfterDays ?? before.managerAfterDays,
    hrAfterDays: updates.hrAfterDays ?? before.hrAfterDays,
    active: updates.active ?? before.active,
  };
  if (!validEscalationConditions.has(next.condition)) return res.status(422).json({ error: 'Invalid escalation condition.' });
  if ([next.thresholdDays, next.managerAfterDays, next.hrAfterDays].some((value) => !Number.isFinite(Number(value)) || Number(value) < 0)) return res.status(422).json({ error: 'Escalation intervals must be non-negative numbers.' });
  db.prepare('UPDATE escalation_rules SET name = ?, condition = ?, threshold_days = ?, manager_after_days = ?, hr_after_days = ?, active = ?, updated_at = ? WHERE id = ?').run(next.name, next.condition, Number(next.thresholdDays), Number(next.managerAfterDays), Number(next.hrAfterDays), next.active ? 1 : 0, nowIso(), before.id);
  const changes = fieldChanges(before, next);
  addAudit({ userId: user.id, userName: user.name, action: 'Updated Escalation Rule', before: Object.fromEntries(changes.map((item) => [item.field, item.before])), after: Object.fromEntries(changes.map((item) => [item.field, item.after])), fieldChanges: changes });
  res.json({ rules: getEscalationRules() });
});

app.get('/api/escalation-logs', (req, res) => {
  requireRole(req, ['admin']);
  const filters = {
    status: req.query.status,
    level: req.query.level,
    condition: req.query.condition,
  };
  res.json({ rows: buildEscalationLogs(filters) });
});

app.post('/api/escalations/run', (req, res) => {
  const user = requireRole(req, ['admin']);
  const logs = buildEscalationLogs().filter((log) => log.status === 'open' || log.status === 'monitoring');
  const inserted = [];
  logs.forEach((log) => {
    log.notificationTargets.forEach((targetId) => {
      const id = `notif-${log.id}-${log.currentLevel}-${targetId}`.replace(/[^a-zA-Z0-9_-]/g, '-');
      if (db.prepare('SELECT 1 FROM notifications WHERE id = ?').get(id)) return;
      db.prepare('INSERT INTO notifications VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
        id,
        targetId,
        'deadline',
        `Escalation: ${log.ruleName}`,
        log.reason,
        '/admin/escalations',
        0,
        nowIso()
      );
      inserted.push(id);
    });
  });
  addAudit({ userId: user.id, userName: user.name, action: 'Ran Escalation Notifications', after: { evaluated: logs.length, inserted: inserted.length } });
  res.json({ evaluated: logs.length, inserted: inserted.length, notificationIds: inserted });
});

app.get('/api/analytics/qoq', (req, res) => {
  const user = actor(req);
  const filters = {
    scope: req.query.scope,
    employeeId: req.query.employeeId,
    managerId: req.query.managerId,
    department: req.query.department,
  };
  if (user.role === 'employee') filters.employeeId = user.id;
  if (user.role === 'manager') filters.managerId = user.id;
  res.json({ rows: buildQoqAnalytics(user, filters) });
});

app.get('/api/analytics/completion-heatmap', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const quarter = req.query.quarter || 'Q1';
  if (!quarterPhaseMap[quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  res.json({ rows: buildCompletionHeatmap(user, quarter) });
});

app.get('/api/analytics/goal-distribution', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  res.json(buildGoalDistribution(user));
});

app.get('/api/analytics/manager-effectiveness', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const quarter = req.query.quarter || 'Q1';
  if (!quarterPhaseMap[quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  res.json({ rows: buildManagerEffectiveness(user, quarter) });
});

app.post('/api/goals', (req, res) => {
  const user = actor(req);
  const data = req.body || {};
  if (!isGoalSettingOpen(data.cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  try {
    requireEmployeeAccess(user, data.employeeId, 'You can only create goals for yourself or direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
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
  res.status(201).json(bootstrap(user));
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
  try {
    requireEmployeeAccess(user, goal.employeeId, 'You can only update goals for yourself or direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
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
  if (!adminOverride && !achievementUpdate && changes.length && ['pending', 'rework'].includes(goal.status)) {
    notifyGoalUpdatedForManager(next);
  }
  res.json(bootstrap(user));
});

app.delete('/api/goals/:id', (req, res) => {
  const user = actor(req);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(row);
  if (goal.status === 'approved' && !goal.unlockedByAdmin) return res.status(423).json({ error: 'Approved goals are locked.' });
  if (goal.status === 'pending' || goal.isShared) return res.status(409).json({ error: 'Submitted or shared goals cannot be deleted.' });
  try {
    requireEmployeeAccess(user, goal.employeeId, 'You can only delete goals for yourself or direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
  db.prepare('DELETE FROM goals WHERE id = ?').run(goal.id);
  addAudit({ userId: user.id, userName: user.name, action: 'Deleted Goal', goalId: goal.id, goalTitle: goal.title, before: { status: goal.status } });
  res.json(bootstrap(user));
});

app.post('/api/goal-sheets/:employeeId/submit', (req, res) => {
  const user = actor(req);
  const { cycleId } = req.body || {};
  try {
    requireEmployeeAccess(user, req.params.employeeId, 'You can only submit goal sheets for yourself or direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
  if (!isGoalSettingOpen(cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  const validation = validateGoalSheet(req.params.employeeId, cycleId);
  if (!validation.canSubmit) return res.status(422).json({ error: 'Goal sheet validation failed.', validation });
  db.prepare("UPDATE goals SET status = 'pending', updated_at = ? WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?) AND status IN ('draft', 'rework')").run(nowIso(), req.params.employeeId, cycleId || null, cycleId || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Submitted Goal Sheet', after: { status: 'pending', totalWeightage: validation.totalWeightage } });
  notifyGoalSubmitted(req.params.employeeId, cycleId);
  res.json(bootstrap(user));
});

app.post('/api/goal-sheets/:employeeId/approve', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { cycleId, edits = {} } = req.body || {};
  try {
    requireEmployeeAccess(user, req.params.employeeId, 'Managers can only approve direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
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
  notifyGoalDecision(req.params.employeeId, cycleId, true);
  res.json(bootstrap(user));
});

app.post('/api/goal-sheets/:employeeId/return', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { cycleId } = req.body || {};
  try {
    requireEmployeeAccess(user, req.params.employeeId, 'Managers can only return direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
  if (!isGoalSettingOpen(cycleId)) return res.status(409).json({ error: 'Goal setting window is closed.' });
  db.prepare("UPDATE goals SET status = 'rework', updated_at = ? WHERE employee_id = ? AND (? IS NULL OR cycle_id = ?) AND status = 'pending'").run(nowIso(), req.params.employeeId, cycleId || null, cycleId || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Requested Goal Sheet Rework', after: { status: 'rework', employeeId: req.params.employeeId } });
  notifyGoalDecision(req.params.employeeId, cycleId, false);
  res.json(bootstrap(user));
});

app.post('/api/shared-goals', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { goal, employeeIds = [], primaryOwnerId } = req.body || {};
  if (!goal || !primaryOwnerId) return res.status(400).json({ error: 'Goal and primary owner are required.' });
  if (user.role === 'manager' && ![primaryOwnerId, ...employeeIds].every((employeeId) => isDirectReport(user.id, employeeId))) {
    return res.status(403).json({ error: 'Managers can only assign shared goals to direct reports.' });
  }
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
  res.status(201).json(bootstrap(user));
});

app.post('/api/goals/:id/unlock', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(row);
  db.prepare("UPDATE goals SET status = 'rework', locked_at = NULL, unlocked_by_admin = 1, updated_at = ? WHERE id = ?").run(nowIso(), goal.id);
  addAudit({ userId: user.id, userName: user.name, action: 'Admin Unlocked Goal', goalId: goal.id, goalTitle: goal.title, before: { status: goal.status, lockedAt: goal.lockedAt }, after: { status: 'rework', unlockedByAdmin: true } });
  res.json(bootstrap(user));
});

app.post('/api/check-ins', (req, res) => {
  const user = actor(req);
  const data = req.body || {};
  if (!quarterPhaseMap[data.quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  if (!validCheckInStatuses.has(data.status)) return res.status(422).json({ error: 'Invalid check-in status.' });
  const goalRow = db.prepare('SELECT * FROM goals WHERE id = ?').get(data.goalId);
  if (!goalRow) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(goalRow);
  if (goal.status !== 'approved') return res.status(409).json({ error: 'Only approved goals can be checked in.' });
  try {
    requireEmployeeAccess(user, goal.employeeId, 'You can only submit check-ins for yourself or direct reports.');
  } catch (err) {
    return res.status(err.status || 403).json({ error: err.message });
  }
  const window = checkInWindow(goal.cycleId, data.quarter);
  if (!window.ok) return res.status(window.status).json({ error: window.error });
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
  notifyCheckInSubmitted(goal, data.quarter);
  res.json(bootstrap(user));
});

app.post('/api/check-ins/:goalId/manager-comment', (req, res) => {
  const user = requireRole(req, ['manager', 'admin']);
  const { quarter, managerComment } = req.body || {};
  if (!quarterPhaseMap[quarter]) return res.status(422).json({ error: 'Invalid quarter.' });
  if (!isStructuredManagerComment(managerComment)) return res.status(422).json({ error: 'Structured manager comment is required.' });
  const goalRow = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.goalId);
  if (!goalRow) return res.status(404).json({ error: 'Goal not found.' });
  const goal = mapGoal(goalRow);
  if (user.role === 'manager' && !isDirectReport(user.id, goal.employeeId)) return res.status(403).json({ error: 'Managers can only comment on direct reports.' });
  const window = checkInWindow(goal.cycleId, quarter);
  if (!window.ok) return res.status(window.status).json({ error: window.error });
  const existing = db.prepare('SELECT * FROM check_ins WHERE goal_id = ? AND quarter = ?').get(req.params.goalId, quarter);
  const id = existing?.id || `checkin-${Date.now()}-${req.params.goalId}`;
  db.prepare(`
    INSERT INTO check_ins VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(goal_id, quarter) DO UPDATE SET manager_comment = excluded.manager_comment, manager_id = excluded.manager_id, manager_commented_at = excluded.manager_commented_at
  `).run(id, req.params.goalId, quarter, existing?.planned_value || 0, existing?.actual_value || 0, existing?.status || 'not-started', existing?.progress_score || 0, existing?.achievement_date || null, existing?.comments || '', existing?.evidence_urls || json([]), json(managerComment), user.id, nowIso(), existing?.submitted_at || null);
  addAudit({ userId: user.id, userName: user.name, action: 'Saved Manager Check-in Comment', goalId: req.params.goalId, after: managerComment });
  res.json(bootstrap(user));
});

app.patch('/api/notifications/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json(bootstrap(actor(req)));
});

app.patch('/api/cycles/:id/phases/:phase', (req, res) => {
  const user = requireRole(req, ['admin']);
  const row = db.prepare('SELECT * FROM cycles WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Cycle not found.' });
  const phases = parseJson(row.phases, {});
  phases[req.params.phase] = { ...phases[req.params.phase], ...(req.body || {}) };
  const managedPhaseOrder = ['goalSetting', 'q1Checkin', 'q2Checkin', 'q3Checkin', 'q4Checkin'];
  const phaseLabels = {
    goalSetting: 'Phase 1 - Goal Setting',
    q1Checkin: 'Q1 Check-in',
    q2Checkin: 'Q2 Check-in',
    q3Checkin: 'Q3 Check-in',
    q4Checkin: 'Q4 / Annual Capture',
  };
  const normalizeDay = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
  };
  for (const phase of managedPhaseOrder) {
    const phaseData = phases[phase];
    if (!phaseData?.start || !phaseData?.end) continue;
    if (normalizeDay(phaseData.end) < normalizeDay(phaseData.start)) {
      return res.status(422).json({ error: `${phaseLabels[phase]} has an invalid date range. The end date must be on or after the start date.` });
    }
  }
  for (let index = 0; index < managedPhaseOrder.length - 1; index += 1) {
    const current = managedPhaseOrder[index];
    const next = managedPhaseOrder[index + 1];
    if (!phases[current]?.end || !phases[next]?.start) continue;
    if (normalizeDay(phases[next].start) <= normalizeDay(phases[current].end)) {
      return res.status(422).json({ error: `${phaseLabels[current]} overlaps with ${phaseLabels[next]}. Each phase must start after the previous one ends.` });
    }
  }
  db.prepare('UPDATE cycles SET phases = ? WHERE id = ?').run(json(phases), req.params.id);
  addAudit({ userId: user.id, userName: user.name, action: req.body?.isOpen ? 'Opened Cycle Phase' : 'Updated Cycle Phase', after: { phase: req.params.phase, ...req.body } });
  res.json(bootstrap(user));
});

app.patch('/api/escalation-logs/:id/status', (req, res) => {
  const user = requireRole(req, ['admin']);
  const status = req.body?.status || 'open';
  if (!validEscalationStatuses.has(status)) return res.status(422).json({ error: 'Invalid escalation status.' });
  db.prepare('INSERT INTO escalation_status_overrides VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET status = excluded.status').run(req.params.id, status);
  addAudit({ userId: user.id, userName: user.name, action: 'Updated Escalation Status', after: { id: req.params.id, status } });
  res.json(bootstrap(user));
});

app.use((err, _req, res, _next) => {
  if (!err.status || err.status >= 500) console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Unexpected server error.' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, '0.0.0.0', () => console.log(`Pheonix API listening on port ${port}`));
}
