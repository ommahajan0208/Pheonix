import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material';
import { Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { CheckIn, CheckInStatus, Quarter } from '../../types';
import { getScoringDirectionLabel } from '../../utils/progressScore';
import { getActiveCycle, getPhaseForQuarter, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';

type ManagerCommentDraft = NonNullable<CheckIn['managerComment']>;

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

const STATUS_LABELS: Record<CheckInStatus, string> = {
  'not-started': 'Not Started',
  'on-track': 'On Track',
  completed: 'Completed',
};

const emptyComment: ManagerCommentDraft = {
  discussionSummary: '',
  blockersSupportNeeded: '',
  nextActions: '',
};

export default function ManagerCheckIn() {
  const { user } = useAuth();
  const { goals, checkIns, teamMembers, saveManagerCheckInComment, cycles } = useData();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(teamMembers[0]?.id || '');
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [commentDraft, setCommentDraft] = useState<ManagerCommentDraft>(emptyComment);
  const [notice, setNotice] = useState('');

  const activeCycle = getActiveCycle(cycles);
  const selectedPhase = getPhaseForQuarter(selectedQuarter);
  const checkInOpen = isPhaseOpen(activeCycle, selectedPhase);
  const employees = teamMembers.filter(member => member.managerId === user?.id || user?.role === 'manager');
  const employeeGoals = goals.filter(g => g.employeeId === selectedEmployee && g.status === 'approved' && (!activeCycle?.id || g.cycleId === activeCycle.id));

  const checkInByGoal = useMemo(() => {
    return checkIns.reduce((acc, checkIn) => {
      if (checkIn.quarter === selectedQuarter) acc[checkIn.goalId] = checkIn;
      return acc;
    }, {} as Record<string, CheckIn>);
  }, [checkIns, selectedQuarter]);

  const selectedCheckIn = selectedGoal ? checkInByGoal[selectedGoal] : undefined;
  const selectedGoalData = goals.find(goal => goal.id === selectedGoal);
  const firstEmployeeGoalId = employeeGoals[0]?.id || '';

  useEffect(() => {
    setSelectedGoal(firstEmployeeGoalId);
  }, [firstEmployeeGoalId, selectedEmployee, selectedQuarter]);

  useEffect(() => {
    setCommentDraft(selectedCheckIn?.managerComment || emptyComment);
  }, [selectedCheckIn?.id, selectedCheckIn?.managerComment]);

  const handleCommentChange = (field: keyof ManagerCommentDraft, value: string) => {
    setCommentDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveComment = () => {
    if (!selectedGoal || !checkInOpen) return;

    saveManagerCheckInComment(selectedGoal, selectedQuarter, user?.id || 'mgr-001', commentDraft);
    setNotice(`Manager check-in comment saved for ${selectedGoalData?.title || 'selected goal'}.`);
  };

  const hasComment = Object.values(commentDraft).some(value => value.trim());

  return (
    <Box>
      <PageHeader title="Manager Check-in" subtitle="Review quarterly planned vs achievement data and document check-in discussions." />
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Alert severity={checkInOpen ? 'success' : 'info'} sx={{ mb: 2 }}>
        {getWindowMessage(activeCycle, selectedPhase)} Manager feedback can be saved only while this window is open.
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ boxShadow: 2, mb: 3 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Team Member & Quarter
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    select
                    fullWidth
                    label="Employee"
                    value={selectedEmployee}
                    onChange={(e) => {
                      setSelectedEmployee(e.target.value);
                      setNotice('');
                    }}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.title}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Quarter"
                    value={selectedQuarter}
                    onChange={(e) => {
                      setSelectedQuarter(e.target.value as Quarter);
                      setNotice('');
                    }}
                  >
                    {QUARTERS.map(quarter => <MenuItem key={quarter} value={quarter}>{quarter}</MenuItem>)}
                  </TextField>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Planned vs Achievement
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Goal</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Planned</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actual</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeGoals.map(goal => {
                    const checkIn = checkInByGoal[goal.id];
                    const status = checkIn?.status || 'not-started';

                    return (
                      <TableRow
                        key={goal.id}
                        hover
                        selected={selectedGoal === goal.id}
                        onClick={() => {
                          setSelectedGoal(goal.id);
                          setNotice('');
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Box sx={{ fontWeight: 700 }}>{goal.title}</Box>
                          <Box sx={{ color: 'text.secondary', fontSize: 12 }}>
                            {goal.unitOfMeasure} | {getScoringDirectionLabel(goal.scoringDirection)}
                          </Box>
                        </TableCell>
                        <TableCell>{goal.target}</TableCell>
                        <TableCell>{checkIn?.plannedValue ?? '-'}</TableCell>
                        <TableCell>{checkIn?.actualValue ?? '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${checkIn?.progressScore ?? 0}%`}
                            size="small"
                            sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_LABELS[status]}
                            size="small"
                            color={status === 'completed' ? 'success' : status === 'on-track' ? 'primary' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 0.5 }}>
                Structured Check-in Comment
              </Box>
              <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                {selectedGoalData ? selectedGoalData.title : 'Select a goal'}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Discussion Summary"
                value={commentDraft.discussionSummary}
                onChange={(e) => handleCommentChange('discussionSummary', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Blockers / Support Needed"
                value={commentDraft.blockersSupportNeeded}
                onChange={(e) => handleCommentChange('blockersSupportNeeded', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Next Actions"
                value={commentDraft.nextActions}
                onChange={(e) => handleCommentChange('nextActions', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Last saved: {selectedCheckIn?.managerCommentedAt ? new Date(selectedCheckIn.managerCommentedAt).toLocaleString() : 'Not saved yet'}
              </Box>

              <Button
                fullWidth
                variant="contained"
                startIcon={<Save size={18} />}
                disabled={!selectedGoal || !checkInOpen || !hasComment}
                onClick={handleSaveComment}
              >
                Save Check-in Comment
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
