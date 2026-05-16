import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal, Cycle, CheckIn, AuditLog, Notification, TeamMember, ActivityItem, Escalation } from '../types';

interface DataContextType {
  goals: Goal[];
  cycles: Cycle[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  activities: ActivityItem[];
  escalations: Escalation[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  updateCyclePhase: (cycleId: string, phase: keyof Cycle['phases'], updates: Partial<Cycle['phases'][keyof Cycle['phases']]>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const MOCK_CYCLE: Cycle = {
  id: 'cycle-2026',
  name: 'FY 2026',
  year: 2026,
  startDate: new Date('2026-01-01'),
  endDate: new Date('2026-12-31'),
  phases: {
    goalSetting: { start: new Date('2026-01-01'), end: new Date('2026-01-31'), isOpen: true },
    q1Checkin: { start: new Date('2026-03-15'), end: new Date('2026-03-31'), isOpen: false },
    q2Checkin: { start: new Date('2026-06-15'), end: new Date('2026-06-30'), isOpen: false },
    q3Checkin: { start: new Date('2026-09-15'), end: new Date('2026-09-30'), isOpen: false },
    q4Checkin: { start: new Date('2026-12-01'), end: new Date('2026-12-15'), isOpen: false },
    finalReview: { start: new Date('2026-12-16'), end: new Date('2026-12-31'), isOpen: false },
  },
  isActive: true,
};

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: 'emp-001', name: 'John Smith', email: 'john.smith@company.com', title: 'Senior Software Engineer', departmentId: 'dept-eng', departmentName: 'Engineering', managerId: 'mgr-001' },
  { id: 'emp-002', name: 'Jane Doe', email: 'jane.doe@company.com', title: 'Product Engineer', departmentId: 'dept-eng', departmentName: 'Engineering', managerId: 'mgr-001' },
  { id: 'emp-003', name: 'Mike Johnson', email: 'mike.johnson@company.com', title: 'Platform Engineer', departmentId: 'dept-eng', departmentName: 'Engineering', managerId: 'mgr-001' },
  { id: 'emp-004', name: 'Priya Nair', email: 'priya.nair@company.com', title: 'QA Lead', departmentId: 'dept-eng', departmentName: 'Engineering', managerId: 'mgr-001' },
];

const MOCK_GOALS: Goal[] = [
  {
    id: 'goal-001',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Increase API Response Time by 25%',
    description: 'Optimize database queries and implement caching',
    thrustArea: 'Efficiency',
    unitOfMeasure: 'Percentage',
    target: 25,
    weightage: 20,
    progress: 15,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-01-05'),
    updatedAt: new Date('2026-01-10'),
    deadlineDate: new Date('2026-06-30'),
  },
  {
    id: 'goal-002',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Launch Mobile App MVP',
    description: 'Complete React Native app with core features',
    thrustArea: 'Innovation',
    unitOfMeasure: 'Boolean',
    target: 1,
    weightage: 30,
    progress: 45,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-05-10'),
    deadlineDate: new Date('2026-09-30'),
  },
  {
    id: 'goal-003',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Mentor 2 Junior Developers',
    description: 'Provide weekly 1:1 coaching sessions',
    thrustArea: 'Team Development',
    unitOfMeasure: 'Number',
    target: 2,
    weightage: 15,
    progress: 50,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-05-15'),
    deadlineDate: new Date('2026-12-31'),
  },
  {
    id: 'goal-004',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Revenue Growth - Engineering Efficiency',
    description: 'Shared goal: Reduce infrastructure costs by 15%',
    thrustArea: 'Revenue',
    unitOfMeasure: 'Percentage',
    target: 15,
    weightage: 10,
    progress: 8,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: true,
    primaryOwnerId: 'mgr-001',
    createdAt: new Date('2026-01-08'),
    updatedAt: new Date('2026-05-12'),
    deadlineDate: new Date('2026-12-31'),
  },
  {
    id: 'goal-005',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Improve Search Reliability',
    description: 'Raise search success rate and reduce failed customer searches',
    thrustArea: 'Customer Success',
    unitOfMeasure: 'Percentage',
    target: 98,
    weightage: 15,
    progress: 0,
    status: 'draft',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-05-12'),
    updatedAt: new Date('2026-05-12'),
    deadlineDate: new Date('2026-10-15'),
  },
  {
    id: 'goal-006',
    employeeId: 'emp-001',
    employeeName: 'John Smith',
    title: 'Reduce Incident MTTR',
    description: 'Cut production incident mean time to recovery through runbooks',
    thrustArea: 'Efficiency',
    unitOfMeasure: 'Time',
    target: 45,
    weightage: 10,
    progress: 0,
    status: 'pending',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-05-13'),
    updatedAt: new Date('2026-05-13'),
    deadlineDate: new Date('2026-08-31'),
  },
  {
    id: 'goal-007',
    employeeId: 'emp-002',
    employeeName: 'Jane Doe',
    title: 'Improve Activation Funnel',
    description: 'Lift new user activation through onboarding experiments',
    thrustArea: 'Revenue',
    unitOfMeasure: 'Percentage',
    target: 12,
    weightage: 30,
    progress: 62,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-05-15'),
    deadlineDate: new Date('2026-09-30'),
  },
  {
    id: 'goal-008',
    employeeId: 'emp-002',
    employeeName: 'Jane Doe',
    title: 'AI Triage Pilot',
    description: 'Ship a pilot workflow for support ticket classification',
    thrustArea: 'Innovation',
    unitOfMeasure: 'Boolean',
    target: 1,
    weightage: 25,
    progress: 30,
    status: 'pending',
    cycleId: 'cycle-2026',
    isShared: true,
    primaryOwnerId: 'mgr-001',
    createdAt: new Date('2026-02-02'),
    updatedAt: new Date('2026-05-11'),
    deadlineDate: new Date('2026-07-31'),
  },
  {
    id: 'goal-009',
    employeeId: 'emp-003',
    employeeName: 'Mike Johnson',
    title: 'Cloud Cost Guardrails',
    description: 'Implement spend alerts and service owner reporting',
    thrustArea: 'Efficiency',
    unitOfMeasure: 'Currency',
    target: 150000,
    weightage: 40,
    progress: 22,
    status: 'approved',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-05-09'),
    deadlineDate: new Date('2026-05-01'),
  },
  {
    id: 'goal-010',
    employeeId: 'emp-004',
    employeeName: 'Priya Nair',
    title: 'Regression Automation Coverage',
    description: 'Increase automated coverage for release-critical journeys',
    thrustArea: 'Customer Success',
    unitOfMeasure: 'Percentage',
    target: 85,
    weightage: 35,
    progress: 44,
    status: 'rework',
    cycleId: 'cycle-2026',
    isShared: false,
    createdAt: new Date('2026-02-12'),
    updatedAt: new Date('2026-05-10'),
    deadlineDate: new Date('2026-11-15'),
  },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    userId: 'emp-001',
    type: 'approval',
    title: 'Goal Approved',
    message: 'Your goal "Increase API Response Time by 25%" has been approved',
    link: '/employee/my-goals',
    isRead: false,
    createdAt: new Date('2026-05-15'),
  },
  {
    id: 'notif-002',
    userId: 'emp-001',
    type: 'deadline',
    title: 'Deadline Approaching',
    message: 'Q2 Check-in deadline is in 3 days',
    link: '/employee/checkin',
    isRead: false,
    createdAt: new Date('2026-05-14'),
  },
  {
    id: 'notif-003',
    userId: 'mgr-001',
    type: 'approval',
    title: 'Approvals waiting',
    message: '3 submitted goals need manager review',
    link: '/manager/approvals',
    isRead: false,
    createdAt: new Date('2026-05-16'),
  },
  {
    id: 'notif-004',
    userId: 'admin-001',
    type: 'deadline',
    title: 'Escalations increased',
    message: '2 goals are overdue or at risk this cycle',
    link: '/admin/escalations',
    isRead: false,
    createdAt: new Date('2026-05-16'),
  },
];

const MOCK_CHECKINS: CheckIn[] = [
  { id: 'checkin-001', goalId: 'goal-001', quarter: 'Q1', plannedValue: 8, actualValue: 7, status: 'on-track', comments: 'Caching rollout is mostly complete.', evidenceUrls: ['runbook.pdf'], submittedAt: new Date('2026-03-28') },
  { id: 'checkin-002', goalId: 'goal-002', quarter: 'Q1', plannedValue: 20, actualValue: 18, status: 'on-track', comments: 'Core screens are complete.', evidenceUrls: [], submittedAt: new Date('2026-03-28') },
  { id: 'checkin-003', goalId: 'goal-009', quarter: 'Q1', plannedValue: 35, actualValue: 18, status: 'at-risk', comments: 'Vendor data arrived late.', evidenceUrls: [], submittedAt: new Date('2026-03-29') },
];

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'audit-001', timestamp: new Date('2026-05-16T10:30:00'), userId: 'emp-001', userName: 'John Smith', action: 'Created Goal', goalId: 'goal-006', goalTitle: 'Reduce Incident MTTR', before: null, after: { status: 'pending', weightage: 10 } },
  { id: 'audit-002', timestamp: new Date('2026-05-16T09:15:00'), userId: 'mgr-001', userName: 'Sarah Johnson', action: 'Approved Goal', goalId: 'goal-001', goalTitle: 'Increase API Response Time by 25%', before: { status: 'pending' }, after: { status: 'approved' } },
  { id: 'audit-003', timestamp: new Date('2026-05-15T14:20:00'), userId: 'admin-001', userName: 'Alex Chen', action: 'Opened Cycle Phase', before: { phase: 'goalSetting', isOpen: false }, after: { phase: 'goalSetting', isOpen: true } },
  { id: 'audit-004', timestamp: new Date('2026-05-14T16:45:00'), userId: 'mgr-001', userName: 'Sarah Johnson', action: 'Requested Rework', goalId: 'goal-010', goalTitle: 'Regression Automation Coverage', before: { status: 'pending' }, after: { status: 'rework' } },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: 'activity-001', title: 'Goal approved', description: 'Increase API Response Time by 25% was approved by Sarah Johnson.', tone: 'success', createdAt: new Date('2026-05-16T09:15:00'), link: '/employee/my-goals' },
  { id: 'activity-002', title: 'Q2 check-in window', description: 'Employee check-ins are due in 5 days.', tone: 'warning', createdAt: new Date('2026-05-15T12:00:00'), link: '/employee/checkin' },
  { id: 'activity-003', title: 'Analytics refreshed', description: 'Team completion trends were recalculated for FY 2026.', tone: 'analytics', createdAt: new Date('2026-05-15T08:00:00'), link: '/manager/analytics' },
  { id: 'activity-004', title: 'Escalation opened', description: 'Cloud Cost Guardrails is overdue and below target progress.', tone: 'error', createdAt: new Date('2026-05-14T15:00:00'), link: '/admin/escalations' },
];

