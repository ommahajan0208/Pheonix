import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, Button, Alert, Stepper, Step, StepLabel, Chip, Tooltip } from '@mui/material';
import { Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import GoalCard from '../../components/common/GoalCard';
import PageHeader from '../../components/common/PageHeader';
import { getActiveCycle, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';
import { goalCreationWindowMessage } from '../../utils/constraintGuidance';

export default function GoalSubmitReview() {
  const { user } = useAuth();
  const { goals, submitGoalSheet, validateGoalSheet, cycles } = useData();
  const [submitted, setSubmitted] = useState(false);
  const activeCycle = getActiveCycle(cycles);
  const activeCycleId = activeCycle?.id;
  const goalSettingOpen = isPhaseOpen(activeCycle, 'goalSetting');

  const userGoals = goals.filter(g => g.employeeId === user?.id && (!activeCycleId || g.cycleId === activeCycleId));
  const submittableGoals = userGoals.filter(g => ['draft', 'rework'].includes(g.status));
  const validation = validateGoalSheet(user?.id || '', activeCycleId);
  const canSubmit = goalSettingOpen && validation.canSubmit && submittableGoals.length > 0;

  const getSubmitBlockMessage = () => {
    if (!goalSettingOpen) return goalCreationWindowMessage(activeCycle);
    if (submittableGoals.length === 0) return 'There are no draft or rework goals available to submit.';
    if (validation.totalWeightage !== 100) return `Your current total weightage is ${validation.totalWeightage}%. It must be exactly 100% before submission is possible.`;
    if (validation.goalCount === 0 || validation.goalCount > 8) return 'You need 1 to 8 goals before submission is possible.';
    if (userGoals.some(goal => goal.weightage < 10)) return 'Each goal must have at least 10% weightage before submission is possible.';
    return 'Please resolve the validation checklist before submitting.';
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error(getSubmitBlockMessage());
      return;
    }
    if (user && await submitGoalSheet(user.id, activeCycleId)) {
      setSubmitted(true);
    }
  };

  const statusTimeline = [
    { label: 'Draft', completed: true },
    { label: 'Submitted', completed: submitted },
    { label: 'Manager Review', completed: false },
    { label: 'Approved', completed: false },
  ];

  return (
    <Box>
      <PageHeader title="Goal Submission Review" subtitle="Read-only goal summary, validation status, and manager approval timeline." />

      {submitted ? (
        <Card sx={{ boxShadow: 2, mb: 3 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  p: 3,
                  borderRadius: '50%',
                  bgcolor: '#e8f5e9',
                  mb: 2,
                }}
              >
                <CheckCircle size={48} color="#2e7d32" />
              </Box>
              <Box sx={{ fontSize: 20, fontWeight: 700, mb: 1 }}>
                Goals Submitted Successfully!
              </Box>
              <Box sx={{ fontSize: 14, color: 'text.secondary', mb: 3 }}>
                Your goals have been submitted to your manager for review
              </Box>

              <Stepper activeStep={1} sx={{ maxWidth: 600, mx: 'auto' }}>
                {statusTimeline.map((step) => (
                  <Step key={step.label} completed={step.completed}>
                    <StepLabel>{step.label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Alert severity={goalSettingOpen ? 'success' : 'info'} sx={{ mb: 3 }}>
            {getWindowMessage(activeCycle, 'goalSetting')} Goal sheets can be submitted only while this window is open.
          </Alert>

          <Alert severity={canSubmit ? 'success' : 'info'} sx={{ mb: 3 }}>
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

          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 18, fontWeight: 600 }}>Goals Summary ({userGoals.length})</Box>
                <Chip label={`Ready to submit: ${submittableGoals.length}`} color={submittableGoals.length ? 'warning' : 'success'} size="small" />
              </Box>
              {userGoals.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No draft goals to submit
                </Box>
              ) : (
                userGoals.map(goal => (
                  <GoalCard key={goal.id} goal={goal} showActions={false} />
                ))
              )}
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Tooltip title={canSubmit ? '' : getSubmitBlockMessage()}>
              <span>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send size={18} />}
                  onClick={handleSubmit}
                  aria-disabled={!canSubmit}
                  sx={!canSubmit ? { opacity: 0.65 } : undefined}
                >
                  Submit to Manager
                </Button>
              </span>
            </Tooltip>
          </Box>
        </>
      )}
    </Box>
  );
}
