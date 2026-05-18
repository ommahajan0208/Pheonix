import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import {
  LayoutDashboard,
  Target,
  CheckCircle,
  Users,
  TrendingUp,
  Settings,
  Calendar,
  Network,
  FileText,
  AlertCircle,
  Bell,
  Share2,
} from 'lucide-react';
import Badge from '../common/Badge';

const EMPLOYEE_NAV = [
  { path: '/dashboard/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/employee/my-goals', label: 'My Goals', icon: Target },
  { path: '/dashboard/employee/submit-review', label: 'Submit Review', icon: CheckCircle },
  { path: '/dashboard/employee/checkin', label: 'Quarterly Check-in', icon: Calendar },
  { path: '/dashboard/employee/shared-goals', label: 'Shared Goals', icon: Share2 },
  { path: '/dashboard/employee/notifications', label: 'Notifications', icon: Bell },
];

const MANAGER_NAV = [
  { path: '/dashboard/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/manager/team-goals', label: 'Team Goals', icon: Target },
  { path: '/dashboard/manager/approvals', label: 'Approvals', icon: CheckCircle },
  { path: '/dashboard/manager/checkin', label: 'Manager Check-in', icon: Calendar },
  { path: '/dashboard/manager/analytics', label: 'Team Analytics', icon: TrendingUp },
];

const ADMIN_NAV = [
  { path: '/dashboard/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/admin/cycles', label: 'Cycle Management', icon: Calendar },
  { path: '/dashboard/admin/org-hierarchy', label: 'Org Hierarchy', icon: Network },
  { path: '/dashboard/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/dashboard/admin/reports', label: 'Reports', icon: TrendingUp },
  { path: '/dashboard/admin/escalations', label: 'Escalation Center', icon: AlertCircle },
  { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'manager' ? MANAGER_NAV : EMPLOYEE_NAV;

  return (
    <Box sx={{
      width: 260,
      background: 'linear-gradient(180deg, var(--phoenix-hero-start) 0%, var(--phoenix-hero-end) 100%)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 'var(--phoenix-shadow-lg)',
    }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Target size={32} style={{ marginBottom: 8 }} />
        <Box sx={{ fontSize: 20, fontWeight: 800, letterSpacing: 0 }}>Pheonix</Box>
        <Box sx={{ fontSize: 12, color: 'rgba(232,238,251,0.7)', mt: 0.5 }}>Goal Setting Portal</Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(226,232,240,0.14)' }} />

      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                color: isActive ? '#fff' : 'rgba(232,238,251,0.8)',
                bgcolor: isActive ? 'rgba(111,178,255,0.18)' : 'transparent',
                border: isActive ? '1px solid rgba(111,178,255,0.42)' : '1px solid transparent',
                backdropFilter: isActive ? 'blur(8px)' : 'none',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(111,178,255,0.24)' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14.5,
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <Badge
          label={user?.role.toUpperCase()}
          tone={user?.role === 'admin' ? 'violet' : user?.role === 'manager' ? 'blue' : 'green'}
          sx={{
            width: '100%',
            fontWeight: 600,
          }}
        />
        <Box sx={{ mt: 1.5, fontSize: 13, color: 'rgba(232,238,251,0.8)', textAlign: 'center' }}>
          {user?.name}
        </Box>
      </Box>
    </Box>
  );
}
