import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, Grid, Card, CardContent, Alert } from '@mui/material';
import { Target, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import GoalCard from '../../components/common/GoalCard';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { goals, notifications } = useData();

  const userGoals = goals.filter(g => g.employeeId === user?.id);
  const approvedGoals = userGoals.filter(g => g.status === 'approved');
  const pendingGoals = userGoals.filter(g => g.status === 'pending');
  const totalWeightage = userGoals.reduce((sum, g) => sum + g.weightage, 0);
  const avgCompletion = userGoals.length > 0
    ? Math.round(userGoals.reduce((sum, g) => sum + g.progress, 0) / userGoals.length)
    : 0;

  const upcomingDeadlines = userGoals
    .filter(g => g.deadlineDate)
    .sort((a, b) => new Date(a.deadlineDate!).getTime() - new Date(b.deadlineDate!).getTime())
    .slice(0, 3);

  const recentActivity = [
    { action: 'Goal "Increase API Response Time" approved', time: '2 hours ago', type: 'success' },
    { action: 'Q2 Check-in deadline in 3 days', time: '1 day ago', type: 'warning' },
    { action: 'Comment added to "Launch Mobile App MVP"', time: '2 days ago', type: 'info' },
  ];

  const unreadNotifs = notifications.filter(n => !n.isRead && n.userId === user?.id);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>
          Welcome back, {user?.name}
        </Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Track your goals and quarterly progress
        </Box>
      </Box>

      {unreadNotifs.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<AlertCircle size={20} />}>
          You have {unreadNotifs.length} unread notification{unreadNotifs.length > 1 ? 's' : ''}
        </Alert>
      )}

      {totalWeightage !== 100 && userGoals.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Your goal weightage is {totalWeightage}%. Please adjust to reach 100% before submission.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Goals"
            value={userGoals.length}
            icon={Target}
            color="#1976d2"
            subtitle="This cycle"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Approved"
            value={approvedGoals.length}
            icon={CheckCircle}
            color="#2e7d32"
            subtitle={`${pendingGoals.length} pending`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Weightage"
            value={`${totalWeightage}%`}
            icon={TrendingUp}
            color={totalWeightage === 100 ? '#2e7d32' : '#ed6c02'}
            subtitle="Target: 100%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Completion"
            value={`${avgCompletion}%`}
            icon={Clock}
            color={avgCompletion >= 50 ? '#2e7d32' : '#ed6c02'}
            subtitle="Across all goals"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                My Goals
              </Box>
              {userGoals.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No goals created yet. Start by adding your first goal!
                </Box>
              ) : (
                userGoals.slice(0, 3).map(goal => (
                  <GoalCard key={goal.id} goal={goal} showActions={false} />
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Upcoming Deadlines
              </Box>
              {upcomingDeadlines.length === 0 ? (
                <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>
                  No upcoming deadlines
                </Box>
              ) : (
                upcomingDeadlines.map(goal => (
                  <Box key={goal.id} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0', '&:last-child': { border: 0 } }}>
                    <Box sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                      {goal.title}
                    </Box>
                    <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {new Date(goal.deadlineDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Box>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Activity Feed
              </Box>
              {recentActivity.map((activity, idx) => (
                <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0', '&:last-child': { border: 0 } }}>
                  <Box sx={{ fontSize: 13, mb: 0.5 }}>
                    {activity.action}
                  </Box>
                  <Box sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {activity.time}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
