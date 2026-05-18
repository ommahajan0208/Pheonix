import { Chip } from '@mui/material';
import { GoalStatus } from '../../types';

interface StatusPillProps {
  status: GoalStatus;
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bgcolor: string }> = {
  draft: { label: 'Draft', color: '#475569', bgcolor: 'rgba(71,85,105,0.12)' },
  pending: { label: 'Pending', color: '#b45309', bgcolor: 'rgba(245,158,11,0.14)' },
  approved: { label: 'Approved', color: '#2e7d32', bgcolor: 'rgba(46,125,50,0.14)' },
  rework: { label: 'Rework', color: '#b91c1c', bgcolor: 'rgba(220,38,38,0.14)' },
  completed: { label: 'Completed', color: '#2e7d32', bgcolor: 'rgba(46,125,50,0.14)' },
};

export default function StatusPill({ status }: StatusPillProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: config.bgcolor,
        color: config.color,
        fontWeight: 600,
        fontSize: 12,
        height: 24,
        border: `1px solid ${config.color}33`,
        boxShadow: `0 0 0 1px ${config.color}14 inset`,
      }}
    />
  );
}
