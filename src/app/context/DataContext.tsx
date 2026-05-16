import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Goal, Cycle, CheckIn, AuditLog, Notification, TeamMember, ActivityItem, Escalation, GoalSheetValidation, Quarter, EscalationRule, EscalationLog, DeliveryOutboxItem } from '../types';
import { calculateProgressScore } from '../utils/progressScore';
import { buildEscalationLogs } from '../utils/governanceAnalytics';
import { useAuth } from './AuthContext';

interface DataContextType {
  goals: Goal[];
  cycles: Cycle[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  activities: ActivityItem[];
  escalations: Escalation[];
  escalationRules: EscalationRule[];
  escalationLogs: EscalationLog[];
  deliveryOutbox: DeliveryOutboxItem[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateGoal: (id: string, updates: Partial<Goal>, options?: { adminOverride?: boolean }) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
  validateGoalSheet: (employeeId: string, cycleId?: string, goalsOverride?: Goal[]) => GoalSheetValidation;
  submitGoalSheet: (employeeId: string, cycleId?: string) => Promise<boolean>;
  approveGoalSheet: (employeeId: string, cycleId?: string, edits?: Record<string, Partial<Goal>>) => Promise<boolean>;
  returnGoalSheetForRework: (employeeId: string, cycleId?: string) => Promise<boolean>;
  addSharedGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'employeeId' | 'employeeName' | 'status' | 'progress' | 'isShared' | 'sharedGoalId'>, employeeIds: string[], primaryOwnerId: string) => Promise<boolean>;
  adminUnlockGoal: (id: string) => Promise<boolean>;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => Promise<boolean>;
  upsertCheckIn: (checkIn: Omit<CheckIn, 'id' | 'progressScore'>) => Promise<boolean>;
  saveManagerCheckInComment: (goalId: string, quarter: Quarter, managerId: string, managerComment: NonNullable<CheckIn['managerComment']>) => Promise<boolean>;
  calculateProgressScore: typeof calculateProgressScore;
  markNotificationRead: (id: string) => Promise<boolean>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  updateCyclePhase: (cycleId: string, phase: keyof Cycle['phases'], updates: Partial<Cycle['phases'][keyof Cycle['phases']]>) => Promise<boolean>;
  updateEscalationLogStatus: (id: string, status: EscalationLog['status']) => Promise<boolean>;
}

type BootstrapPayload = {
  goals: Goal[];
  cycles: Cycle[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  teamMembers: TeamMember[];
  activities: ActivityItem[];
  escalations: Escalation[];
  escalationRules: EscalationRule[];
  escalationStatusOverrides?: Record<string, EscalationLog['status']>;
  deliveryOutbox?: DeliveryOutboxItem[];
};

const DataContext = createContext<DataContextType | undefined>(undefined);

const dateKeys = new Set(['createdAt', 'updatedAt', 'lockedAt', 'deadlineDate', 'startDate', 'endDate', 'submittedAt', 'achievementDate', 'managerCommentedAt', 'timestamp', 'changedAt', 'createdAt']);

const reviveDates = <T,>(value: T): T => {
  if (Array.isArray(value)) return value.map(reviveDates) as T;
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value).map(([key, entry]) => {
    if (dateKeys.has(key) && typeof entry === 'string') return [key, new Date(entry)];
    if (key === 'phases' && entry && typeof entry === 'object') {
      return [key, Object.fromEntries(Object.entries(entry).map(([phase, phaseData]) => [phase, reviveDates(phaseData)]))];
    }
    return [key, reviveDates(entry)];
  })) as T;
};

