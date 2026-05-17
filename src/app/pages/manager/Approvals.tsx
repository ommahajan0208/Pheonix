import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Button,
  Alert,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { CheckCircle, RotateCcw, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Goal } from '../../types';
import StatusPill from '../../components/common/StatusPill';
import ProgressBar from '../../components/common/ProgressBar';
import { getActiveCycle, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';
import {
  managerApprovalWindowClosedMessage,
  managerDirectReportOnlyMessage,
  managerInlineEditClosedMessage,
} from '../../utils/constraintGuidance';

export default function Approvals() {
  const { user } = useAuth();
  const { goals, teamMembers, approveGoalSheet, returnGoalSheetForRework, validateGoalSheet, cycles } = useData();
  const [searchParams] = useSearchParams();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('emp-001');
  const [editedGoals, setEditedGoals] = useState<Record<string, Partial<Goal>>>({});

  const activeCycle = getActiveCycle(cycles);
  const activeCycleId = activeCycle?.id;
  const goalSettingOpen = isPhaseOpen(activeCycle, 'goalSetting');
  const cycleGoals = goals.filter(g => !activeCycleId || g.cycleId === activeCycleId);
  const reviewGoals = cycleGoals.filter(g => ['pending', 'rework', 'approved'].includes(g.status));
  const pendingGoals = cycleGoals.filter(g => g.status === 'pending');
  const employees = teamMembers
    .filter(member => user?.role === 'admin' || member.managerId === user?.id)
    .map(member => ({ id: member.id, name: member.name }));
  const isDirectReport = employees.some(employee => employee.id === selectedEmployee);

  useEffect(() => {
    const employeeId = searchParams.get('employeeId');
    if (employeeId && employees.some(employee => employee.id === employeeId)) {
      setSelectedEmployee(employeeId);
    } else if (!employees.some(employee => employee.id === selectedEmployee) && employees[0]) {
      setSelectedEmployee(employees[0].id);
    }
  }, [employees, searchParams, selectedEmployee]);

  const employeeGoals = reviewGoals.filter(g => g.employeeId === selectedEmployee);
  const previewGoals = goals.map(goal => editedGoals[goal.id] ? { ...goal, ...editedGoals[goal.id] } : goal);
  const validation = validateGoalSheet(selectedEmployee, activeCycleId, previewGoals);
  const hasPendingGoals = employeeGoals.some(goal => goal.status === 'pending');

  const handleEdit = (goalId: string, field: 'target' | 'weightage', value: number) => {
    if (!goalSettingOpen) {
      toast.error(managerInlineEditClosedMessage);
      return;
    }
    setEditedGoals(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const handleApproveSheet = async () => {
    if (!goalSettingOpen) {
      toast.error(managerApprovalWindowClosedMessage);
      return;
    }
    if (!isDirectReport) {
      toast.error(managerDirectReportOnlyMessage);
      return;
    }
    if (!hasPendingGoals) {
      toast.error('There are no pending goals to approve for this employee.');
      return;
    }
    if (!validation.canSubmit) {
      toast.error(`This sheet cannot be approved yet. Total weightage is ${validation.totalWeightage}/100%.`);
      return;
    }
    if (await approveGoalSheet(selectedEmployee, activeCycleId, editedGoals)) {
      setEditedGoals({});
    }
  };

  const handleReturnForRework = async () => {
    if (!goalSettingOpen) {
      toast.error(managerApprovalWindowClosedMessage);
      return;
    }
    if (!isDirectReport) {
      toast.error(managerDirectReportOnlyMessage);
      return;
    }
    if (!hasPendingGoals) {
      toast.error('There are no pending goals to return for rework for this employee.');
      return;
    }
    await returnGoalSheetForRework(selectedEmployee, activeCycleId);
    setEditedGoals({});
  };

  const approvalBlockMessage = !goalSettingOpen
    ? managerApprovalWindowClosedMessage
    : !isDirectReport
      ? managerDirectReportOnlyMessage
      : !hasPendingGoals
        ? 'There are no pending goals to approve or return for this employee.'
        : !validation.canSubmit
          ? `This sheet cannot be approved yet. Total weightage is ${validation.totalWeightage}/100%.`
          : '';

  const returnBlockMessage = !goalSettingOpen
    ? managerApprovalWindowClosedMessage
    : !isDirectReport
      ? managerDirectReportOnlyMessage
      : !hasPendingGoals
        ? 'There are no pending goals to return for rework for this employee.'
        : '';

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Goal Approvals</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Review and approve team member goals
        </Box>
      </Box>

      {pendingGoals.length === 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          All submitted goals have been reviewed. Approved cards remain visible with a lock for audit context.
        </Alert>
      )}

      <Alert severity={goalSettingOpen ? 'success' : 'info'} sx={{ mb: 3 }}>
        {getWindowMessage(activeCycle, 'goalSetting')} Manager approval actions and inline edits are available only while this window is open.
      </Alert>

      {hasPendingGoals && (
        <Alert severity={validation.canSubmit ? 'success' : 'warning'} sx={{ mb: 3 }}>
          <Box sx={{ fontWeight: 700, mb: 0.5 }}>Sheet Validation</Box>
          <Box sx={{ fontSize: 13 }}>
            Total weightage is {validation.totalWeightage}/100%. {validation.errors.length ? validation.errors.join(' ') : 'Ready to approve.'}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
                Team Members ({employees.length})
              </Box>
              <List>
                {employees.map((employee) => {
                  const employeePendingCount = pendingGoals.filter(
                    g => g.employeeId === employee.id
                  ).length;

                  return (
                    <ListItem key={employee.id} disablePadding>
                      <ListItemButton
                        selected={selectedEmployee === employee.id}
                        onClick={() => setSelectedEmployee(employee.id)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                        }}
                      >
                        <ListItemText
                          primary={employee.name}
                          secondary={`${employeePendingCount} pending`}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {employeeGoals.length === 0 ? (
            <Card sx={{ boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  No pending goals for this employee
                </Box>
              </CardContent>
            </Card>
          ) : (
            <>
            <Card sx={{ boxShadow: 2, mb: 2 }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Box sx={{ fontSize: 18, fontWeight: 700 }}>Goal Sheet Review</Box>
                  <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                    {employeeGoals.length} goals, {validation.totalWeightage}% total weightage
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={approvalBlockMessage}>
                    <span>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle size={18} />}
                        onClick={handleApproveSheet}
                        aria-disabled={Boolean(approvalBlockMessage)}
                        sx={approvalBlockMessage ? { opacity: 0.65 } : undefined}
                      >
                        Approve Sheet
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={returnBlockMessage}>
                    <span>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<RotateCcw size={18} />}
                        onClick={handleReturnForRework}
                        aria-disabled={Boolean(returnBlockMessage)}
                        sx={returnBlockMessage ? { opacity: 0.65 } : undefined}
                      >
                        Return for Rework
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>

            {employeeGoals.map((goal) => {
              const edits = editedGoals[goal.id] || {};
              const isApproved = goal.status === 'approved';
              const isEditable = goalSettingOpen && goal.status === 'pending';
              const isSharedRecipient = goal.isShared && goal.employeeId !== goal.primaryOwnerId;
              const targetEditBlockMessage = !goalSettingOpen
                ? managerInlineEditClosedMessage
                : isSharedRecipient
                  ? 'Shared KPI recipient targets are read-only during approval review.'
                  : goal.status !== 'pending'
                    ? 'Inline edits are available only for pending goals.'
                    : '';
              const weightageEditBlockMessage = !goalSettingOpen
                ? managerInlineEditClosedMessage
                : goal.status !== 'pending'
                  ? 'Inline edits are available only for pending goals.'
                  : '';

              return (
                <Card key={goal.id} sx={{ boxShadow: 2, mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Box sx={{ fontSize: 18, fontWeight: 600 }}>{goal.title}</Box>
                          {isApproved && <Lock size={16} color="#2e7d32" />}
                          {goal.isShared && <Chip label="Shared KPI" size="small" />}
                        </Box>
                        <Box sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>
                          {goal.description}
                        </Box>
                      </Box>
                      <StatusPill status={goal.status} />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Thrust Area
                        </Box>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{goal.thrustArea}</Box>
                      </Grid>
                      <Grid size={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Unit of Measure
                        </Box>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{goal.unitOfMeasure}</Box>
                      </Grid>
                      <Grid size={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Target
                        </Box>
                        <Tooltip title={targetEditBlockMessage}>
                          <Box
                            onClick={() => {
                              if (targetEditBlockMessage) toast.error(targetEditBlockMessage);
                            }}
                          >
                            <TextField
                              id={`approval-target-${goal.id}`}
                              name={`approvalTarget-${goal.id}`}
                              type="number"
                              size="small"
                              value={edits.target ?? goal.target}
                              onChange={(e) => handleEdit(goal.id, 'target', Number(e.target.value))}
                              disabled={!isEditable || isSharedRecipient}
                              sx={{ width: '100%', pointerEvents: targetEditBlockMessage ? 'none' : undefined }}
                            />
                          </Box>
                        </Tooltip>
                      </Grid>
                      <Grid size={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Weightage (%)
                        </Box>
                        <Tooltip title={weightageEditBlockMessage}>
                          <Box
                            onClick={() => {
                              if (weightageEditBlockMessage) toast.error(weightageEditBlockMessage);
                            }}
                          >
                            <TextField
                              id={`approval-weightage-${goal.id}`}
                              name={`approvalWeightage-${goal.id}`}
                              type="number"
                              size="small"
                              value={edits.weightage ?? goal.weightage}
                              onChange={(e) => handleEdit(goal.id, 'weightage', Number(e.target.value))}
                              disabled={!isEditable}
                              inputProps={{ min: 10 }}
                              sx={{ width: '100%', pointerEvents: weightageEditBlockMessage ? 'none' : undefined }}
                            />
                          </Box>
                        </Tooltip>
                      </Grid>
                    </Grid>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>
                        Progress
                      </Box>
                      <ProgressBar value={goal.progress} />
                    </Box>
                    {isApproved && (
                      <Alert severity="success" icon={<Lock size={18} />}>
                        Approved and locked. Admin intervention is required for further edits.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
