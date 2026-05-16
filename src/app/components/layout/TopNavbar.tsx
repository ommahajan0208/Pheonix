import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import { Search, Bell, LogOut, UserCircle, RefreshCw } from 'lucide-react';

export default function TopNavbar() {
  const navigate = useNavigate();
  const { user, logout, switchRole } = useAuth();
  const { notifications, cycles, markNotificationRead } = useData();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const activeCycle = cycles.find(c => c.isActive);
  const roleNotifications = notifications.filter(n => !user || n.userId === user.id);
  const unreadCount = roleNotifications.filter(n => !n.isRead).length;

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSwitchRole = (role: 'employee' | 'manager' | 'admin') => {
    switchRole(role);
    handleClose();
    navigate(`/${role}/dashboard`);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 1 }}>
      <Toolbar sx={{ gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search goals, employees..."
          sx={{ width: 350 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />

        <Box sx={{ flex: 1 }} />

        {activeCycle && (
          <Chip
            label={activeCycle.name}
            size="small"
            sx={{
              bgcolor: '#e3f2fd',
              color: '#1976d2',
              fontWeight: 600,
              border: '1px solid #1976d2',
            }}
          />
        )}

        <IconButton onClick={handleNotificationClick} size="large">
          <Badge badgeContent={unreadCount} color="error">
            <Bell size={20} />
          </Badge>
        </IconButton>

        <IconButton onClick={handleProfileClick} size="small">
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2' }}>
            {user?.name.charAt(0)}
          </Avatar>
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
            <Box sx={{ fontWeight: 600, fontSize: 14 }}>{user?.name}</Box>
            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{user?.email}</Box>
          </Box>
          <Divider />
          <MenuItem onClick={() => handleSwitchRole('employee')}>
            <UserCircle size={18} style={{ marginRight: 8 }} />
            Switch to Employee
          </MenuItem>
          <MenuItem onClick={() => handleSwitchRole('manager')}>
            <RefreshCw size={18} style={{ marginRight: 8 }} />
            Switch to Manager
          </MenuItem>
          <MenuItem onClick={() => handleSwitchRole('admin')}>
            <RefreshCw size={18} style={{ marginRight: 8 }} />
            Switch to Admin
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogOut size={18} style={{ marginRight: 8 }} />
            Logout
          </MenuItem>
        </Menu>

        <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={handleNotifClose}>
          <Box sx={{ px: 2, py: 1.5, fontWeight: 600, minWidth: 300 }}>
            Notifications
          </Box>
          <Divider />
          {roleNotifications.length === 0 ? (
            <Box sx={{ px: 2, py: 3, textAlign: 'center', color: 'text.secondary' }}>
              No notifications
            </Box>
          ) : (
            roleNotifications.slice(0, 5).map((notif) => (
              <MenuItem
                key={notif.id}
                onClick={() => {
                  markNotificationRead(notif.id);
                  navigate(notif.link);
                  handleNotifClose();
                }}
                sx={{
                  bgcolor: notif.isRead ? 'transparent' : '#f5f5f5',
                  whiteSpace: 'normal',
                  py: 1.5,
                }}
              >
                <Box>
                  <Box sx={{ fontWeight: 600, fontSize: 13 }}>{notif.title}</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                    {notif.message}
                  </Box>
                </Box>
              </MenuItem>
            ))
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
