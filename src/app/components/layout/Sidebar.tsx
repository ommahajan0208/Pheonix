import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Chip, Divider } from '@mui/material';
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

const EMPLOYEE_NAV = [
  { path: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employee/my-goals', label: 'My Goals', icon: Target },
  { path: '/employee/submit-review', label: 'Submit Review', icon: CheckCircle },
  { path: '/employee/checkin', label: 'Quarterly Check-in', icon: Calendar },
  { path: '/employee/shared-goals', label: 'Shared Goals', icon: Share2 },
  { path: '/employee/notifications', label: 'Notifications', icon: Bell },
];

const MANAGER_NAV = [
  { path: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/manager/team-goals', label: 'Team Goals', icon: Target },
  { path: '/manager/approvals', label: 'Approvals', icon: CheckCircle },
  { path: '/manager/checkin', label: 'Manager Check-in', icon: Calendar },
  { path: '/manager/analytics', label: 'Team Analytics', icon: TrendingUp },
];

const ADMIN_NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/cycles', label: 'Cycle Management', icon: Calendar },
  { path: '/admin/org-hierarchy', label: 'Org Hierarchy', icon: Network },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { path: '/admin/reports', label: 'Reports', icon: TrendingUp },
  { path: '/admin/escalations', label: 'Escalation Center', icon: AlertCircle },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const navItems = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'manager' ? MANAGER_NAV : EMPLOYEE_NAV;

  return (
    <Box sx={{
      width: 260,
      bgcolor: '#10233f',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: 3,
    }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Target size={32} style={{ marginBottom: 8 }} />
        <Box sx={{ fontSize: 20, fontWeight: 800, letterSpacing: 0 }}>GoalWorks</Box>
        <Box sx={{ fontSize: 12, color: '#b8c5d8', mt: 0.5 }}>Goal Setting Portal</Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

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
                borderRadius: 1,
                color: isActive ? '#fff' : '#b0b0b0',
                bgcolor: isActive ? '#1976d2' : 'transparent',
                borderLeft: isActive ? '3px solid #7dd3fc' : '3px solid transparent',
                '&:hover': {
                  bgcolor: isActive ? '#1565c0' : 'rgba(255,255,255,0.08)',
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
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      <Box sx={{ p: 2 }}>
        <Chip
          label={user?.role.toUpperCase()}
          size="small"
          sx={{
            width: '100%',
            bgcolor: user?.role === 'admin' ? '#9c27b0' : user?.role === 'manager' ? '#1976d2' : '#2e7d32',
            color: 'white',
            fontWeight: 600,
          }}
        />
        <Box sx={{ mt: 1.5, fontSize: 13, color: '#b0b0b0', textAlign: 'center' }}>
          {user?.name}
        </Box>
      </Box>
    </Box>
  );
}
