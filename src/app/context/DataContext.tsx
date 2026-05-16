import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Goal, Cycle, CheckIn, AuditLog, Notification } from '../types';

interface DataContextType {
  goals: Goal[];
  cycles: Cycle[];
  checkIns: CheckIn[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addCheckIn: (checkIn: Omit<CheckIn, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>) => void;
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
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [cycles] = useState<Cycle[]>([MOCK_CYCLE]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setGoals([...goals, newGoal]);
  };

  const updateGoal = (id: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g));
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

  return (
    <DataContext.Provider value={{
      goals,
      cycles,
      checkIns,
      auditLogs,
      notifications,
      addGoal,
      updateGoal,
      deleteGoal,
      addCheckIn,
      markNotificationRead,
      addAuditLog,
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
