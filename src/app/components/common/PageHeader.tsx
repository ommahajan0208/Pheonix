import { Box, Chip } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  chip?: string;
}

export default function PageHeader({ title, subtitle, action, chip }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 4 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ fontSize: 36, lineHeight: 1.15, fontWeight: 750, letterSpacing: '-0.02em', color: 'var(--phoenix-text-primary)' }}>{title}</Box>
          {chip && (
            <Chip label={chip} size="small" sx={{ bgcolor: 'rgba(25,118,210,0.12)', color: '#1976d2', fontWeight: 700, border: '1px solid rgba(25,118,210,0.3)' }} />
          )}
        </Box>
        <Box sx={{ fontSize: 15, color: 'var(--phoenix-text-secondary)', lineHeight: 1.6 }}>{subtitle}</Box>
      </Box>
      {action}
    </Box>
  );
}
