import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, Grid } from '@mui/material';
import { TrendingUp, Target, CheckCircle, AlertCircle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
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
} from 'recharts';

export default function TeamAnalytics() {
  const { goals } = useData();

  const totalGoals = goals.length;
  const approvedGoals = goals.filter(g => g.status === 'approved').length;
  const avgProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0;
  const atRisk = goals.filter(g => g.progress < 50 && g.status === 'approved').length;

  const progressByEmployee = [
    { name: 'John Smith', progress: 32 },
    { name: 'Jane Doe', progress: 48 },
    { name: 'Mike Johnson', progress: 25 },
  ];

  const monthlyTrend = [
    { month: 'Jan', completion: 10 },
    { month: 'Feb', completion: 15 },
    { month: 'Mar', completion: 25 },
    { month: 'Apr', completion: 30 },
    { month: 'May', completion: 35 },
  ];

  const thrustAreaData = [
    { thrust: 'Revenue', value: 85 },
    { thrust: 'Customer Success', value: 70 },
    { thrust: 'Innovation', value: 60 },
    { thrust: 'Efficiency', value: 75 },
    { thrust: 'Team Dev', value: 65 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Team Analytics</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Comprehensive performance insights and trends
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Goals"
            value={totalGoals}
            icon={Target}
            color="#9c27b0"
            trend="+12% from last cycle"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Approved"
            value={approvedGoals}
            icon={CheckCircle}
            color="#2e7d32"
            trend="+8% approval rate"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg Progress"
            value={`${avgProgress}%`}
            icon={TrendingUp}
            color={avgProgress >= 50 ? '#2e7d32' : '#ed6c02'}
            trend="+5% this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Progress by Team Member
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={progressByEmployee}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#9c27b0" name="Avg Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Monthly Completion Trend
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="#9c27b0"
                    strokeWidth={2}
                    name="Completion %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Performance by Thrust Area
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={thrustAreaData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="thrust" />
                  <PolarRadiusAxis />
                  <Radar name="Performance" dataKey="value" stroke="#9c27b0" fill="#9c27b0" fillOpacity={0.45} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Risk Heatmap
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                {['Revenue', 'Customer', 'Innovation', 'Efficiency', 'Team'].flatMap((area, areaIdx) =>
                  ['Q1', 'Q2', 'Q3'].map((quarter, qIdx) => {
                    const score = (areaIdx * 17 + qIdx * 23 + 38) % 100;
                    const bg = score > 70 ? '#e8f5e9' : score > 40 ? '#fff3e0' : '#ffebee';
                    const color = score > 70 ? '#2e7d32' : score > 40 ? '#ed6c02' : '#d32f2f';
                    return (
                      <Box key={`${area}-${quarter}`} sx={{ p: 1.2, borderRadius: 1, bgcolor: bg, border: '1px solid rgba(0,0,0,0.05)' }}>
                        <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{area}</Box>
                        <Box sx={{ fontSize: 13, fontWeight: 800, color }}>{quarter} {score}%</Box>
                      </Box>
                    );
                  })
                )}
              </Box>
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f3e5f5', borderRadius: 1 }}>
                <Box sx={{ fontSize: 14, fontWeight: 700, color: '#9c27b0', mb: 0.5 }}>
                  Analytics Insight
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  {atRisk} approved goal{atRisk !== 1 ? 's need' : ' needs'} intervention; Innovation and Efficiency carry the highest delivery risk.
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
