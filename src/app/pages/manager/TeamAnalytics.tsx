import { useData } from '../../context/DataContext';
import { Box, Grid } from '@mui/material';
import { TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import DashboardHero from '../../components/common/DashboardHero';
import ChartWrapper from '../../components/common/ChartWrapper';
import SurfaceCard from '../../components/common/SurfaceCard';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { buildGoalDistribution, buildManagerEffectiveness, buildQoqTrends } from '../../utils/governanceAnalytics';

const CHART_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#00838f'];

export default function TeamAnalytics() {
  const { goals, checkIns, teamMembers } = useData();

  const totalGoals = goals.length;
  const approvedGoals = goals.filter(g => g.status === 'approved').length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;
  const atRisk = goals.filter(g => g.progress < 50 && g.status === 'approved').length;

  const progressByEmployee = teamMembers.map(member => {
    const employeeGoals = goals.filter(goal => goal.employeeId === member.id);
    return {
      name: member.name,
      progress: employeeGoals.length
        ? Math.round(employeeGoals.reduce((sum, goal) => sum + goal.progress, 0) / employeeGoals.length)
        : 0,
    };
  });

  const qoqTrends = buildQoqTrends(goals, checkIns, teamMembers);
  const distribution = buildGoalDistribution(goals);
  const managerEffectiveness = buildManagerEffectiveness(goals, checkIns, teamMembers, 'Q1');
  const thrustAreaData = distribution.thrustAreas.map(item => ({
    thrust: item.name,
    value: Math.round((item.value / Math.max(goals.length, 1)) * 100),
  }));

  return (
    <Box>
      <DashboardHero
        title="Team Analytics"
        subtitle="Comprehensive performance insights and trends"
        statLabel="Avg Progress"
        statValue={`${avgProgress}%`}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Total Goals"
            value={totalGoals}
            icon={Target}
            color="#9c27b0"
            subtitle="Current cycle"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Approved"
            value={approvedGoals}
            icon={CheckCircle}
            color="#2e7d32"
            subtitle="Ready for check-ins"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="Avg Progress"
            value={`${avgProgress}%`}
            icon={TrendingUp}
            color={avgProgress >= 50 ? '#2e7d32' : '#ed6c02'}
            subtitle="Across all goals"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KPICard
            title="At Risk"
            value={atRisk}
            icon={AlertCircle}
            color="#d32f2f"
            subtitle="Need intervention"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartWrapper title="Progress by Team Member">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressByEmployee}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#1976d2" radius={[8, 8, 0, 0]} name="Avg Progress %" />
                </BarChart>
              </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartWrapper title="Quarter-on-Quarter Achievement">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qoqTrends}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="individual"
                    stroke="#1976d2"
                    strokeWidth={2}
                    name="Individual Achievement %"
                  />
                  <Line
                    type="monotone"
                    dataKey="team"
                    stroke="#2e7d32"
                    strokeWidth={2}
                    name="Team Achievement %"
                  />
                  <Line type="monotone" dataKey="department" stroke="#ed6c02" strokeWidth={2} name="Department Achievement %" />
                </LineChart>
              </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartWrapper title="Performance by Thrust Area">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={thrustAreaData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="thrust" />
                  <PolarRadiusAxis />
                  <Radar name="Performance" dataKey="value" stroke="#1976d2" fill="#6fb2ff" fillOpacity={0.45} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SurfaceCard>
              <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2 }}>
                Completion Heatmap
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {teamMembers.flatMap(member =>
                  qoqTrends.map(trend => {
                    const employeeGoals = goals.filter(goal => goal.employeeId === member.id && goal.status === 'approved');
                    const submitted = employeeGoals.filter(goal => checkIns.some(checkIn => checkIn.goalId === goal.id && checkIn.quarter === trend.quarter && checkIn.submittedAt)).length;
                    const score = employeeGoals.length ? Math.round((submitted / employeeGoals.length) * 100) : 0;
                    const bg = score > 70 ? '#e8f5e9' : score > 40 ? '#fff3e0' : '#ffebee';
                    const color = score > 70 ? '#2e7d32' : score > 40 ? '#ed6c02' : '#d32f2f';
                    return (
                      <Box key={`${member.id}-${trend.quarter}`} sx={{ p: 1.2, borderRadius: 1, bgcolor: bg, border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{member.name.split(' ')[0]}</Box>
                        <Box sx={{ fontSize: 13, fontWeight: 800, color }}>{trend.quarter} {score}%</Box>
                      </Box>
                    );
                  })
                )}
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'var(--phoenix-surface-muted)', borderRadius: 2, border: '1px solid var(--phoenix-border-subtle)' }}>
                <Box sx={{ fontSize: 14, fontWeight: 700, color: 'var(--phoenix-accent)', mb: 0.5 }}>
                  Analytics Insight
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {atRisk} approved goal{atRisk !== 1 ? 's need' : ' needs'} intervention; Q1 employee completion is {qoqTrends[0]?.checkInCompletion || 0}%.
                </Box>
              </Box>
          </SurfaceCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartWrapper title="Goal Distribution">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={distribution.uomTypes} cx="50%" cy="50%" outerRadius={82} dataKey="value" nameKey="name" label>
                        {distribution.uomTypes.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distribution.statuses}>
                      <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} name="Goals" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
          </ChartWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ChartWrapper title="Manager Effectiveness">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={managerEffectiveness}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                  <XAxis dataKey="manager" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employeeCompletion" fill="#2e7d32" radius={[8, 8, 0, 0]} name="Employee Check-ins %" />
                  <Bar dataKey="managerCompletion" fill="#6fb2ff" radius={[8, 8, 0, 0]} name="Manager Comments %" />
                </BarChart>
              </ResponsiveContainer>
          </ChartWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}
