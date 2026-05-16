import { CheckIn, Goal, ScoringDirection, UnitOfMeasure } from '../types';

const clampScore = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(100, Math.round(value));
};

export const getDefaultScoringDirection = (unitOfMeasure: UnitOfMeasure): ScoringDirection => {
  if (unitOfMeasure === 'Timeline') return 'date-based';
  if (unitOfMeasure === 'Zero-based') return 'zero-success';
  return 'higher-is-better';
};

export const getScoringDirectionLabel = (direction: ScoringDirection) => {
  switch (direction) {
    case 'higher-is-better':
      return 'Higher is better';
    case 'lower-is-better':
      return 'Lower is better';
    case 'date-based':
      return 'Date-based';
    case 'zero-success':
      return 'Zero = success';
    default:
      return 'Tracking';
  }
};

export const calculateProgressScore = (
  goal: Goal,
  checkIn: Pick<CheckIn, 'actualValue' | 'achievementDate'>
) => {
  const direction = goal.scoringDirection || getDefaultScoringDirection(goal.unitOfMeasure);
  const actual = Number(checkIn.actualValue);
  const target = Number(goal.target);

  if (direction === 'higher-is-better') {
    if (target <= 0 || !Number.isFinite(actual)) return 0;
    return clampScore((actual / target) * 100);
  }

  if (direction === 'lower-is-better') {
    if (target <= 0 || actual <= 0 || !Number.isFinite(actual)) return 0;
    return clampScore((target / actual) * 100);
  }

  if (direction === 'date-based') {
    if (!checkIn.achievementDate || !goal.deadlineDate) return 0;
    return new Date(checkIn.achievementDate) <= new Date(goal.deadlineDate) ? 100 : 0;
  }

  if (direction === 'zero-success') {
    if (!Number.isFinite(actual)) return 0;
    return actual === 0 ? 100 : 0;
  }

  return 0;
};
