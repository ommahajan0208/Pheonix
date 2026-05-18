import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Box, MenuItem } from '@mui/material';
import GoalCard from '../../components/common/GoalCard';
import SharedKpiForm from '../../components/common/SharedKpiForm';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import SurfaceCard from '../../components/common/SurfaceCard';

export default function TeamGoals() {
  const { goals } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

  const employees = Array.from(new Set(goals.map(g => ({ id: g.employeeId, name: g.employeeName }))));
  const filteredGoals = selectedEmployee === 'all'
    ? goals
    : goals.filter(g => g.employeeId === selectedEmployee);

  return (
    <Box>
      <PageHeader
        title="Team Goals"
        subtitle="View and track all team member goals"
        action={
          <FormInput
            select
            id="team-goals-employee-filter"
            name="teamGoalsEmployeeFilter"
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
          </FormInput>
        }
      />

      <SurfaceCard sx={{ mb: 3 }}>
          <Box sx={{ fontSize: 18, fontWeight: 700, mb: 0.5 }}>Push Shared Department KPI</Box>
          <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
            Title, target, and progress stay linked; recipients can adjust only their weightage before submission.
          </Box>
          <SharedKpiForm />
      </SurfaceCard>

      <SurfaceCard>
          <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2 }}>
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
      </SurfaceCard>
    </Box>
  );
}
