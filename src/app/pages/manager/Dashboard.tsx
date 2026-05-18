import { useData } from '../../context/DataContext';
import { Box, Grid } from '@mui/material';
import { Users, Target, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import DashboardHero from '../../components/common/DashboardHero';
import ChartWrapper from '../../components/common/ChartWrapper';
import SurfaceCard from '../../components/common/SurfaceCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ManagerDashboard() {
  const { goals } = useData();

  const teamGoals = goals;
  const pendingApprovals = teamGoals.filter(g => g.status === 'pending').length;
  const approvedGoals = teamGoals.filter(g => g.status === 'approved').length;
  const atRiskGoals = teamGoals.filter(g => g.progress < 50 && g.status === 'approved').length;

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
      <DashboardHero
        title="Manager Dashboard"
        subtitle="Overview of your team's performance and goals"
        statLabel="Pending Approvals"
        statValue={`${pendingApprovals}`}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard title="Team Members" value={3} icon={Users} color="#1976d2" subtitle="Direct reports" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard title="Pending Approvals" value={pendingApprovals} icon={Clock} color="#ed6c02" subtitle="Awaiting review" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard title="Approved Goals" value={approvedGoals} icon={CheckCircle} color="#2e7d32" subtitle="This cycle" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard title="At Risk" value={atRiskGoals} icon={AlertCircle} color="#d32f2f" subtitle="Need attention" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartWrapper title="Goals by Thrust Area" sx={{ mb: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={thrustAreaData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="goals" fill="#1976d2" radius={[8, 8, 0, 0]} name="Total Goals" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <SurfaceCard>
            <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2, color: 'var(--phoenix-text-primary)' }}>
              Team Performance
            </Box>
            {teamMembers.map((member, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  bgcolor: 'var(--phoenix-surface-muted)',
                  borderRadius: 2,
                  border: '1px solid var(--phoenix-border-subtle)',
                }}
              >
                <Box>
                  <Box sx={{ fontWeight: 600 }}>{member.name}</Box>
                  <Box sx={{ fontSize: 12, color: 'var(--phoenix-text-secondary)' }}>
                    {member.goals} goals / {member.approved} approved
                  </Box>
                </Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: member.avgProgress >= 50 ? 'rgba(46,125,50,0.12)' : 'rgba(237,108,2,0.12)',
                    color: member.avgProgress >= 50 ? '#2e7d32' : '#ed6c02',
                    fontWeight: 700,
                  }}
                >
                  {member.avgProgress}% avg
                </Box>
              </Box>
            ))}
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SurfaceCard sx={{ mb: 3 }}>
            <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2 }}>Quick Actions</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                ['Review Pending Approvals', `${pendingApprovals} goals waiting for approval`],
                ['Conduct Check-ins', 'Q2 check-in period active'],
                ['View Team Analytics', 'Detailed performance reports'],
              ].map(([title, subtitle]) => (
                <Box
                  key={title}
                  sx={{
                    p: 2,
                    border: '1px solid var(--phoenix-border-subtle)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'var(--phoenix-surface-muted)', transform: 'translateY(-2px)' },
                  }}
                >
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Box>
                  <Box sx={{ fontSize: 12, color: 'var(--phoenix-text-secondary)' }}>{subtitle}</Box>
                </Box>
              ))}
            </Box>
          </SurfaceCard>

          <SurfaceCard>
            <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2 }}>Recent Activity</Box>
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
                  borderBottom: idx < 2 ? '1px solid var(--phoenix-border)' : 'none',
                }}
              >
                <Box sx={{ fontSize: 13, mb: 0.5 }}>{activity.action}</Box>
                <Box sx={{ fontSize: 11, color: 'var(--phoenix-text-tertiary)' }}>{activity.time}</Box>
              </Box>
            ))}
          </SurfaceCard>
        </Grid>
      </Grid>
    </Box>
  );
}
