import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface SurfaceCardProps extends BoxProps {
  children: ReactNode;
}

export default function SurfaceCard({ children, sx, ...rest }: SurfaceCardProps) {
  return (
    <Box
      {...rest}
      sx={{
        backgroundColor: 'var(--phoenix-surface)',
        border: '1px solid var(--phoenix-border-subtle)',
        borderRadius: 'var(--phoenix-radius-md)',
        boxShadow: 'var(--phoenix-shadow-sm)',
        p: 3,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
