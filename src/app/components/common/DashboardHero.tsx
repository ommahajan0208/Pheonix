import { Box, Button } from '@mui/material';
import { ReactNode } from 'react';

interface DashboardHeroProps {
  title: string;
  subtitle: string;
  statLabel?: string;
  statValue?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  icon?: ReactNode;
}

export default function DashboardHero({
  title,
  subtitle,
  statLabel,
  statValue,
  actionLabel,
  onActionClick,
  icon,
}: DashboardHeroProps) {
  return (
    <Box
      sx={{
        mb: 3.5,
        p: 3.5,
        borderRadius: 'var(--phoenix-radius-lg)',
        color: '#ffffff',
        background: 'linear-gradient(135deg, var(--phoenix-hero-start) 0%, var(--phoenix-hero-end) 100%)',
        boxShadow: 'var(--phoenix-shadow-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {icon}
        <Box>
          <Box sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em' }}>{title}</Box>
          <Box sx={{ fontSize: 14, opacity: 0.82 }}>{subtitle}</Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {statLabel && statValue && (
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ fontSize: 12, opacity: 0.75 }}>{statLabel}</Box>
            <Box sx={{ fontSize: 24, color: 'var(--phoenix-highlight)', fontWeight: 700 }}>{statValue}</Box>
          </Box>
        )}
        {actionLabel && (
          <Button variant="contained" onClick={onActionClick} sx={{ bgcolor: 'var(--phoenix-accent)', '&:hover': { bgcolor: 'var(--phoenix-accent-hover)' } }}>
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
