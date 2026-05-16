import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, Alert, Chip, Grid, Slider, Button } from '@mui/material';
import { Share2, Sparkles } from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import StatusPill from '../../components/common/StatusPill';
import PageHeader from '../../components/common/PageHeader';

export default function SharedGoals() {
  const { user } = useAuth();
  const { goals, updateGoal } = useData();

  const sharedGoals = goals.filter(g => g.employeeId === user?.id && g.isShared);

  return (
    <Box>
      <PageHeader title="Shared Goals" subtitle="Synced team outcomes where only your contribution weightage is editable." />

      <Alert severity="info" sx={{ mb: 3 }} icon={<Share2 size={20} />}>
        Shared goals are managed by the primary owner. You can only edit the weightage for your contribution.
      </Alert>

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          {sharedGoals.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <Box sx={{ fontSize: 16, mb: 1 }}>No shared goals</Box>
              <Box sx={{ fontSize: 14 }}>Your manager can assign shared goals to you</Box>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {sharedGoals.map(goal => (
                <Grid size={{ xs: 12, md: 6 }} key={goal.id}>
                  <Card sx={{ border: '1px solid #e4d7f6', boxShadow: '0 1px 4px rgba(96,39,158,0.08)', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Chip icon={<Share2 size={14} />} label="Shared" size="small" sx={{ bgcolor: '#f3e5f5', color: '#9c27b0', fontWeight: 800 }} />
                        <Chip icon={<Sparkles size={14} />} label={`${goal.progress}% synced`} size="small" sx={{ bgcolor: '#eef7ee', color: '#2e7d32', fontWeight: 700 }} />
                      </Box>
                      <Box sx={{ fontSize: 17, fontWeight: 800, mb: 0.75 }}>{goal.title}</Box>
                      <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>{goal.description}</Box>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
                        <Box>
                          <Box sx={{ fontSize: 11, color: 'text.secondary' }}>Primary Owner</Box>
                          <Box sx={{ fontSize: 13, fontWeight: 700 }}>{goals.find(g => g.employeeId === goal.primaryOwnerId)?.employeeName || 'Primary owner'}</Box>
                        </Box>
                        <Box>
                          <Box sx={{ fontSize: 11, color: 'text.secondary' }}>Read-only Target</Box>
                          <Box sx={{ fontSize: 13, fontWeight: 700 }}>{goal.target} {goal.unitOfMeasure}</Box>
                        </Box>
                        <Box>
                          <Box sx={{ fontSize: 11, color: 'text.secondary' }}>Status</Box>
                          <StatusPill status={goal.status} />
                        </Box>
                      </Box>
                      <ProgressBar value={goal.progress} />
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ fontSize: 13, fontWeight: 700 }}>My Weightage</Box>
                          <Box sx={{ fontSize: 13, color: '#9c27b0', fontWeight: 800 }}>{goal.weightage}%</Box>
                        </Box>
                        <Slider
                          aria-label={`Weightage for ${goal.title}`}
                          name={`sharedGoalWeightage-${goal.id}`}
                          value={goal.weightage}
                          min={10}
                          max={30}
                          step={5}
                          disabled={!['draft', 'rework'].includes(goal.status)}
                          onChange={(_, value) => updateGoal(goal.id, { weightage: value as number })}
                          sx={{ color: '#9c27b0' }}
                        />
                        {!['draft', 'rework'].includes(goal.status) && (
                          <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                            Weightage is locked while this goal is submitted or approved.
                          </Box>
                        )}
                      </Box>
                      <Button variant="outlined" size="small" fullWidth sx={{ mt: 1, borderColor: '#9c27b0', color: '#9c27b0' }}>
                        View Shared Contributions
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
