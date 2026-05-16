import { useData } from '../../context/DataContext';
import { Box, Grid, Card, CardContent } from '@mui/material';
import { Users, Target, CheckCircle, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ManagerDashboard() {
  const { goals } = useData();

  const teamGoals = goals;
  const pendingApprovals = teamGoals.filter(g => g.status === 'pending').length;
  const approvedGoals = teamGoals.filter(g => g.status === 'approved').length;
  const atRiskGoals = teamGoals.filter(g => g.progress < 50 && g.status === 'approved').length;

  const avgProgress = teamGoals.length > 0
    ? Math.round(teamGoals.reduce((sum, g) => sum + g.progress, 0) / teamGoals.length)
    : 0;

  const thrustAreaData = [
    { name: 'Revenue', goals: teamGoals.filter(g => g.thrustArea === 'Revenue').length },
    { name: 'Customer Success', goals: teamGoals.filter(g => g.thrustArea === 'Customer Success').length },
    { name: 'Innovation', goals: teamGoals.filter(g => g.thrustArea === 'Innovation').length },
    { name: 'Efficiency', goals: teamGoals.filter(g => g.thrustArea === 'Efficiency').length },
    { name: 'Team Dev', goals: teamGoals.filter(g => g.thrustArea === 'Team Development').length },
  ];

  const teamMembers = [
    { name: 'John Smith', goals: 4, approved: 4, avgProgress: 32 },
    { name: 'Jane Doe', goals: 5, approved: 5, avgProgress: 48 },
    { name: 'Mike Johnson', goals: 3, approved: 2, avgProgress: 25 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Manager Dashboard</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Overview of your team's performance and goals
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Team Members"
            value={3}
            icon={Users}
            color="#1976d2"
            subtitle="Direct reports"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={Clock}
            color="#ed6c02"
            subtitle="Awaiting review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Approved Goals"
            value={approvedGoals}
            icon={CheckCircle}
            color="#2e7d32"
            subtitle="This cycle"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="At Risk"
            value={atRiskGoals}
            icon={AlertCircle}
            color="#d32f2f"
            subtitle="Need attention"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Goals by Thrust Area
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={thrustAreaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="goals" fill="#1976d2" name="Total Goals" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Team Performance
              </Box>
              <Box>
                {teamMembers.map((member, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      mb: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Box sx={{ fontWeight: 600 }}>{member.name}</Box>
                      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {member.goals} goals / {member.approved} approved
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        bgcolor: member.avgProgress >= 50 ? '#e8f5e9' : '#fff3e0',
                        color: member.avgProgress >= 50 ? '#2e7d32' : '#ed6c02',
                        fontWeight: 600,
                      }}
                    >
                      {member.avgProgress}% avg
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>Review Pending Approvals</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {pendingApprovals} goals waiting for approval
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>Conduct Check-ins</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Q2 check-in period active
                  </Box>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>View Team Analytics</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Detailed performance reports
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Recent Activity
              </Box>
              <Box>
                {[
                  { action: 'John Smith submitted 4 goals', time: '2 hours ago' },
                  { action: 'Q2 check-in deadline in 5 days', time: '1 day ago' },
                  { action: 'Jane Doe completed Mobile App MVP', time: '2 days ago' },
                ].map((activity, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      pb: 2,
                      borderBottom: idx < 2 ? '1px solid #e0e0e0' : 'none',
                    }}
                  >
                    <Box sx={{ fontSize: 13, mb: 0.5 }}>{activity.action}</Box>
                    <Box sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {activity.time}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
