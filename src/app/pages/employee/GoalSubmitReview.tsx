import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, Button, Alert, Stepper, Step, StepLabel, Chip } from '@mui/material';
import { Send, CheckCircle } from 'lucide-react';
import GoalCard from '../../components/common/GoalCard';
import PageHeader from '../../components/common/PageHeader';

export default function GoalSubmitReview() {
  const { user } = useAuth();
  const { goals, updateGoal } = useData();
  const [submitted, setSubmitted] = useState(false);

  const userGoals = goals.filter(g => g.employeeId === user?.id);
  const draftGoals = userGoals.filter(g => g.status === 'draft');
  const totalWeightage = userGoals.reduce((sum, g) => sum + g.weightage, 0);

  const validations = [
    { label: 'Weightage equals 100%', passed: totalWeightage === 100 },
    { label: 'Maximum 8 goals', passed: userGoals.length <= 8 && userGoals.length > 0 },
    { label: 'Each goal minimum 10% weightage', passed: userGoals.every(g => g.weightage >= 10) },
  ];

  const canSubmit = validations.every(v => v.passed) && draftGoals.length > 0;

  const handleSubmit = () => {
    draftGoals.forEach(goal => {
      updateGoal(goal.id, { status: 'pending' });
    });
    setSubmitted(true);
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
          <Alert severity={canSubmit ? 'success' : 'info'} sx={{ mb: 3 }}>
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

          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 18, fontWeight: 600 }}>Goals Summary ({userGoals.length})</Box>
                <Chip label={`Drafts to submit: ${draftGoals.length}`} color={draftGoals.length ? 'warning' : 'success'} size="small" />
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
            <Button
              variant="contained"
              size="large"
              startIcon={<Send size={18} />}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Submit to Manager
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
