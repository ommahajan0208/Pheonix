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
} from '@mui/material';
import { Save } from 'lucide-react';
import GoalCard from '../../components/common/GoalCard';

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
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Manager Check-in</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Review employee progress and provide feedback
        </Box>
      </Box>

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

          {selectedGoal && (
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                  Goal Details
                </Box>
                {employeeGoals
                  .filter(g => g.id === selectedGoal)
                  .map(goal => (
                    <GoalCard key={goal.id} goal={goal} showActions={false} />
                  ))}
              </CardContent>
            </Card>
          )}
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
                  • Review progress against quarterly targets
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  • Identify blockers and provide support
                </Box>
                <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                  • Adjust targets if needed based on changing priorities
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
