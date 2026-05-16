import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Box, Card, CardContent, Alert } from '@mui/material';
import { Share2 } from 'lucide-react';
import GoalCard from '../../components/common/GoalCard';

export default function SharedGoals() {
  const { user } = useAuth();
  const { goals } = useData();

  const sharedGoals = goals.filter(g => g.employeeId === user?.id && g.isShared);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Shared Goals</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Goals shared across team members with synced achievements
        </Box>
      </Box>

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
            sharedGoals.map(goal => (
              <Box key={goal.id} sx={{ mb: 2 }}>
                <GoalCard goal={goal} showActions={false} />
                {goal.primaryOwnerId && (
                  <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 1, ml: 2 }}>
                    Primary Owner: {goal.primaryOwnerId}
                  </Box>
                )}
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
