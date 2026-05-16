import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import ProgressBar from '../../components/common/ProgressBar';
import CreateGoalDrawer from '../../components/employee/CreateGoalDrawer';
import { Goal } from '../../types';
import PageHeader from '../../components/common/PageHeader';

export default function MyGoals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { goals, addGoal, updateGoal, deleteGoal, cycles } = useData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');

  const userGoals = goals.filter(g => g.employeeId === user?.id && g.cycleId === selectedCycle);
  const totalWeightage = userGoals.reduce((sum, g) => sum + g.weightage, 0);

  const validations = [
    { label: 'Weightage equals 100%', passed: totalWeightage === 100 },
    { label: 'Maximum 8 goals', passed: userGoals.length <= 8 },
    { label: 'Each goal minimum 10% weightage', passed: userGoals.every(g => g.weightage >= 10) },
  ];

  const canSubmit = validations.every(v => v.passed);

  const handleAddGoal = () => {
    setEditingGoal(undefined);
    setDrawerOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setDrawerOpen(true);
  };

  const handleSaveGoal = (goalData: Partial<Goal>) => {
    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
    } else {
      addGoal({
        ...goalData,
        employeeId: user!.id,
        employeeName: user!.name,
        progress: 0,
        status: 'draft',
        cycleId: selectedCycle,
        isShared: false,
      } as Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setDrawerOpen(false);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Goals"
        subtitle="Create, validate, and submit your FY 2026 performance goals."
        action={<Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleAddGoal}
          disabled={userGoals.length >= 8}
        >
          Add Goal
        </Button>}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <TextField
          select
          size="small"
          label="Cycle"
          value={selectedCycle}
          onChange={(e) => setSelectedCycle(e.target.value)}
          sx={{ width: 200 }}
        >
          {cycles.map((cycle) => (
            <MenuItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </MenuItem>
          ))}
        </TextField>

        <Chip
          label={`Weightage: ${totalWeightage}/100%`}
          sx={{
            bgcolor: totalWeightage === 100 ? '#e8f5e9' : totalWeightage > 100 ? '#ffebee' : '#fff3e0',
            color: totalWeightage === 100 ? '#2e7d32' : totalWeightage > 100 ? '#d32f2f' : '#ed6c02',
            fontWeight: 600,
            borderRadius: 1,
            px: 2,
          }}
        />
      </Box>

      {!canSubmit && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ fontWeight: 600, mb: 1 }}>Validation Checklist</Box>
          {validations.map((validation, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {validation.passed ? (
                <CheckCircle size={16} color="#2e7d32" />
              ) : (
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ed6c02' }} />
              )}
              <Box sx={{ fontSize: 13 }}>{validation.label}</Box>
            </Box>
          ))}
        </Alert>
      )}

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          {userGoals.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Box sx={{ fontSize: 16, mb: 1 }}>No goals created yet</Box>
              <Box sx={{ fontSize: 14 }}>Click "Add Goal" to create your first goal</Box>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Thrust Area</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>UoM</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Weightage</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userGoals.map((goal) => (
                    <TableRow key={goal.id} hover>
                      <TableCell>
                        <Box sx={{ fontWeight: 600, fontSize: 14 }}>{goal.title}</Box>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
                          {goal.description}
                        </Box>
                      </TableCell>
                      <TableCell>{goal.thrustArea}</TableCell>
                      <TableCell>{goal.unitOfMeasure}</TableCell>
                      <TableCell>
                        {goal.target}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${goal.weightage}%`}
                          size="small"
                          sx={{
                            bgcolor: goal.weightage >= 10 ? '#e3f2fd' : '#ffebee',
                            color: goal.weightage >= 10 ? '#1976d2' : '#d32f2f',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <ProgressBar value={goal.progress} />
                      </TableCell>
                      <TableCell>
                        <StatusPill status={goal.status} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditGoal(goal)}
                            disabled={goal.status === 'approved'}
                          >
                            <Edit size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteGoal(goal.id)}
                            disabled={goal.status === 'approved'}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2.5 }}>
        <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
          Submit is enabled when total weightage is exactly 100%, there are 1-8 goals, and every goal is at least 10%.
        </Box>
        <Button
          variant="contained"
          color={canSubmit ? 'primary' : 'inherit'}
          startIcon={<CheckCircle size={18} />}
          disabled={!canSubmit}
          onClick={() => navigate('/employee/submit-review')}
        >
          Submit for Review
        </Button>
      </Box>

      <CreateGoalDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveGoal}
        existingGoal={editingGoal}
        totalWeightage={totalWeightage}
      />
    </Box>
  );
}
