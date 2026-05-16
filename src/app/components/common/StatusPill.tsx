import { Chip } from '@mui/material';
import { GoalStatus } from '../../types';

interface StatusPillProps {
  status: GoalStatus;
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string; bgcolor: string }> = {
  draft: { label: 'Draft', color: '#666', bgcolor: '#f0f0f0' },
  pending: { label: 'Pending', color: '#ed6c02', bgcolor: '#fff3e0' },
  approved: { label: 'Approved', color: '#2e7d32', bgcolor: '#e8f5e9' },
  rework: { label: 'Rework', color: '#d32f2f', bgcolor: '#ffebee' },
  completed: { label: 'Completed', color: '#2e7d32', bgcolor: '#e8f5e9' },
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
      }}
    />
  );
}
