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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 3 }}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box sx={{ fontSize: 24, fontWeight: 750, letterSpacing: 0 }}>{title}</Box>
          {chip && (
            <Chip label={chip} size="small" sx={{ bgcolor: '#eef4ff', color: '#1976d2', fontWeight: 700 }} />
          )}
        </Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>{subtitle}</Box>
      </Box>
      {action}
    </Box>
  );
}
