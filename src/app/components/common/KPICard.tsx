import { Box } from '@mui/material';
import { LucideIcon } from 'lucide-react';
import PremiumCard from './PremiumCard';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  subtitle?: string;
  trend?: string;
}

export default function KPICard({ title, value, icon: Icon, color, subtitle, trend }: KPICardProps) {
  return (
    <PremiumCard sx={{ height: '100%' }} contentSx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ fontSize: 13, color: 'var(--phoenix-text-secondary)', fontWeight: 600 }}>
            {title}
          </Box>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={24} color={color} />
          </Box>
        </Box>
        <Box sx={{ fontSize: 48, lineHeight: 1.1, fontWeight: 800, color: 'var(--phoenix-text-primary)', mb: 0.5 }}>
          {value}
        </Box>
        {subtitle && (
          <Box sx={{ fontSize: 13, color: 'var(--phoenix-text-secondary)' }}>
            {subtitle}
          </Box>
        )}
        {trend && (
          <Box sx={{ fontSize: 12, color: '#2e7d32', mt: 1, fontWeight: 500 }}>
            {trend}
          </Box>
        )}
    </PremiumCard>
  );
}
