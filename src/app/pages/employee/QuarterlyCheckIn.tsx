import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  Chip,
} from '@mui/material';
import { Save, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import { CheckInStatus, Goal, Quarter } from '../../types';
import { getScoringDirectionLabel } from '../../utils/progressScore';
import { getActiveCycle, getPhaseForQuarter, getWindowMessage, isPhaseOpen } from '../../utils/cycleSchedule';

type CheckInDraft = {
  plannedValue: number;
  actualValue: number;
  status: CheckInStatus;
  comments: string;
  achievementDate?: string;
};

const STATUS_OPTIONS: Array<{ value: CheckInStatus; label: string }> = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'on-track', label: 'On Track' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_COLORS: Record<CheckInStatus, string> = {
  'not-started': '#757575',
  'on-track': '#1976d2',
  completed: '#2e7d32',
};

const formatDateInput = (date?: Date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

export default function QuarterlyCheckIn() {
  const { user } = useAuth();
  const { goals, checkIns, upsertCheckIn, calculateProgressScore, cycles } = useData();
  const [searchParams] = useSearchParams();
  const initialQuarter = searchParams.get('quarter') as Quarter | null;
  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>(initialQuarter && ['Q1', 'Q2', 'Q3', 'Q4'].includes(initialQuarter) ? initialQuarter : 'Q1');
  const [checkInData, setCheckInData] = useState<Record<string, Partial<CheckInDraft>>>({});
  const [notice, setNotice] = useState('');

  const activeCycle = getActiveCycle(cycles);
  const selectedPhase = getPhaseForQuarter(selectedQuarter);
  const checkInOpen = isPhaseOpen(activeCycle, selectedPhase);
  const userGoals = goals.filter(g => g.employeeId === user?.id && g.status === 'approved');

  const existingCheckInFor = (goalId: string) => (
    checkIns.find(checkIn => checkIn.goalId === goalId && checkIn.quarter === selectedQuarter)
  );

  const getDraftForGoal = (goal: Goal): CheckInDraft => {
    const existing = existingCheckInFor(goal.id);
    const draft = checkInData[goal.id] || {};

    return {
      plannedValue: draft.plannedValue ?? existing?.plannedValue ?? 0,
      actualValue: draft.actualValue ?? existing?.actualValue ?? 0,
      status: draft.status ?? existing?.status ?? 'not-started',
      comments: draft.comments ?? existing?.comments ?? '',
      achievementDate: draft.achievementDate ?? formatDateInput(existing?.achievementDate),
    };
  };

  const handleDataChange = (goalId: string, field: keyof CheckInDraft, value: CheckInDraft[keyof CheckInDraft]) => {
    setCheckInData(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [field]: value,
      },
    }));
  };

  const getScore = (goal: Goal) => {
    const draft = getDraftForGoal(goal);
    return calculateProgressScore(goal, {
      actualValue: draft.actualValue,
      achievementDate: draft.achievementDate ? new Date(draft.achievementDate) : undefined,
    });
  };

  const statusCounts = userGoals.reduce((acc, goal) => {
    const status = getDraftForGoal(goal).status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<CheckInStatus, number>);

  const chartData = STATUS_OPTIONS.map(option => ({
    name: option.label,
    value: statusCounts[option.value] || 0,
    color: STATUS_COLORS[option.value],
  }));

  const handleSaveDraft = () => setNotice(`${selectedQuarter} draft saved locally.`);

  const handleSubmit = () => {
    if (!checkInOpen) return;

    userGoals.forEach(goal => {
      const draft = getDraftForGoal(goal);
      upsertCheckIn({
        goalId: goal.id,
        quarter: selectedQuarter,
        plannedValue: draft.plannedValue,
        actualValue: draft.actualValue,
        status: draft.status,
        comments: draft.comments,
        achievementDate: draft.achievementDate ? new Date(draft.achievementDate) : undefined,
        evidenceUrls: existingCheckInFor(goal.id)?.evidenceUrls || [],
        submittedAt: new Date(),
      });
    });
    setNotice(`${selectedQuarter} check-in submitted for manager review.`);
  };

  return (
    <Box>
      <PageHeader title="Quarterly Check-in" subtitle="Track actual achievement against planned targets for each approved goal." />
      {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
      <Alert severity={checkInOpen ? 'success' : 'info'} sx={{ mb: 2 }}>
        {getWindowMessage(activeCycle, selectedPhase)} Achievement capture is available only while this window is open.
      </Alert>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Tabs value={selectedQuarter} onChange={(_, v) => setSelectedQuarter(v)}>
            <Tab label="Q1" value="Q1" />
            <Tab label="Q2" value="Q2" />
            <Tab label="Q3" value="Q3" />
            <Tab label="Q4" value="Q4" />
          </Tabs>
        </CardContent>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 9 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                {selectedQuarter} Achievement Tracking
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: 260 }}>Goal</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Planned</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actual</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Completion Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Evidence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userGoals.map((goal) => {
                      const draft = getDraftForGoal(goal);
                      const isTimeline = goal.scoringDirection === 'date-based';
                      const score = getScore(goal);

                      return (
                        <TableRow key={goal.id}>
                          <TableCell>
                            <Box sx={{ fontWeight: 600, fontSize: 14 }}>{goal.title}</Box>
                            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                              Target: {goal.target} {goal.unitOfMeasure} | {getScoringDirectionLabel(goal.scoringDirection)}
                            </Box>
                            {goal.deadlineDate && (
                              <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                                Deadline: {new Date(goal.deadlineDate).toLocaleDateString()}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <TextField
                              id={`checkin-planned-${goal.id}`}
                              name={`checkinPlanned-${goal.id}`}
                              type="number"
                              size="small"
                              value={draft.plannedValue}
                              onChange={(e) => handleDataChange(goal.id, 'plannedValue', Number(e.target.value))}
                              disabled={!checkInOpen}
                              sx={{ width: 90 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              id={`checkin-actual-${goal.id}`}
                              name={`checkinActual-${goal.id}`}
                              type="number"
                              size="small"
                              value={draft.actualValue}
                              onChange={(e) => handleDataChange(goal.id, 'actualValue', Number(e.target.value))}
                              disabled={!checkInOpen}
                              sx={{ width: 90 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              id={`checkin-achievement-date-${goal.id}`}
                              name={`checkinAchievementDate-${goal.id}`}
                              type="date"
                              size="small"
                              value={draft.achievementDate || ''}
                              onChange={(e) => handleDataChange(goal.id, 'achievementDate', e.target.value)}
                              disabled={!checkInOpen || !isTimeline}
                              sx={{ width: 150 }}
                              InputLabelProps={{ shrink: true }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${score}%`}
                              size="small"
                              sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              select
                              id={`checkin-status-${goal.id}`}
                              name={`checkinStatus-${goal.id}`}
                              size="small"
                              value={draft.status}
                              onChange={(e) => handleDataChange(goal.id, 'status', e.target.value as CheckInStatus)}
                              disabled={!checkInOpen}
                              sx={{ width: 145 }}
                            >
                              {STATUS_OPTIONS.map(option => (
                                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              id={`checkin-comments-${goal.id}`}
                              name={`checkinComments-${goal.id}`}
                              size="small"
                              multiline
                              value={draft.comments}
                              onChange={(e) => handleDataChange(goal.id, 'comments', e.target.value)}
                              placeholder="Add achievement notes..."
                              disabled={!checkInOpen}
                              sx={{ width: 220 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<Upload size={14} />} disabled={!checkInOpen}>
                              Upload
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button variant="outlined" onClick={handleSaveDraft} disabled={!checkInOpen}>Save Draft</Button>
                <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSubmit} disabled={!checkInOpen}>
                  Submit Check-in
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                {selectedQuarter} Status Overview
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
