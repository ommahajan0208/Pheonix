import { useState } from 'react';
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
} from '@mui/material';
import { CheckCircle, RotateCcw, Lock } from 'lucide-react';
import { Goal } from '../../types';
import StatusPill from '../../components/common/StatusPill';
import ProgressBar from '../../components/common/ProgressBar';

export default function Approvals() {
  const { goals, teamMembers, approveGoalSheet, returnGoalSheetForRework, validateGoalSheet } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>('emp-001');
  const [editedGoals, setEditedGoals] = useState<Record<string, Partial<Goal>>>({});

  const reviewGoals = goals.filter(g => ['pending', 'rework', 'approved'].includes(g.status));
  const pendingGoals = goals.filter(g => g.status === 'pending');
  const employees = teamMembers.map(member => ({ id: member.id, name: member.name }));

  const employeeGoals = reviewGoals.filter(g => g.employeeId === selectedEmployee);
  const previewGoals = goals.map(goal => editedGoals[goal.id] ? { ...goal, ...editedGoals[goal.id] } : goal);
  const validation = validateGoalSheet(selectedEmployee, undefined, previewGoals);
  const hasPendingGoals = employeeGoals.some(goal => goal.status === 'pending');

  const handleEdit = (goalId: string, field: 'target' | 'weightage', value: number) => {
    setEditedGoals(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const handleApproveSheet = () => {
    if (approveGoalSheet(selectedEmployee, undefined, editedGoals)) {
      setEditedGoals({});
    }
  };

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

      {hasPendingGoals && (
        <Alert severity={validation.canSubmit ? 'success' : 'warning'} sx={{ mb: 3 }}>
          <Box sx={{ fontWeight: 700, mb: 0.5 }}>Sheet Validation</Box>
          <Box sx={{ fontSize: 13 }}>
            Total weightage is {validation.totalWeightage}/100%. {validation.errors.length ? validation.errors.join(' ') : 'Ready to approve.'}
          </Box>
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
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

        <Grid item xs={12} md={9}>
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
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle size={18} />}
                    onClick={handleApproveSheet}
                    disabled={!hasPendingGoals || !validation.canSubmit}
                  >
                    Approve Sheet
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<RotateCcw size={18} />}
                    onClick={() => {
                      returnGoalSheetForRework(selectedEmployee);
                      setEditedGoals({});
                    }}
                    disabled={!hasPendingGoals}
                  >
                    Return for Rework
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {employeeGoals.map((goal) => {
              const edits = editedGoals[goal.id] || {};
              const isApproved = goal.status === 'approved';
              const isEditable = goal.status === 'pending';
              const isSharedRecipient = goal.isShared && goal.employeeId !== goal.primaryOwnerId;

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
                      <Grid item xs={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Thrust Area
                        </Box>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{goal.thrustArea}</Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Unit of Measure
                        </Box>
                        <Box sx={{ fontSize: 14, fontWeight: 600 }}>{goal.unitOfMeasure}</Box>
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Target
                        </Box>
                        <TextField
                          type="number"
                          size="small"
                          value={edits.target ?? goal.target}
                          onChange={(e) => handleEdit(goal.id, 'target', Number(e.target.value))}
                          disabled={!isEditable || isSharedRecipient}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>
                          Weightage (%)
                        </Box>
                        <TextField
                          type="number"
                          size="small"
                          value={edits.weightage ?? goal.weightage}
                          onChange={(e) => handleEdit(goal.id, 'weightage', Number(e.target.value))}
                          disabled={!isEditable}
                          inputProps={{ min: 10 }}
                          sx={{ width: '100%' }}
                        />
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
