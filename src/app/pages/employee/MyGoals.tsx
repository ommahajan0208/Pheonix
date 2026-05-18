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
  TableHead,
  TableRow,
  IconButton,
  MenuItem,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import { Plus, Edit, Trash2, CheckCircle, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import StatusPill from '../../components/common/StatusPill';
import ProgressBar from '../../components/common/ProgressBar';
import CreateGoalDrawer from '../../components/employee/CreateGoalDrawer';
import { Goal } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import ModernTable from '../../components/common/ModernTable';
import SurfaceCard from '../../components/common/SurfaceCard';
import { getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';
import {
  goalCreationWindowMessage,
  lockedGoalMessage,
  maxGoalsMessage,
} from '../../utils/constraintGuidance';

export default function MyGoals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { goals, addGoal, updateGoal, deleteGoal, cycles, validateGoalSheet } = useData();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [selectedCycle, setSelectedCycle] = useState(cycles[0]?.id || '');

  const selectedCycleData = cycles.find(cycle => cycle.id === selectedCycle);
  const goalSettingOpen = isPhaseOpen(selectedCycleData, 'goalSetting');
  const userGoals = goals.filter(g => g.employeeId === user?.id && g.cycleId === selectedCycle);
  const validation = validateGoalSheet(user?.id || '', selectedCycle);
  const totalWeightage = validation.totalWeightage;
  const canSubmit = goalSettingOpen && validation.canSubmit && userGoals.some(goal => ['draft', 'rework'].includes(goal.status));
  const addGoalBlockMessage = !goalSettingOpen
    ? goalCreationWindowMessage(selectedCycleData)
    : userGoals.length >= 8
      ? maxGoalsMessage
      : '';

  const getSubmitBlockMessage = () => {
    if (!goalSettingOpen) return goalCreationWindowMessage(selectedCycleData);
    if (!userGoals.some(goal => ['draft', 'rework'].includes(goal.status))) return 'There are no draft or rework goals available to submit.';
    if (totalWeightage !== 100) return `Your current total weightage is ${totalWeightage}%. It must be exactly 100% before submission is possible.`;
    if (userGoals.length === 0 || userGoals.length > 8) return 'You need 1 to 8 goals before submission is possible.';
    if (userGoals.some(goal => goal.weightage < 10)) return 'Each goal must have at least 10% weightage before submission is possible.';
    return 'Please resolve the validation checklist before submitting.';
  };

  const handleAddGoal = () => {
    if (addGoalBlockMessage) {
      toast.error(addGoalBlockMessage);
      return;
    }
    setEditingGoal(undefined);
    setDrawerOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    if (!goalSettingOpen) {
      toast.error(goalCreationWindowMessage(selectedCycleData));
      return;
    }
    if (goal.status === 'approved') {
      toast.error(lockedGoalMessage);
      return;
    }
    if (!['draft', 'rework'].includes(goal.status)) {
      toast.error('This goal cannot be edited while it is submitted for manager review.');
      return;
    }
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
    const goal = userGoals.find(item => item.id === goalId);
    if (!goalSettingOpen) {
      toast.error(goalCreationWindowMessage(selectedCycleData));
      return;
    }
    if (goal?.status === 'approved') {
      toast.error(lockedGoalMessage);
      return;
    }
    if (goal?.isShared) {
      toast.error('Shared goals cannot be deleted from your sheet. Contact your manager if a correction is needed.');
      return;
    }
    if (goal?.status === 'pending') {
      toast.error('This goal has already been submitted for manager review and cannot be deleted.');
      return;
    }
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(goalId);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My Goals"
        subtitle="Create, validate, and submit your FY 2026 performance goals."
        action={
          <Tooltip title={addGoalBlockMessage}>
            <span>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleAddGoal}
                aria-disabled={Boolean(addGoalBlockMessage)}
                sx={addGoalBlockMessage ? { opacity: 0.55 } : undefined}
              >
                Add Goal
              </Button>
            </span>
          </Tooltip>
        }
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
        <FormInput
          select
          id="my-goals-cycle"
          name="myGoalsCycle"
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
        </FormInput>

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

      <Alert severity={goalSettingOpen ? 'success' : 'info'} sx={{ mb: 3 }}>
        {getWindowMessage(selectedCycleData, 'goalSetting')} Employees can create, edit, and submit goals only while this window is open.
      </Alert>

      {!canSubmit && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ fontWeight: 600, mb: 1 }}>Validation Checklist</Box>
          {validation.checks.map((check, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              {check.passed ? (
                <CheckCircle size={16} color="#2e7d32" />
              ) : (
                <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #ed6c02' }} />
              )}
              <Box sx={{ fontSize: 13 }}>{check.label}</Box>
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
            <ModernTable>
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
                        {goal.isShared && (
                          <Chip icon={<Share2 size={13} />} label="Shared" size="small" sx={{ ml: 1, height: 22, fontSize: 11 }} />
                        )}
                        {goal.status === 'approved' && <Lock size={14} color="#2e7d32" style={{ marginLeft: 6 }} />}
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
                          <Tooltip title={!goalSettingOpen ? goalCreationWindowMessage(selectedCycleData) : goal.status === 'approved' ? lockedGoalMessage : !['draft', 'rework'].includes(goal.status) ? 'This goal cannot be edited while it is submitted for manager review.' : ''}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleEditGoal(goal)}
                                aria-disabled={!goalSettingOpen || !['draft', 'rework'].includes(goal.status)}
                                sx={!goalSettingOpen || !['draft', 'rework'].includes(goal.status) ? { opacity: 0.45 } : undefined}
                              >
                                <Edit size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title={!goalSettingOpen ? goalCreationWindowMessage(selectedCycleData) : goal.status === 'approved' ? lockedGoalMessage : goal.isShared ? 'Shared goals cannot be deleted from your sheet. Contact your manager if a correction is needed.' : goal.status === 'pending' ? 'Submitted goals cannot be deleted while they are awaiting manager review.' : ''}>
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteGoal(goal.id)}
                                aria-disabled={!goalSettingOpen || goal.status === 'approved' || goal.isShared || goal.status === 'pending'}
                                sx={!goalSettingOpen || goal.status === 'approved' || goal.isShared || goal.status === 'pending' ? { opacity: 0.45 } : undefined}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ModernTable>
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
          aria-disabled={!canSubmit}
          sx={!canSubmit ? { opacity: 0.65 } : undefined}
          onClick={() => {
            if (!canSubmit) {
              toast.error(getSubmitBlockMessage());
              return;
            }
            navigate('/dashboard/employee/submit-review');
          }}
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
