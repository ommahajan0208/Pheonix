import { Box, Card, CardContent, Grid, Button } from '@mui/material';
import { Download, FileText, BarChart3, TrendingUp, Users } from 'lucide-react';

export default function Reports() {
  const reports = [
    {
      title: 'Goal Completion Report',
      description: 'Overall goal completion rates across the organization',
      icon: BarChart3,
      color: '#1976d2',
    },
    {
      title: 'Employee Performance Summary',
      description: 'Individual performance metrics and achievements',
      icon: Users,
      color: '#2e7d32',
    },
    {
      title: 'Department Analytics',
      description: 'Department-wise goal distribution and progress',
      icon: TrendingUp,
      color: '#9c27b0',
    },
    {
      title: 'Cycle Progress Report',
      description: 'Phase-wise completion status for current cycle',
      icon: FileText,
      color: '#ed6c02',
    },
    {
      title: 'Manager Effectiveness',
      description: 'Manager engagement and team performance metrics',
      icon: Users,
      color: '#1976d2',
    },
    {
      title: 'Custom Export',
      description: 'Create custom reports with selected filters',
      icon: Download,
      color: '#2e7d32',
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Reports</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Generate and download performance analytics reports
        </Box>
      </Box>

      <Grid container spacing={3}>
        {reports.map((report, idx) => {
          const Icon = report.icon;
          return (
            <Grid item xs={12} md={6} key={idx}>
              <Card sx={{ boxShadow: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: `${report.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={28} color={report.color} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
                        {report.title}
                      </Box>
                      <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {report.description}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Download size={16} />}
                      fullWidth
                    >
                      Download PDF
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download size={16} />}
                      fullWidth
                    >
                      Download CSV
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Card sx={{ boxShadow: 2, mt: 3 }}>
        <CardContent>
          <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
            Recent Exports
          </Box>
          <Box>
            {[
              { name: 'Goal Completion Report - May 2026', date: '2026-05-15', size: '2.4 MB' },
              { name: 'Employee Performance Summary - Q1 2026', date: '2026-04-01', size: '1.8 MB' },
              { name: 'Department Analytics - Engineering', date: '2026-03-20', size: '950 KB' },
            ].map((export_, idx) => (
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
                  <Box sx={{ fontWeight: 600, fontSize: 14 }}>{export_.name}</Box>
                  <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {export_.date} / {export_.size}
                  </Box>
                </Box>
                <Button size="small" startIcon={<Download size={16} />}>
                  Download
                </Button>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
