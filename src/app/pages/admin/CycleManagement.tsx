import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  Chip,
} from '@mui/material';
import { Plus, Lock, Unlock } from 'lucide-react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CyclePhaseKey, PHASE_METADATA, isDateInPhaseWindow } from '../../utils/cycleSchedule';

export default function CycleManagement() {
  const { cycles, updateCyclePhase } = useData();
  const [selectedCycleId] = useState(cycles[0]?.id || '');
  const selectedCycle = cycles.find(cycle => cycle.id === selectedCycleId) || cycles[0];

  const phases: CyclePhaseKey[] = ['goalSetting', 'q1Checkin', 'q2Checkin', 'q3Checkin', 'q4Checkin'];
  const toDate = (value?: string | Date | null) => (value instanceof Date ? value : value ? new Date(value) : null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Cycle Management</Box>
          <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
            Configure performance review cycles and phases
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />}>
          Create New Cycle
        </Button>
      </Box>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Box sx={{ fontSize: 20, fontWeight: 600, mb: 0.5 }}>
                {selectedCycle?.name}
              </Box>
              <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
                {new Date(selectedCycle?.startDate).toLocaleDateString()} - {new Date(selectedCycle?.endDate).toLocaleDateString()}
              </Box>
            </Box>
            <Chip
              label={selectedCycle?.isActive ? 'Active' : 'Inactive'}
              color={selectedCycle?.isActive ? 'success' : 'default'}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Box sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>
              Cycle Timeline
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
              {phases.map((phase, idx) => {
                const phaseData = selectedCycle?.phases[phase];
                const meta = PHASE_METADATA[phase];
                const inDateWindow = isDateInPhaseWindow(selectedCycle, phase);
                return (
                  <Box
                    key={phase}
                    sx={{
                      flex: 1,
                      minWidth: 150,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: phaseData?.isOpen ? `${meta.color}15` : '#f5f5f5',
                      border: `2px solid ${phaseData?.isOpen ? meta.color : inDateWindow ? '#ed6c02' : '#e0e0e0'}`,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: meta.color }}>
                      {meta.label}
                    </Box>
                    <Box sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {phaseData && new Date(phaseData.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {phaseData && new Date(phaseData.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Box>
                    <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                      {meta.action}
                    </Box>
                    {idx < phases.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 0,
                          height: 0,
                          borderTop: '8px solid transparent',
                          borderBottom: '8px solid transparent',
                          borderLeft: `8px solid ${phaseData?.isOpen ? meta.color : '#e0e0e0'}`,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {phases.map((phase) => {
          const phaseData = selectedCycle?.phases[phase];
          const meta = PHASE_METADATA[phase];
          const inDateWindow = isDateInPhaseWindow(selectedCycle, phase);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={phase}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                      <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                        {meta.label}
                      </Box>
                      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                        {meta.action}
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {phaseData?.isOpen ? <Unlock size={16} color="#2e7d32" /> : <Lock size={16} color="#d32f2f" />}
                      <Switch
                        checked={phaseData?.isOpen}
                        onChange={(event) => updateCyclePhase(selectedCycle.id, phase, { isOpen: event.target.checked })}
                        slotProps={{
                          input: {
                            id: `cycle-phase-open-${phase}`,
                            name: `cyclePhaseOpen-${phase}`,
                            'aria-label': `${meta.label} open status`,
                          },
                        }}
                      />
                    </Box>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={2}>
                      <Grid size={6}>
                        <DatePicker
                          label="Start Date"
                          value={toDate(phaseData?.start)}
                          onChange={(date) => date && updateCyclePhase(selectedCycle.id, phase, { start: date })}
                          slotProps={{
                            textField: {
                              id: `cycle-phase-start-${phase}`,
                              name: `cyclePhaseStart-${phase}`,
                              size: 'small',
                              fullWidth: true,
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={6}>
                        <DatePicker
                          label="End Date"
                          value={toDate(phaseData?.end)}
                          onChange={(date) => date && updateCyclePhase(selectedCycle.id, phase, { end: date })}
                          slotProps={{
                            textField: {
                              id: `cycle-phase-end-${phase}`,
                              name: `cyclePhaseEnd-${phase}`,
                              size: 'small',
                              fullWidth: true,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </LocalizationProvider>

                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: 12 }}>
                    Status: {phaseData?.isOpen ? 'Open for submissions' : 'Locked'} / Calendar window: {inDateWindow ? 'today is within the configured dates' : 'today is outside the configured dates'}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
