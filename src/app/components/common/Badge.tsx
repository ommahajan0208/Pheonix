import { Chip, ChipProps } from '@mui/material';

type BadgeTone = 'neutral' | 'blue' | 'green' | 'amber' | 'red' | 'violet';

interface BadgeProps extends Omit<ChipProps, 'color'> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, { color: string; bg: string; border: string }> = {
  neutral: { color: '#475569', bg: 'rgba(71,85,105,0.1)', border: 'rgba(71,85,105,0.22)' },
  blue: { color: '#1976d2', bg: 'rgba(25,118,210,0.12)', border: 'rgba(25,118,210,0.3)' },
  green: { color: '#2e7d32', bg: 'rgba(46,125,50,0.12)', border: 'rgba(46,125,50,0.3)' },
  amber: { color: '#b45309', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  red: { color: '#b91c1c', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.3)' },
  violet: { color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)' },
};

export default function Badge({ tone = 'neutral', sx, ...rest }: BadgeProps) {
  const toneStyle = toneStyles[tone];
  return (
    <Chip
      size="small"
      {...rest}
      sx={{
        fontWeight: 700,
        letterSpacing: '0.02em',
        bgcolor: toneStyle.bg,
        color: toneStyle.color,
        border: `1px solid ${toneStyle.border}`,
        ...sx,
      }}
    />
  );
}
