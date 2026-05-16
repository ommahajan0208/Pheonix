export type UserRole = 'employee' | 'manager' | 'admin';

export type GoalStatus = 'draft' | 'pending' | 'approved' | 'rework' | 'completed';

export type ThrustArea = 'Revenue' | 'Customer Success' | 'Innovation' | 'Efficiency' | 'Team Development';

export type UnitOfMeasure = 'Numeric' | '%' | 'Timeline' | 'Zero-based';

export type ScoringDirection = 'higher-is-better' | 'lower-is-better' | 'date-based' | 'zero-success';

export type CheckInStatus = 'not-started' | 'on-track' | 'completed';

export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Goal {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  thrustArea: ThrustArea;
  unitOfMeasure: UnitOfMeasure;
  scoringDirection: ScoringDirection;
  target: number;
  weightage: number;
  progress: number;
  status: GoalStatus;
  cycleId: string;
  isShared: boolean;
  sharedGoalId?: string;
  primaryOwnerId?: string;
  lockedAt?: Date;
  unlockedByAdmin?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deadlineDate?: Date;
}

export interface GoalSheetValidation {
  totalWeightage: number;
  goalCount: number;
  canSubmit: boolean;
  errors: string[];
  checks: {
    label: string;
    passed: boolean;
  }[];
}

export interface Cycle {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  phases: {
    goalSetting: { start: Date; end: Date; isOpen: boolean };
    q1Checkin: { start: Date; end: Date; isOpen: boolean };
    q2Checkin: { start: Date; end: Date; isOpen: boolean };
    q3Checkin: { start: Date; end: Date; isOpen: boolean };
    q4Checkin: { start: Date; end: Date; isOpen: boolean };
    finalReview: { start: Date; end: Date; isOpen: boolean };
  };
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
  departmentId?: string;
  departmentName?: string;
  title?: string;
}

export interface CheckIn {
  id: string;
  goalId: string;
  quarter: Quarter;
  plannedValue: number;
  actualValue: number;
  status: CheckInStatus;
  progressScore: number;
  achievementDate?: Date;
  comments: string;
  evidenceUrls: string[];
  managerComment?: {
    discussionSummary: string;
    blockersSupportNeeded: string;
    nextActions: string;
  };
  managerId?: string;
  managerCommentedAt?: Date;
  submittedAt?: Date;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  goalId?: string;
  goalTitle?: string;
  before?: any;
  after?: any;
  fieldChanges?: AuditFieldChange[];
  changedAfterLock?: boolean;
  changedAt?: Date;
}

export interface AuditFieldChange {
  field: string;
  before: any;
  after: any;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'approval' | 'rework' | 'deadline' | 'checkin' | 'comment';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  title: string;
  departmentId: string;
  departmentName: string;
  managerId: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  tone: 'info' | 'success' | 'warning' | 'error' | 'analytics';
  createdAt: Date;
  link?: string;
}

export interface Escalation {
  id: string;
  title: string;
  owner: string;
  severity: 'high' | 'medium' | 'low';
  reason: string;
  status: 'open' | 'monitoring' | 'resolved';
  createdAt: Date;
}

export type EscalationCondition = 'goal-not-submitted' | 'manager-not-approved' | 'checkin-not-completed';

export type EscalationLevel = 'employee' | 'manager' | 'hr';

export interface EscalationRule {
  id: string;
  name: string;
  condition: EscalationCondition;
  thresholdDays: number;
  managerAfterDays: number;
  hrAfterDays: number;
  active: boolean;
}

export interface EscalationLog {
  id: string;
  ruleId: string;
  ruleName: string;
  employeeId: string;
  employeeName: string;
  managerId?: string;
  managerName?: string;
  departmentName?: string;
  goalId?: string;
  goalTitle?: string;
  quarter?: Quarter;
  currentLevel: EscalationLevel;
  reason: string;
  status: 'open' | 'monitoring' | 'resolved';
  triggeredAt: Date;
  resolvedAt?: Date;
}
