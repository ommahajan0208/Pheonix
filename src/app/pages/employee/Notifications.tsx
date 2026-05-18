import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, List, ListItem, ListItemButton, ListItemText, Chip } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import SurfaceCard from '../../components/common/SurfaceCard';
import { Bell, CheckCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, markNotificationRead } = useData();

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadNotifications = userNotifications.filter(n => !n.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <CheckCircle size={20} color="#2e7d32" />;
      case 'rework':
        return <AlertCircle size={20} color="#d32f2f" />;
      case 'deadline':
        return <Clock size={20} color="#ed6c02" />;
      case 'comment':
        return <MessageSquare size={20} color="#1976d2" />;
      default:
        return <Bell size={20} />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markNotificationRead(notification.id);
    navigate(notification.link);
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle={`${unreadNotifications.length} unread notification${unreadNotifications.length !== 1 ? 's' : ''}`}
      />

      <SurfaceCard>
          {userNotifications.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Bell size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <Box sx={{ fontSize: 16, mb: 1 }}>No notifications</Box>
              <Box sx={{ fontSize: 14 }}>You're all caught up!</Box>
            </Box>
          ) : (
            <List>
              {userNotifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  disablePadding
                  sx={{
                    bgcolor: notification.isRead ? 'transparent' : '#f5f5f5',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemButton onClick={() => handleNotificationClick(notification)}>
                    <Box sx={{ mr: 2 }}>{getIcon(notification.type)}</Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                            {notification.title}
                          </Box>
                          {!notification.isRead && (
                            <Chip label="New" size="small" color="primary" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                            {notification.message}
                          </Box>
                          <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                            {new Date(notification.createdAt).toLocaleString()}
                          </Box>
                        </Box>
                      }
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
      </SurfaceCard>
    </Box>
  );
}
