import { useData } from '../../context/DataContext';
import { Box, Grid, Card, CardContent } from '@mui/material';
import { Users, Target, TrendingUp, Calendar, AlertCircle, FileText } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Admin Dashboard</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Organization-wide performance management overview
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
            color="#1976d2"
            subtitle="Across all departments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Total Goals"
            value={totalGoals}
            icon={Target}
            color="#2e7d32"
            subtitle={`${activeCycle?.name || 'Current cycle'}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Pending Approvals"
            value={pendingApprovals}
            icon={AlertCircle}
            color="#ed6c02"
            subtitle="Awaiting manager review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Active Cycles"
            value={cycles.filter(c => c.isActive).length}
            icon={Calendar}
            color="#9c27b0"
            subtitle="Performance cycles"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Cycle Phase Completion
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cycleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="phase" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completion" fill="#1976d2" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 3 }}>
                Goals by Department
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="employees" fill="#1976d2" name="Employees" />
                  <Bar dataKey="goals" fill="#2e7d32" name="Goals" />
                </BarChart>
              </ResponsiveContainer>
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
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>Manage Cycles</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Configure performance review cycles
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
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>View Audit Logs</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Track all system changes
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
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>Generate Reports</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Export performance analytics
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
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>Escalation Center</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    Review flagged goals
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                System Health
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ fontSize: 13 }}>Goal Completion Rate</Box>
                    <Box sx={{ fontSize: 13, fontWeight: 600, color: '#2e7d32' }}>78%</Box>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                    <Box sx={{ height: '100%', width: '78%', bgcolor: '#2e7d32', borderRadius: 4 }} />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ fontSize: 13 }}>Manager Engagement</Box>
                    <Box sx={{ fontSize: 13, fontWeight: 600, color: '#1976d2' }}>92%</Box>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                    <Box sx={{ height: '100%', width: '92%', bgcolor: '#1976d2', borderRadius: 4 }} />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ fontSize: 13 }}>Employee Participation</Box>
                    <Box sx={{ fontSize: 13, fontWeight: 600, color: '#ed6c02' }}>85%</Box>
                  </Box>
                  <Box sx={{ height: 8, bgcolor: '#e0e0e0', borderRadius: 4 }}>
                    <Box sx={{ height: '100%', width: '85%', bgcolor: '#ed6c02', borderRadius: 4 }} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
