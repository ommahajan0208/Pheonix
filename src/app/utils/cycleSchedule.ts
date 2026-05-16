import { Cycle, Quarter } from '../types';

export type CyclePhaseKey = keyof Cycle['phases'];

export const QUARTER_PHASES: Record<Quarter, CyclePhaseKey> = {
  Q1: 'q1Checkin',
  Q2: 'q2Checkin',
  Q3: 'q3Checkin',
  Q4: 'q4Checkin',
};

export const PHASE_METADATA: Record<CyclePhaseKey, { label: string; action: string; color: string }> = {
  goalSetting: {
    label: 'Phase 1 - Goal Setting',
    action: 'Goal creation, submission and approval',
    color: '#1976d2',
  },
  q1Checkin: {
    label: 'Q1 Check-in',
    action: 'Progress update - planned vs. actual',
    color: '#2e7d32',
  },
  q2Checkin: {
    label: 'Q2 Check-in',
    action: 'Progress update - planned vs. actual',
    color: '#2e7d32',
  },
  q3Checkin: {
    label: 'Q3 Check-in',
    action: 'Progress update - planned vs. actual',
    color: '#2e7d32',
  },
  q4Checkin: {
    label: 'Q4 / Annual Capture',
    action: 'Final achievement capture',
    color: '#9c27b0',
  },
  finalReview: {
    label: 'Annual Review',
    action: 'Final manager and HR review',
    color: '#9c27b0',
  },
};

export const getActiveCycle = (cycles: Cycle[]) => cycles.find(cycle => cycle.isActive) || cycles[0];

export const getPhaseForQuarter = (quarter: Quarter): CyclePhaseKey => QUARTER_PHASES[quarter];

export const isDateInPhaseWindow = (cycle: Cycle | undefined, phase: CyclePhaseKey, now = new Date()) => {
  const phaseData = cycle?.phases[phase];
  if (!phaseData) return false;

  const start = new Date(phaseData.start);
  start.setHours(0, 0, 0, 0);

  const end = new Date(phaseData.end);
  end.setHours(23, 59, 59, 999);

  return now >= start && now <= end;
};

export const isPhaseOpen = (cycle: Cycle | undefined, phase: CyclePhaseKey) => Boolean(cycle?.phases[phase]?.isOpen);

export const formatWindowDate = (date?: Date) => (
  date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Not configured'
);

export const getWindowMessage = (cycle: Cycle | undefined, phase: CyclePhaseKey) => {
  const phaseData = cycle?.phases[phase];
  const meta = PHASE_METADATA[phase];
  if (!cycle || !phaseData) return `${meta.label} is not configured.`;

  const status = phaseData.isOpen ? 'Open' : 'Closed';
  return `${status}: ${meta.label} runs ${formatWindowDate(phaseData.start)} - ${formatWindowDate(phaseData.end)}.`;
};

