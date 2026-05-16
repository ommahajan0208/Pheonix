import { useNavigate } from 'react-router';
import { ReactNode } from 'react';
import { Box, Button, Chip, Divider } from '@mui/material';
import { AlertCircle, Bell, CalendarClock, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

const toneColor = {
  info: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  analytics: '#9c27b0',
};

export default function ContextPanel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, notifications, activities, escalations } = useData();

  const userGoals = user?.role === 'employee' ? goals.filter(g => g.employeeId === user.id) : goals;
  const deadlines = userGoals
    .filter(g => g.deadlineDate && g.progress < 100)
    .sort((a, b) => new Date(a.deadlineDate!).getTime() - new Date(b.deadlineDate!).getTime())
    .slice(0, 3);
  const pendingActions = user?.role === 'manager'
    ? goals.filter(g => g.status === 'pending').slice(0, 3).map(g => ({ label: `Review ${g.employeeName}`, path: '/manager/approvals' }))
    : user?.role === 'admin'
      ? escalations.filter(e => e.status !== 'resolved').slice(0, 3).map(e => ({ label: e.title, path: '/admin/escalations' }))
      : [
          { label: 'Complete Q2 check-in', path: '/employee/checkin' },
          { label: 'Review goal weightage', path: '/employee/my-goals' },
        ];
  const unread = notifications.filter(n => !n.isRead && (!user || n.userId === user.id));

  return (
    <Box
      sx={{
        width: 320,
        borderLeft: '1px solid #dfe5ee',
        bgcolor: '#fbfcfe',
        display: { xs: 'none', xl: 'flex' },
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ fontSize: 15, fontWeight: 800 }}>Context</Box>
          <Chip label={`${unread.length} new`} size="small" color={unread.length ? 'error' : 'default'} />
        </Box>

        <PanelSection title="Pending Actions" icon={<CheckCircle2 size={16} color="#1976d2" />}>
          {pendingActions.map((action) => (
            <Button
              key={action.label}
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => navigate(action.path)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1, borderColor: '#d8e2ef' }}
            >
              {action.label}
            </Button>
          ))}
        </PanelSection>

        <PanelSection title="Deadlines" icon={<CalendarClock size={16} color="#ed6c02" />}>
          {deadlines.map(goal => (
            <Box key={goal.id} sx={{ mb: 1.5 }}>
              <Box sx={{ fontSize: 13, fontWeight: 700 }}>{goal.title}</Box>
              <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                {goal.employeeName} · {new Date(goal.deadlineDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Box>
            </Box>
          ))}
        </PanelSection>

        <PanelSection title="Activity Feed" icon={<TrendingUp size={16} color="#9c27b0" />}>
          {activities.slice(0, 4).map(item => (
            <Box key={item.id} sx={{ display: 'flex', gap: 1.2, mb: 1.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: toneColor[item.tone], mt: 0.7, flexShrink: 0 }} />
              <Box>
                <Box sx={{ fontSize: 13, fontWeight: 700 }}>{item.title}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.35 }}>{item.description}</Box>
              </Box>
            </Box>
          ))}
        </PanelSection>

        <PanelSection title="Notifications" icon={<Bell size={16} color="#d32f2f" />}>
          {unread.length === 0 ? (
            <Box sx={{ fontSize: 13, color: 'text.secondary' }}>No unread notifications.</Box>
          ) : (
            unread.slice(0, 3).map(notif => (
              <Box key={notif.id} sx={{ p: 1.25, mb: 1, borderRadius: 1, bgcolor: '#fff', border: '1px solid #e5eaf2' }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {notif.type === 'deadline' ? <Clock size={14} color="#ed6c02" /> : <AlertCircle size={14} color="#1976d2" />}
                  <Box sx={{ fontSize: 13, fontWeight: 700 }}>{notif.title}</Box>
                </Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{notif.message}</Box>
              </Box>
            ))
          )}
        </PanelSection>
      </Box>
    </Box>
  );
}

function PanelSection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
        {icon}
        <Box sx={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', color: '#536276' }}>{title}</Box>
      </Box>
      {children}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}
