import { useData } from '../../context/DataContext';
import { Box, Grid } from '@mui/material';
import { Users, Target, Calendar, AlertCircle } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import DashboardHero from '../../components/common/DashboardHero';
import ChartWrapper from '../../components/common/ChartWrapper';
import SurfaceCard from '../../components/common/SurfaceCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const { goals, cycles } = useData();
  const activeCycle = cycles.find(c => c.isActive);
  const totalEmployees = 15;
  const totalGoals = goals.length;
  const approvedGoals = goals.filter(g => g.status === 'approved').length;
  const pendingApprovals = goals.filter(g => g.status === 'pending').length;

  const cycleData = [
    { phase: 'Goal Setting', completion: 85 },
    { phase: 'Q1 Check-in', completion: 100 },
    { phase: 'Q2 Check-in', completion: 45 },
    { phase: 'Q3 Check-in', completion: 0 },
    { phase: 'Q4 Check-in', completion: 0 },
    { phase: 'Final Review', completion: 0 },
  ];

  const departmentData = [
    { name: 'Engineering', employees: 8, goals: 32 },
    { name: 'Product', employees: 4, goals: 16 },
    { name: 'Sales', employees: 3, goals: 12 },
  ];

  return (
    <Box>
      <DashboardHero title="Admin Dashboard" subtitle="Organization-wide performance management overview" statLabel="Approved Goals" statValue={`${approvedGoals}`} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Total Employees" value={totalEmployees} icon={Users} color="#1976d2" subtitle="Across all departments" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Total Goals" value={totalGoals} icon={Target} color="#2e7d32" subtitle={`${activeCycle?.name || 'Current cycle'}`} /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Pending Approvals" value={pendingApprovals} icon={AlertCircle} color="#ed6c02" subtitle="Awaiting manager review" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPICard title="Active Cycles" value={cycles.filter(c => c.isActive).length} icon={Calendar} color="#1976d2" subtitle="Performance cycles" /></Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartWrapper title="Cycle Phase Completion" sx={{ mb: 3 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cycleData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="phase" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completion" fill="#1976d2" radius={[8, 8, 0, 0]} name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper title="Goals by Department">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="employees" fill="#1976d2" radius={[8, 8, 0, 0]} name="Employees" />
                <Bar dataKey="goals" fill="#6fb2ff" radius={[8, 8, 0, 0]} name="Goals" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SurfaceCard sx={{ mb: 3 }}>
            <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>Quick Actions</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                ['Manage Cycles', 'Configure performance review cycles'],
                ['View Audit Logs', 'Track all system changes'],
                ['Generate Reports', 'Export performance analytics'],
                ['Escalation Center', 'Review flagged goals'],
              ].map(([title, subtitle]) => (
                <Box key={title} sx={{ p: 2, border: '1px solid var(--phoenix-border-subtle)', borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: 'var(--phoenix-surface-muted)' } }}>
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle}</Box>
                </Box>
              ))}
            </Box>
          </SurfaceCard>

          <SurfaceCard>
            <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>System Health</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                ['Goal Completion Rate', '78%', '#2e7d32', 78],
                ['Manager Engagement', '92%', '#1976d2', 92],
                ['Employee Participation', '85%', '#ed6c02', 85],
              ].map(([label, value, color, width]) => (
                <Box key={label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ fontSize: 13 }}>{label}</Box>
                    <Box sx={{ fontSize: 13, fontWeight: 600, color }}>{value}</Box>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: 'var(--phoenix-border)', borderRadius: 999 }}>
                    <Box sx={{ height: '100%', width: `${width}%`, bgcolor: color, borderRadius: 4 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          </SurfaceCard>
        </Grid>
      </Grid>
    </Box>
  );
}