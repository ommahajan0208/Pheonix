import { AuditFieldChange, CheckIn, EscalationLevel, EscalationLog, EscalationRule, Goal, GoalStatus, Quarter, TeamMember, ThrustArea, UnitOfMeasure } from '../types';
import { getActiveCycle, getPhaseForQuarter } from './cycleSchedule';
import { Cycle } from '../types';

export const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export const MANAGER_DIRECTORY: Record<string, { name: string; departmentName: string }> = {
  'mgr-001': { name: 'Sarah Johnson', departmentName: 'Engineering' },
};

export type AchievementReportRow = {
  employeeId: string;
  employeeName: string;
  managerName: string;
  departmentName: string;
  quarter: Quarter;
  goalTitle: string;
  thrustArea: ThrustArea;
  unitOfMeasure: UnitOfMeasure;
  status: GoalStatus;
  target: number;
  plannedValue: number | string;
  actualValue: number | string;
  progressScore: number;
  checkInStatus: string;
};

export type CompletionRow = {
  employeeId: string;
  employeeName: string;
  managerName: string;
  departmentName: string;
  quarter: Quarter;
  approvedGoals: number;
  employeeSubmitted: number;
  managerCompleted: number;
  employeeCompletionRate: number;
  managerCompletionRate: number;
  status: 'complete' | 'manager-pending' | 'employee-pending';
};

const daysBetween = (start: Date, end = new Date()) => (
  Math.max(0, Math.floor((end.getTime() - start.getTime()) / 86400000))
);

const getMember = (members: TeamMember[], employeeId: string) => members.find(member => member.id === employeeId);

const getManagerName = (managerId?: string) => (
  managerId ? MANAGER_DIRECTORY[managerId]?.name || managerId : 'Unassigned'
);

