import { Card, CardContent, CardProps, CardContentProps } from '@mui/material';
import { ReactNode } from 'react';

interface PremiumCardProps extends Omit<CardProps, 'children'> {
  children: ReactNode;
  contentSx?: CardContentProps['sx'];
}

export default function PremiumCard({ children, contentSx, sx, ...rest }: PremiumCardProps) {
  return (
    <Card
      {...rest}
      sx={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        border: '1px solid var(--phoenix-border-subtle)',
        boxShadow: 'var(--phoenix-shadow-md)',
        borderRadius: 'var(--phoenix-radius-md)',
        transition: 'transform var(--phoenix-transition), box-shadow var(--phoenix-transition)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 'var(--phoenix-shadow-glow)',
        },
        ...sx,
      }}
    >
      <CardContent sx={{ p: 'var(--phoenix-space-card)', '&:last-child': { pb: 'var(--phoenix-space-card)' }, ...contentSx }}>
        {children}
      </CardContent>
    </Card>
  );
}
