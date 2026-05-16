import { Card, CardContent, Box, IconButton, Chip } from '@mui/material';
import { Edit, Trash2, Share2 } from 'lucide-react';
import { Goal } from '../../types';
import StatusPill from './StatusPill';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  showActions?: boolean;
}

export default function GoalCard({ goal, onEdit, onDelete, showActions = true }: GoalCardProps) {
  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                {goal.title}
              </Box>
              {goal.isShared && (
                <Chip
                  icon={<Share2 size={14} />}
                  label="Shared"
                  size="small"
                  sx={{
                    height: 22,
                    bgcolor: '#f3e5f5',
                    color: '#9c27b0',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
              )}
            </Box>
            <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 1.5 }}>
              {goal.description}
            </Box>
          </Box>
          {showActions && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(goal)}>
                  <Edit size={16} />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(goal.id)}>
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 2 }}>
          <Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Thrust Area</Box>
            <Box sx={{ fontSize: 13, fontWeight: 600 }}>{goal.thrustArea}</Box>
          </Box>
          <Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Target</Box>
            <Box sx={{ fontSize: 13, fontWeight: 600 }}>
              {goal.target} {goal.unitOfMeasure}
            </Box>
          </Box>
          <Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Weightage</Box>
            <Box sx={{ fontSize: 13, fontWeight: 600 }}>{goal.weightage}%</Box>
          </Box>
          <Box>
            <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5 }}>Status</Box>
            <StatusPill status={goal.status} />
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ fontSize: 11, color: 'text.secondary', mb: 1 }}>Progress</Box>
          <ProgressBar value={goal.progress} />
        </Box>

        {goal.deadlineDate && (
          <Box sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>
            Deadline: {new Date(goal.deadlineDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