const emptyValidation = (): GoalSheetValidation => {
  const checks = [
    { label: 'Total weightage equals 100%', passed: false },
    { label: 'Maximum 8 goals', passed: false },
    { label: 'Each goal has at least 10% weightage', passed: false },
  ];
  return {
    totalWeightage: 0,
    goalCount: 0,
    canSubmit: false,
    errors: checks.map(check => check.label),
    checks,
  };
};

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [escalationRules, setEscalationRules] = useState<EscalationRule[]>([]);
  const [deliveryOutbox, setDeliveryOutbox] = useState<DeliveryOutboxItem[]>([]);
  const [escalationStatusOverrides, setEscalationStatusOverrides] = useState<Record<string, EscalationLog['status']>>({});

  const applyBootstrap = useCallback((payload: BootstrapPayload) => {
    const data = reviveDates(payload);
    setGoals(data.goals || []);
    setCycles(data.cycles || []);
    setCheckIns(data.checkIns || []);
    setAuditLogs(data.auditLogs || []);
    setNotifications(data.notifications || []);
    setTeamMembers(data.teamMembers || []);
    setActivities(data.activities || []);
    setEscalations(data.escalations || []);
    setEscalationRules(data.escalationRules || []);
    setDeliveryOutbox(data.deliveryOutbox || []);
    setEscalationStatusOverrides(data.escalationStatusOverrides || {});
  }, []);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';
  const buildUrl = (path: string) => (apiBaseUrl ? `${apiBaseUrl}${path}` : path);

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user?.id || 'system',
        'x-user-role': user?.role || 'employee',
        ...(options.headers || {}),
      },
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.warn(payload.error || 'API request failed');
      return false;
    }

    if (payload.goals) applyBootstrap(payload as BootstrapPayload);
    return true;
  }, [applyBootstrap, user?.id, user?.role]);

  const refresh = useCallback(async () => {
    try {
      await request('/api/bootstrap');
    } catch (error) {
      console.warn('Unable to load backend data', error);
    }
  }, [request]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const validateGoalSheet = useCallback((employeeId: string, cycleId?: string, goalsOverride?: Goal[]): GoalSheetValidation => {
    if (!employeeId) return emptyValidation();
    const sourceGoals = goalsOverride || goals;
    const sheetGoals = sourceGoals.filter(goal => goal.employeeId === employeeId && (!cycleId || goal.cycleId === cycleId));
    const totalWeightage = sheetGoals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
    const checks = [
      { label: 'Total weightage equals 100%', passed: totalWeightage === 100 },
      { label: 'Maximum 8 goals', passed: sheetGoals.length > 0 && sheetGoals.length <= 8 },
      { label: 'Each goal has at least 10% weightage', passed: sheetGoals.length > 0 && sheetGoals.every(goal => goal.weightage >= 10) },
    ];

    return {
      totalWeightage,
      goalCount: sheetGoals.length,
      canSubmit: checks.every(check => check.passed),
      errors: checks.filter(check => !check.passed).map(check => check.label),
      checks,
    };
  }, [goals]);

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => (
    request('/api/goals', { method: 'POST', body: JSON.stringify(goal) })
  );

  const updateGoal = (id: string, updates: Partial<Goal>, options?: { adminOverride?: boolean }) => (
    request(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, adminOverride: options?.adminOverride }) })
  );

  const deleteGoal = (id: string) => request(`/api/goals/${id}`, { method: 'DELETE' });

  const submitGoalSheet = (employeeId: string, cycleId?: string) => (
    request(`/api/goal-sheets/${employeeId}/submit`, { method: 'POST', body: JSON.stringify({ cycleId }) })
  );

  const approveGoalSheet = (employeeId: string, cycleId?: string, edits: Record<string, Partial<Goal>> = {}) => (
    request(`/api/goal-sheets/${employeeId}/approve`, { method: 'POST', body: JSON.stringify({ cycleId, edits }) })
  );

  const returnGoalSheetForRework = (employeeId: string, cycleId?: string) => (
    request(`/api/goal-sheets/${employeeId}/return`, { method: 'POST', body: JSON.stringify({ cycleId }) })
  );

  const addSharedGoal = (
    goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'employeeId' | 'employeeName' | 'status' | 'progress' | 'isShared' | 'sharedGoalId'>,
    employeeIds: string[],
    primaryOwnerId: string
  ) => request('/api/shared-goals', { method: 'POST', body: JSON.stringify({ goal, employeeIds, primaryOwnerId }) });

  const adminUnlockGoal = (id: string) => request(`/api/goals/${id}/unlock`, { method: 'POST' });

  const addCheckIn = (checkIn: Omit<CheckIn, 'id'>) => (
    request('/api/check-ins', { method: 'POST', body: JSON.stringify(checkIn) })
  );

  const upsertCheckIn = (checkIn: Omit<CheckIn, 'id' | 'progressScore'>) => (
    request('/api/check-ins', { method: 'POST', body: JSON.stringify(checkIn) })
  );

  const saveManagerCheckInComment = (
    goalId: string,
    quarter: Quarter,
    managerId: string,
    managerComment: NonNullable<CheckIn['managerComment']>
  ) => request(`/api/check-ins/${goalId}/manager-comment`, { method: 'POST', body: JSON.stringify({ quarter, managerId, managerComment }) });

  const markNotificationRead = (id: string) => request(`/api/notifications/${id}/read`, { method: 'PATCH' });

  const addAuditLog = (logData: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...logData,
      id: `audit-local-${Date.now()}`,
      timestamp: new Date(),
      changedAt: logData.changedAt || new Date(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateCyclePhase = (cycleId: string, phase: keyof Cycle['phases'], updates: Partial<Cycle['phases'][keyof Cycle['phases']]>) => (
    request(`/api/cycles/${cycleId}/phases/${String(phase)}`, { method: 'PATCH', body: JSON.stringify(updates) })
  );

  const updateEscalationLogStatus = (id: string, status: EscalationLog['status']) => (
    request(`/api/escalation-logs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  );

  const escalationLogs = useMemo(() => (
    buildEscalationLogs(escalationRules, goals, checkIns, teamMembers, cycles, escalationStatusOverrides)
  ), [cycles, escalationRules, escalationStatusOverrides, goals, checkIns, teamMembers]);

  return (
    <DataContext.Provider value={{
      goals,
      cycles,
      checkIns,
      auditLogs,
      notifications,
      teamMembers,
      activities,
      escalations,
      escalationRules,
      escalationLogs,
      deliveryOutbox,
      addGoal,
      updateGoal,
      deleteGoal,
      validateGoalSheet,
      submitGoalSheet,
      approveGoalSheet,
      returnGoalSheetForRework,
      addSharedGoal,
      adminUnlockGoal,
      addCheckIn,
      upsertCheckIn,
      saveManagerCheckInComment,
      calculateProgressScore,
      markNotificationRead,
      addAuditLog,
      updateCyclePhase,
      updateEscalationLogStatus,
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
