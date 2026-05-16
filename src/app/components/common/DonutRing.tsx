import { Box } from '@mui/material';

interface DonutRingProps {
  value: number;
  label: string;
  color?: string;
  size?: number;
}

export default function DonutRing({ value, label, color = '#1976d2', size = 148 }: DonutRingProps) {
  const clamped = Math.min(Math.max(value, 0), 100);

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${color} ${clamped * 3.6}deg, #e8edf5 0deg)`,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Box
          sx={{
            width: size - 28,
            height: size - 28,
            borderRadius: '50%',
            bgcolor: 'white',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'inset 0 0 0 1px #edf1f7',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: 28, fontWeight: 800, color }}>{clamped}%</Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
