import { Box, LinearProgress } from '@mui/material';

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, showLabel = true }: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  const color = clampedValue >= 75 ? '#2e7d32' : clampedValue >= 50 ? '#1976d2' : clampedValue >= 25 ? '#ed6c02' : '#d32f2f';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={clampedValue}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 4,
            },
          }}
        />
      </Box>
      {showLabel && (
        <Box sx={{ minWidth: 45, fontSize: 13, fontWeight: 600, color }}>
          {clampedValue}%
        </Box>
      )}
    </Box>
  );
}
