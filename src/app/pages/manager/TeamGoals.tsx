import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, TextField, MenuItem } from '@mui/material';
import GoalCard from '../../components/common/GoalCard';
import SharedKpiForm from '../../components/common/SharedKpiForm';

export default function TeamGoals() {
  const { goals } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const employees = Array.from(new Set(goals.map(g => ({ id: g.employeeId, name: g.employeeName }))));
  const filteredGoals = selectedEmployee === 'all'
    ? goals
    : goals.filter(g => g.employeeId === selectedEmployee);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Team Goals</Box>
          <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
            View and track all team member goals
          </Box>
        </Box>
        <TextField
          select
          size="small"
          label="Filter by Employee"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          sx={{ width: 250 }}
        >
          <MenuItem value="all">All Employees</MenuItem>
          {employees.map((emp) => (
            <MenuItem key={emp.id} value={emp.id}>
              {emp.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ fontSize: 18, fontWeight: 700, mb: 0.5 }}>Push Shared Department KPI</Box>
          <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            Title, target, and progress stay linked; recipients can adjust only their weightage before submission.
          </Box>
          <SharedKpiForm />
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
            {filteredGoals.length} Goal{filteredGoals.length !== 1 ? 's' : ''}
          </Box>
          {filteredGoals.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              No goals found
            </Box>
          ) : (
            filteredGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} showActions={false} />
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
