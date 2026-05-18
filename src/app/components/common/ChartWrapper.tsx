import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ChartWrapperProps extends BoxProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ChartWrapper({ title, subtitle, children, sx, ...rest }: ChartWrapperProps) {
  return (
    <Box
      {...rest}
      sx={{
        borderRadius: 'var(--phoenix-radius-md)',
        border: '1px solid var(--phoenix-border-subtle)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
        boxShadow: 'var(--phoenix-shadow-sm)',
        p: 3,
        ...sx,
      }}
    >
      {(title || subtitle) && (
        <Box sx={{ mb: 2 }}>
          {title && <Box sx={{ fontSize: 18, fontWeight: 700, color: 'var(--phoenix-text-primary)' }}>{title}</Box>}
          {subtitle && <Box sx={{ fontSize: 13, color: 'var(--phoenix-text-secondary)' }}>{subtitle}</Box>}
        </Box>
      )}
      {children}
    </Box>
  );
}