const MOCK_ESCALATIONS: Escalation[] = [
  { id: 'esc-001', title: 'Cloud Cost Guardrails overdue', owner: 'Mike Johnson', severity: 'high', reason: 'Deadline passed with 22% completion.', status: 'open', createdAt: new Date('2026-05-02') },
  { id: 'esc-002', title: 'Regression coverage needs rework', owner: 'Priya Nair', severity: 'medium', reason: 'Manager requested goal revision.', status: 'monitoring', createdAt: new Date('2026-05-14') },
  { id: 'esc-003', title: 'AI Triage Pilot pending approval', owner: 'Jane Doe', severity: 'low', reason: 'Pending more than 5 business days.', status: 'monitoring', createdAt: new Date('2026-05-12') },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [cycles, setCycles] = useState<Cycle[]>([MOCK_CYCLE]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(MOCK_CHECKINS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [activities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [escalations] = useState<Escalation[]>(MOCK_ESCALATIONS);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setGoals([...goals, newGoal]);
    addAuditLog({
      userId: newGoal.employeeId,
      userName: newGoal.employeeName,
      action: 'Created Goal',
      goalId: newGoal.id,
      goalTitle: newGoal.title,
      before: null,
      after: { title: newGoal.title, status: newGoal.status, weightage: newGoal.weightage },
    });
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    const previous = goals.find(g => g.id === id);
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g));
    if (previous) {
      addAuditLog({
        userId: 'system',
        userName: 'Demo Workflow',
        action: updates.status === 'approved' ? 'Approved Goal' : updates.status === 'rework' ? 'Requested Rework' : 'Updated Goal',
        goalId: id,
        goalTitle: previous.title,
        before: { status: previous.status, target: previous.target, weightage: previous.weightage },
        after: updates,
      });
    }
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addCheckIn = (checkInData: Omit<CheckIn, 'id'>) => {
    const newCheckIn: CheckIn = {
      ...checkInData,
      id: `checkin-${Date.now()}`,
    };
    setCheckIns([...checkIns, newCheckIn]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const updateCyclePhase = (cycleId: string, phase: keyof Cycle['phases'], updates: Partial<Cycle['phases'][keyof Cycle['phases']]>) => {
    setCycles(prev => prev.map(cycle => (
      cycle.id === cycleId
        ? { ...cycle, phases: { ...cycle.phases, [phase]: { ...cycle.phases[phase], ...updates } } }
        : cycle
    )));
    addAuditLog({
      userId: 'admin-001',
      userName: 'Alex Chen',
      action: updates.isOpen ? 'Opened Cycle Phase' : 'Updated Cycle Phase',
      before: { phase },
      after: updates,
    });
  };

  return (
    <DataContext.Provider value={{
      goals,
      cycles,
      checkIns,
      auditLogs,
      notifications,
      teamMembers: MOCK_TEAM_MEMBERS,
      activities,
      escalations,
      addGoal,
      updateGoal,
      deleteGoal,
      addCheckIn,
      markNotificationRead,
      addAuditLog,
      updateCyclePhase,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
