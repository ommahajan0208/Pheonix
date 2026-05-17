import { Cycle, Quarter } from '../types';
import { CyclePhaseKey, formatWindowDate, PHASE_METADATA } from './cycleSchedule';

const windowRange = (cycle: Cycle | undefined, phase: CyclePhaseKey) => {
  const phaseData = cycle?.phases[phase];
  if (!phaseData) return 'the configured window is not available';
  return `${formatWindowDate(phaseData.start)} - ${formatWindowDate(phaseData.end)}`;
};

export const goalCreationWindowMessage = (cycle: Cycle | undefined) => (
  `Goal creation is only available during Phase 1. Next window: ${windowRange(cycle, 'goalSetting')}.`
);

export const maxGoalsMessage = 'You have reached the 8-goal limit. Delete or consolidate an existing goal before adding a new one.';

export const minimumWeightageMessage = 'Minimum goal weightage is 10%. Please correct it before saving.';

export const lockedGoalMessage = 'This goal is locked because it has been approved. Ask your admin to unlock it if a correction is needed.';

export const sharedWeightageLockedMessage = 'This contribution weightage is locked because the goal has been submitted or approved. Contact your manager if a correction is needed.';

export const checkInWindowClosedMessage = (cycle: Cycle | undefined, quarter: Quarter, phase: CyclePhaseKey) => (
  `The ${quarter} check-in window is closed. It will reopen ${windowRange(cycle, phase)}.`
);

export const phaseWindowTooltip = (cycle: Cycle | undefined, phase: CyclePhaseKey) => {
  const meta = PHASE_METADATA[phase];
  return `${meta.label} runs ${windowRange(cycle, phase)}.`;
};

export const managerApprovalWindowClosedMessage = 'Approvals and returns are only available during Phase 1. The goal-setting window is currently closed.';

export const managerInlineEditClosedMessage = 'Inline target and weightage edits are only available during Phase 1. The goal-setting window is currently closed.';

export const managerDirectReportOnlyMessage = 'You only have approval rights over your own direct reports.';

export const managerCheckInWindowClosedMessage = (cycle: Cycle | undefined, quarter: Quarter, phase: CyclePhaseKey) => (
  `Manager check-in comments can only be saved while the ${quarter} check-in window is open. Current window: ${windowRange(cycle, phase)}.`
);

export const employeeCheckInNotSubmittedMessage = 'This employee has not submitted their check-in for this quarter yet. Planned and actual values are unavailable, but you can still write and save your manager comment in advance.';

export const sharedKpiWindowClosedMessage = 'Shared KPIs can only be pushed during the Phase 1 goal-setting window. The window is currently closed.';

export const sharedKpiRecipientRequiredMessage = 'Select at least one recipient before pushing a shared KPI.';

export const goalPolicyConflictMessage = (maxGoals: number, minimumWeightage: number, requiredTotal: number) => (
  `This goal policy is inconsistent: ${maxGoals} goals at a minimum of ${minimumWeightage}% would require ${maxGoals * minimumWeightage}% total weightage, but the required total is ${requiredTotal}%. Lower the maximum goals or minimum weightage, or raise the required total.`
);

export const unlockGoalConfirmationMessage = (goalTitle: string, employeeName: string) => (
  `Unlock "${goalTitle}" for ${employeeName}? This moves the approved goal back to rework, notifies the employee, creates an audit entry, and cannot be undone.`
);

export const resetSettingsConfirmationMessage = 'Reset system settings to defaults? This overwrites notification settings, security configuration, and integration credentials for the entire organisation.';

export const invalidPhaseDateRangeMessage = (phaseLabel: string) => (
  `${phaseLabel} has an invalid date range. The end date must be on or after the start date.`
);

export const overlappingPhaseWindowMessage = (firstPhaseLabel: string, secondPhaseLabel: string) => (
  `${firstPhaseLabel} overlaps with ${secondPhaseLabel}. Each phase must start after the previous one ends.`
);

export const simultaneousOpenPhaseMessage = (phaseLabel: string, openPhaseLabel: string) => (
  `${openPhaseLabel} is already open. Opening ${phaseLabel} will make two phases active simultaneously. Confirm this is intentional before proceeding.`
);

export const escalationAlreadyResolvedMessage = 'This escalation is already resolved. No action is needed.';

export const reopenEscalationConfirmationMessage = 'Reopen this resolved escalation? Relevant parties will be notified again.';

export const emptyAuditExportMessage = 'There is nothing to export for the current search or filter. Adjust the filters and try again.';
