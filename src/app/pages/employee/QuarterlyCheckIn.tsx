import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { Save, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export default function QuarterlyCheckIn() {
  const { user } = useAuth();
  const { goals, addCheckIn } = useData();
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [checkInData, setCheckInData] = useState<Record<string, { planned: number; actual: number; status: string; comments: string }>>({});
  const [notice, setNotice] = useState('');

  const userGoals = goals.filter(g => g.employeeId === user?.id && g.status === 'approved');

  const handleDataChange = (goalId: string, field: 'planned' | 'actual' | 'status' | 'comments', value: any) => {
    setCheckInData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const calculateStatus = (goalId: string) => {
    const data = checkInData[goalId];
    if (!data) return 'Not Started';
    const actual = data.actual || 0;
    const planned = data.planned || 0;
    if (actual >= planned * 0.9) return 'On Track';
    if (actual >= planned * 0.7) return 'At Risk';
    return 'Off Track';
  };

  const statusCounts = userGoals.reduce((acc, goal) => {
    const status = calculateStatus(goal.id);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = [
    { name: 'On Track', value: statusCounts['On Track'] || 0, color: '#2e7d32' },
    { name: 'At Risk', value: statusCounts['At Risk'] || 0, color: '#ed6c02' },
    { name: 'Off Track', value: statusCounts['Off Track'] || 0, color: '#d32f2f' },
  ];

  const handleSaveDraft = () => setNotice(`${selectedQuarter} draft saved locally.`);
  const handleSubmit = () => {
    userGoals.forEach(goal => {
      const data = checkInData[goal.id];
      if (data) {
        addCheckIn({
          goalId: goal.id,
          quarter: selectedQuarter,
          plannedValue: data.planned || 0,
          actualValue: data.actual || 0,
          status: (data.status || 'on-track') as 'on-track' | 'at-risk' | 'off-track',
          comments: data.comments || '',
          evidenceUrls: [],
          submittedAt: new Date(),
        });
      }
    });
    setNotice(`${selectedQuarter} check-in submitted for manager review.`);
  };

  return (
    <Box>
      <PageHeader title="Quarterly Check-in" subtitle="Track planned vs actual performance and submit evidence for manager review." />
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Tabs value={selectedQuarter} onChange={(_, v) => setSelectedQuarter(v)}>
            <Tab label="Q1" value="Q1" />
            <Tab label="Q2" value="Q2" />
            <Tab label="Q3" value="Q3" />
            <Tab label="Q4" value="Q4" />
          </Tabs>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                {selectedQuarter} Progress Tracking
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Goal</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Planned</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actual</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Evidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userGoals.map((goal) => (
                      <TableRow key={goal.id}>
                        <TableCell>
                          <Box sx={{ fontWeight: 600, fontSize: 14 }}>{goal.title}</Box>
                          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                            Target: {goal.target} {goal.unitOfMeasure}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={checkInData[goal.id]?.planned || ''}
                            onChange={(e) => handleDataChange(goal.id, 'planned', Number(e.target.value))}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={checkInData[goal.id]?.actual || ''}
                            onChange={(e) => handleDataChange(goal.id, 'actual', Number(e.target.value))}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={checkInData[goal.id]?.status || 'on-track'}
                            onChange={(e) => handleDataChange(goal.id, 'status', e.target.value)}
                            sx={{ width: 120 }}
                          >
                            <MenuItem value="on-track">On Track</MenuItem>
                            <MenuItem value="at-risk">At Risk</MenuItem>
                            <MenuItem value="off-track">Off Track</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            value={checkInData[goal.id]?.comments || ''}
                            onChange={(e) => handleDataChange(goal.id, 'comments', e.target.value)}
                            placeholder="Add comments..."
                            sx={{ width: 200 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" startIcon={<Upload size={14} />}>
                            Upload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleSaveDraft}>Save Draft</Button>
                <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSubmit}>
                  Submit Check-in
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                {selectedQuarter} Status Overview
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
