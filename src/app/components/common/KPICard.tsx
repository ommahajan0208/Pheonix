import { Box, Card, CardContent } from '@mui/material';
import { LucideIcon } from 'lucide-react';

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
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
            {title}
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={20} color={color} />
          </Box>
        </Box>
        <Box sx={{ fontSize: 32, fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {value}
        </Box>
        {subtitle && (
          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
            {subtitle}
          </Box>
        )}
        {trend && (
          <Box sx={{ fontSize: 12, color: '#2e7d32', mt: 1, fontWeight: 500 }}>
            {trend}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