export const toCsv = (headers: string[], rows: Array<Array<string | number>>) => {
  const escapeCell = (value: string | number) => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  return [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\n');
};

export const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const getFieldChanges = (before: Record<string, any>, after: Record<string, any>): AuditFieldChange[] => (
  Object.keys(after)
    .filter(field => field !== 'updatedAt')
    .filter(field => JSON.stringify(before[field]) !== JSON.stringify(after[field]))
    .map(field => ({ field, before: before[field], after: after[field] }))
);

export const buildAchievementRows = (
  goals: Goal[],
  checkIns: CheckIn[],
  teamMembers: TeamMember[],
): AchievementReportRow[] => (
  goals.flatMap(goal => {
    const member = getMember(teamMembers, goal.employeeId);
    return QUARTERS.map(quarter => {
      const checkIn = checkIns.find(item => item.goalId === goal.id && item.quarter === quarter);
      return {
        employeeId: goal.employeeId,
        employeeName: goal.employeeName,
        managerName: getManagerName(member?.managerId),
        departmentName: member?.departmentName || 'Unassigned',
        quarter,
        goalTitle: goal.title,
        thrustArea: goal.thrustArea,
        unitOfMeasure: goal.unitOfMeasure,
        status: goal.status,
        target: goal.target,
        plannedValue: checkIn?.plannedValue ?? 'Not submitted',
        actualValue: checkIn?.actualValue ?? 'Not submitted',
        progressScore: checkIn?.progressScore ?? 0,
        checkInStatus: checkIn?.status || 'not-started',
      };
    });
  })
);

export const buildCompletionRows = (
  goals: Goal[],
  checkIns: CheckIn[],
  teamMembers: TeamMember[],
  quarter: Quarter,
): CompletionRow[] => (
  teamMembers.map(member => {
    const approvedGoals = goals.filter(goal => goal.employeeId === member.id && goal.status === 'approved');
    const employeeSubmitted = approvedGoals.filter(goal => (
      checkIns.some(checkIn => checkIn.goalId === goal.id && checkIn.quarter === quarter && Boolean(checkIn.submittedAt))
    )).length;
    const managerCompleted = approvedGoals.filter(goal => (
      checkIns.some(checkIn => checkIn.goalId === goal.id && checkIn.quarter === quarter && Boolean(checkIn.managerCommentedAt))
    )).length;
    const employeeCompletionRate = approvedGoals.length ? Math.round((employeeSubmitted / approvedGoals.length) * 100) : 0;
    const managerCompletionRate = approvedGoals.length ? Math.round((managerCompleted / approvedGoals.length) * 100) : 0;

    return {
      employeeId: member.id,
      employeeName: member.name,
      managerName: getManagerName(member.managerId),
      departmentName: member.departmentName,
      quarter,
      approvedGoals: approvedGoals.length,
      employeeSubmitted,
      managerCompleted,
      employeeCompletionRate,
      managerCompletionRate,
      status: employeeCompletionRate < 100 ? 'employee-pending' : managerCompletionRate < 100 ? 'manager-pending' : 'complete',
    };
  })
);

export const buildEscalationLogs = (
  rules: EscalationRule[],
  goals: Goal[],
  checkIns: CheckIn[],
  teamMembers: TeamMember[],
  cycles: Cycle[],
  statusOverrides: Record<string, EscalationLog['status']> = {},
): EscalationLog[] => {
  const activeCycle = getActiveCycle(cycles);
  const now = new Date();

  const levelForAge = (rule: EscalationRule, ageDays: number): EscalationLevel => {
    if (ageDays >= rule.hrAfterDays) return 'hr';
    if (ageDays >= rule.managerAfterDays) return 'manager';
    return 'employee';
  };

  return rules
    .filter(rule => rule.active)
    .flatMap(rule => {
      if (rule.condition === 'goal-not-submitted') {
        const age = daysBetween(new Date(activeCycle.phases.goalSetting.start), now);
        if (age < rule.thresholdDays) return [];

        return teamMembers
          .filter(member => {
            const sheet = goals.filter(goal => goal.employeeId === member.id && goal.cycleId === activeCycle.id);
            return sheet.length === 0 || sheet.some(goal => goal.status === 'draft' || goal.status === 'rework');
          })
          .map(member => {
            const id = `${rule.id}-${member.id}`;
            return {
              id,
              ruleId: rule.id,
              ruleName: rule.name,
              employeeId: member.id,
              employeeName: member.name,
              managerId: member.managerId,
              managerName: getManagerName(member.managerId),
              departmentName: member.departmentName,
              currentLevel: levelForAge(rule, age),
              reason: `Goals are not fully submitted ${age} day(s) after cycle open.`,
              status: statusOverrides[id] || 'open',
              triggeredAt: new Date(activeCycle.phases.goalSetting.start),
            };
          });
      }

      if (rule.condition === 'manager-not-approved') {
        return goals
          .filter(goal => goal.status === 'pending')
          .map(goal => {
            const age = daysBetween(new Date(goal.updatedAt), now);
            if (age < rule.thresholdDays) return null;
            const member = getMember(teamMembers, goal.employeeId);
            const id = `${rule.id}-${goal.id}`;
            return {
              id,
              ruleId: rule.id,
              ruleName: rule.name,
              employeeId: goal.employeeId,
              employeeName: goal.employeeName,
              managerId: member?.managerId,
              managerName: getManagerName(member?.managerId),
              departmentName: member?.departmentName,
              goalId: goal.id,
              goalTitle: goal.title,
              currentLevel: levelForAge(rule, age),
              reason: `Manager approval is pending ${age} day(s) after submission.`,
              status: statusOverrides[id] || 'open',
              triggeredAt: new Date(goal.updatedAt),
            } satisfies EscalationLog;
          })
          .filter(Boolean) as EscalationLog[];
      }

      return QUARTERS.flatMap(quarter => {
        const phase = activeCycle.phases[getPhaseForQuarter(quarter)];
        if (phase.isOpen || now <= new Date(phase.end)) return [];
        const age = daysBetween(new Date(phase.end), now);
        if (age < rule.thresholdDays) return [];

        return goals
          .filter(goal => goal.status === 'approved' && goal.cycleId === activeCycle.id)
          .filter(goal => !checkIns.some(checkIn => checkIn.goalId === goal.id && checkIn.quarter === quarter && Boolean(checkIn.submittedAt)))
          .map(goal => {
            const member = getMember(teamMembers, goal.employeeId);
            const id = `${rule.id}-${goal.id}-${quarter}`;
            return {
              id,
              ruleId: rule.id,
              ruleName: rule.name,
              employeeId: goal.employeeId,
              employeeName: goal.employeeName,
              managerId: member?.managerId,
              managerName: getManagerName(member?.managerId),
              departmentName: member?.departmentName,
              goalId: goal.id,
              goalTitle: goal.title,
              quarter,
              currentLevel: levelForAge(rule, age),
              reason: `${quarter} check-in is incomplete ${age} day(s) after the window closed.`,
              status: statusOverrides[id] || 'open',
              triggeredAt: new Date(phase.end),
            };
          });
      });
    });
};

export const buildQoqTrends = (goals: Goal[], checkIns: CheckIn[], teamMembers: TeamMember[]) => (
  QUARTERS.map(quarter => {
    const quarterCheckIns = checkIns.filter(checkIn => checkIn.quarter === quarter);
    const employeeCount = new Set(quarterCheckIns.map(checkIn => goals.find(goal => goal.id === checkIn.goalId)?.employeeId).filter(Boolean)).size;
    const avgAchievement = quarterCheckIns.length
      ? Math.round(quarterCheckIns.reduce((sum, checkIn) => sum + checkIn.progressScore, 0) / quarterCheckIns.length)
      : 0;
    const managerCommented = quarterCheckIns.filter(checkIn => checkIn.managerCommentedAt).length;

    return {
      quarter,
      individual: avgAchievement,
      team: employeeCount ? Math.round(avgAchievement * Math.min(1.1, 1 + employeeCount / Math.max(teamMembers.length, 1) / 10)) : 0,
      department: avgAchievement,
      checkInCompletion: goals.filter(goal => goal.status === 'approved').length
        ? Math.round((quarterCheckIns.filter(checkIn => checkIn.submittedAt).length / goals.filter(goal => goal.status === 'approved').length) * 100)
        : 0,
      managerCompletion: quarterCheckIns.length ? Math.round((managerCommented / quarterCheckIns.length) * 100) : 0,
    };
  })
);

export const buildGoalDistribution = (goals: Goal[]) => ({
  thrustAreas: Object.entries(goals.reduce((acc, goal) => {
    acc[goal.thrustArea] = (acc[goal.thrustArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
  uomTypes: Object.entries(goals.reduce((acc, goal) => {
    acc[goal.unitOfMeasure] = (acc[goal.unitOfMeasure] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
  statuses: Object.entries(goals.reduce((acc, goal) => {
    acc[goal.status] = (acc[goal.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value })),
});

export const buildManagerEffectiveness = (goals: Goal[], checkIns: CheckIn[], teamMembers: TeamMember[], quarter: Quarter) => (
  Object.entries(teamMembers.reduce((acc, member) => {
    acc[member.managerId] = acc[member.managerId] || [];
    acc[member.managerId].push(member.id);
    return acc;
  }, {} as Record<string, string[]>)).map(([managerId, employeeIds]) => {
    const managerGoals = goals.filter(goal => employeeIds.includes(goal.employeeId) && goal.status === 'approved');
    const managerCheckIns = managerGoals
      .map(goal => checkIns.find(checkIn => checkIn.goalId === goal.id && checkIn.quarter === quarter))
      .filter(Boolean) as CheckIn[];

    return {
      manager: getManagerName(managerId),
      employees: employeeIds.length,
      employeeCompletion: managerGoals.length
        ? Math.round((managerCheckIns.filter(checkIn => checkIn.submittedAt).length / managerGoals.length) * 100)
        : 0,
      managerCompletion: managerGoals.length
        ? Math.round((managerCheckIns.filter(checkIn => checkIn.managerCommentedAt).length / managerGoals.length) * 100)
        : 0,
    };
  })
);
