import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
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
  Tooltip,
} from '@mui/material';
import { Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '../../components/common/PageHeader';
import { CheckIn, CheckInStatus, Quarter } from '../../types';
import { getScoringDirectionLabel } from '../../utils/progressScore';
import { getActiveCycle, getPhaseForQuarter, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';
import {
  employeeCheckInNotSubmittedMessage,
  managerCheckInWindowClosedMessage,
} from '../../utils/constraintGuidance';

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
  const [searchParams] = useSearchParams();
  const [selectedEmployee, setSelectedEmployee] = useState<string>(teamMembers[0]?.id || '');
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q1');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [commentDraft, setCommentDraft] = useState<ManagerCommentDraft>(emptyComment);
  const [notice, setNotice] = useState('');

  const activeCycle = getActiveCycle(cycles);
  const selectedPhase = getPhaseForQuarter(selectedQuarter);
  const checkInOpen = isPhaseOpen(activeCycle, selectedPhase);
  const closedWindowMessage = managerCheckInWindowClosedMessage(activeCycle, selectedQuarter, selectedPhase);
  const employees = teamMembers.filter(member => member.managerId === user?.id || user?.role === 'admin');
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
  const employeeSubmittedSelectedCheckIn = Boolean(selectedCheckIn?.submittedAt);

  useEffect(() => {
    const employeeId = searchParams.get('employeeId');
    const goalId = searchParams.get('goalId');
    const quarter = searchParams.get('quarter') as Quarter | null;
    if (employeeId && employees.some(employee => employee.id === employeeId)) setSelectedEmployee(employeeId);
    if (quarter && QUARTERS.includes(quarter)) setSelectedQuarter(quarter);
    if (goalId && goals.some(goal => goal.id === goalId)) setSelectedGoal(goalId);
  }, [employees, goals, searchParams]);

  useEffect(() => {
    if (!selectedGoal || !employeeGoals.some(goal => goal.id === selectedGoal)) {
      setSelectedGoal(firstEmployeeGoalId);
    }
  }, [employeeGoals, firstEmployeeGoalId, selectedGoal]);

  useEffect(() => {
    setCommentDraft(selectedCheckIn?.managerComment || emptyComment);
  }, [selectedCheckIn?.id, selectedCheckIn?.managerComment]);

  const handleCommentChange = (field: keyof ManagerCommentDraft, value: string) => {
    setCommentDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveComment = () => {
    if (!selectedGoal) {
      toast.error('Select a goal before saving a manager check-in comment.');
      return;
    }
    if (!checkInOpen) {
      toast.error(closedWindowMessage);
      return;
    }
    if (!hasComment) {
      toast.error('Add a manager comment before saving.');
      return;
    }

    saveManagerCheckInComment(selectedGoal, selectedQuarter, user?.id || 'mgr-001', commentDraft);
    setNotice(`Manager check-in comment saved for ${selectedGoalData?.title || 'selected goal'}.`);
  };

  const hasComment = Object.values(commentDraft).some(value => value.trim());
  const saveBlockMessage = !selectedGoal
    ? 'Select a goal before saving a manager check-in comment.'
    : !checkInOpen
      ? closedWindowMessage
      : !hasComment
        ? 'Add a manager comment before saving.'
        : '';

  return (
    <Box>
      <PageHeader title="Manager Check-in" subtitle="Review quarterly planned vs achievement data and document check-in discussions." />
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Alert severity={checkInOpen ? 'success' : 'warning'} sx={{ mb: 2 }} icon={!checkInOpen ? <Lock size={20} /> : undefined}>
        {checkInOpen ? getWindowMessage(activeCycle, selectedPhase) : closedWindowMessage} Manager feedback can be saved only while this window is open.
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
                    id="manager-checkin-employee"
                    name="managerCheckinEmployee"
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
                    id="manager-checkin-quarter"
                    name="managerCheckinQuarter"
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
                    const hasEmployeeSubmission = Boolean(checkIn?.submittedAt);
                    const status = hasEmployeeSubmission ? checkIn?.status || 'not-started' : 'not-started';

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
                        <TableCell>{hasEmployeeSubmission ? checkIn?.plannedValue ?? '-' : '-'}</TableCell>
                        <TableCell>{hasEmployeeSubmission ? checkIn?.actualValue ?? '-' : '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${hasEmployeeSubmission ? checkIn?.progressScore ?? 0 : 0}%`}
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

              {selectedGoal && !employeeSubmittedSelectedCheckIn && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  {employeeCheckInNotSubmittedMessage}
                </Alert>
              )}

              <TextField
                fullWidth
                id="manager-discussion-summary"
                name="managerDiscussionSummary"
                multiline
                rows={4}
                label="Discussion Summary"
                value={commentDraft.discussionSummary}
                onChange={(e) => handleCommentChange('discussionSummary', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
                helperText={!checkInOpen ? closedWindowMessage : undefined}
              />

              <TextField
                fullWidth
                id="manager-blockers-support-needed"
                name="managerBlockersSupportNeeded"
                multiline
                rows={4}
                label="Blockers / Support Needed"
                value={commentDraft.blockersSupportNeeded}
                onChange={(e) => handleCommentChange('blockersSupportNeeded', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
                helperText={!checkInOpen ? closedWindowMessage : undefined}
              />

              <TextField
                fullWidth
                id="manager-next-actions"
                name="managerNextActions"
                multiline
                rows={4}
                label="Next Actions"
                value={commentDraft.nextActions}
                onChange={(e) => handleCommentChange('nextActions', e.target.value)}
                sx={{ mb: 2 }}
                disabled={!selectedGoal || !checkInOpen}
                helperText={!checkInOpen ? closedWindowMessage : undefined}
              />

              <Divider sx={{ my: 2 }} />

              <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Last saved: {selectedCheckIn?.managerCommentedAt ? new Date(selectedCheckIn.managerCommentedAt).toLocaleString() : 'Not saved yet'}
              </Box>

              <Tooltip title={saveBlockMessage}>
                <span>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Save size={18} />}
                    aria-disabled={Boolean(saveBlockMessage)}
                    sx={saveBlockMessage ? { opacity: 0.65 } : undefined}
                    onClick={handleSaveComment}
                  >
                    Save Check-in Comment
                  </Button>
                </span>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
