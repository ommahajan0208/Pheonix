import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function ManagerCheckIn() {
  const { goals } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('emp-001');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');

  const employees = Array.from(new Set(goals.map(g => ({ id: g.employeeId, name: g.employeeName }))));
  const employeeGoals = goals.filter(g => g.employeeId === selectedEmployee && g.status === 'approved');

  return (
    <Box>
      <PageHeader title="Manager Check-in" subtitle="Review planned vs actual progress and capture feedback, risk, and next actions." />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Select Employee & Goal
              </Box>
              <TextField
                select
                fullWidth
                label="Employee"
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setSelectedGoal('');
                }}
                sx={{ mb: 2 }}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="Goal"
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                disabled={!selectedEmployee}
              >
                {employeeGoals.map((goal) => (
                  <MenuItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </MenuItem>
                ))}
              </TextField>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Planned vs Actual
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Goal</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Planned</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actual</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Risk</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeGoals.map(goal => {
                    const risk = goal.progress < 30 ? 'High' : goal.progress < 55 ? 'Medium' : 'Low';
                    return (
                      <TableRow key={goal.id} hover selected={selectedGoal === goal.id} onClick={() => setSelectedGoal(goal.id)} sx={{ cursor: 'pointer' }}>
                        <TableCell>{goal.title}</TableCell>
                        <TableCell>{goal.target}</TableCell>
                        <TableCell>{goal.progress}%</TableCell>
                        <TableCell>
                          <Chip label={risk} size="small" color={risk === 'High' ? 'error' : risk === 'Medium' ? 'warning' : 'success'} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Feedback & Assessment
              </Box>

              <TextField
                select
                fullWidth
                label="Risk Level"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                sx={{ mb: 2 }}
              >
                <MenuItem value="low">Low Risk</MenuItem>
                <MenuItem value="medium">Medium Risk</MenuItem>
                <MenuItem value="high">High Risk</MenuItem>
              </TextField>

              <TextField
                fullWidth
                multiline
                rows={8}
                label="Manager Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback on progress, challenges, and recommendations..."
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}>
                  Recommendations
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  - Review progress against quarterly targets
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  - Identify blockers and provide support
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  - Adjust targets if needed based on changing priorities
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Save size={18} />}
                disabled={!selectedGoal || !feedback}
              >
                Save Feedback
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
