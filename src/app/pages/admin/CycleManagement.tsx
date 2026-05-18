import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Grid,
  Button,
  Switch,
  Chip,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import SurfaceCard from '../../components/common/SurfaceCard';
import PremiumCard from '../../components/common/PremiumCard';
import { Plus, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CyclePhaseKey, PHASE_METADATA, isDateInPhaseWindow } from '../../utils/cycleSchedule';
import {
  invalidPhaseDateRangeMessage,
  overlappingPhaseWindowMessage,
  simultaneousOpenPhaseMessage,
} from '../../utils/constraintGuidance';

export default function CycleManagement() {
  const { cycles, updateCyclePhase } = useData();
  const [selectedCycleId] = useState(cycles[0]?.id || '');
  const [pendingOpenPhase, setPendingOpenPhase] = useState<CyclePhaseKey | null>(null);
  const selectedCycle = cycles.find(cycle => cycle.id === selectedCycleId) || cycles[0];

  const phases: CyclePhaseKey[] = ['goalSetting', 'q1Checkin', 'q2Checkin', 'q3Checkin', 'q4Checkin'];
  const toDate = (value?: string | Date | null) => (value instanceof Date ? value : value ? new Date(value) : null);
  const normalizeDay = (date: Date) => {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
  };
  const getValidationMessage = (targetPhase: CyclePhaseKey, updates: Partial<NonNullable<typeof selectedCycle>['phases'][CyclePhaseKey]> = {}) => {
    if (!selectedCycle) return '';
    const nextPhases = {
      ...selectedCycle.phases,
      [targetPhase]: {
        ...selectedCycle.phases[targetPhase],
        ...updates,
      },
    };

    for (const phase of phases) {
      const phaseData = nextPhases[phase];
      const start = toDate(phaseData.start);
      const end = toDate(phaseData.end);
      if (start && end && normalizeDay(end) < normalizeDay(start)) {
        return invalidPhaseDateRangeMessage(PHASE_METADATA[phase].label);
      }
    }

    for (let index = 0; index < phases.length - 1; index += 1) {
      const current = phases[index];
      const next = phases[index + 1];
      const currentEnd = toDate(nextPhases[current].end);
      const nextStart = toDate(nextPhases[next].start);
      if (currentEnd && nextStart && normalizeDay(nextStart) <= normalizeDay(currentEnd)) {
        return overlappingPhaseWindowMessage(PHASE_METADATA[current].label, PHASE_METADATA[next].label);
      }
    }

    return '';
  };

  const updatePhaseWithValidation = (phase: CyclePhaseKey, updates: Partial<NonNullable<typeof selectedCycle>['phases'][CyclePhaseKey]>) => {
    const validationMessage = getValidationMessage(phase, updates);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }
    updateCyclePhase(selectedCycle.id, phase, updates);
  };

  const handleTogglePhase = (phase: CyclePhaseKey, isOpen: boolean) => {
    if (!isOpen) {
      updatePhaseWithValidation(phase, { isOpen: false });
      return;
    }
    const openPhase = phases.find(item => item !== phase && selectedCycle?.phases[item]?.isOpen);
    if (openPhase) {
      setPendingOpenPhase(phase);
      return;
    }
    updatePhaseWithValidation(phase, { isOpen: true });
  };

  const confirmOpenPhase = () => {
    if (!pendingOpenPhase) return;
    updatePhaseWithValidation(pendingOpenPhase, { isOpen: true });
    setPendingOpenPhase(null);
  };
  const currentOpenPhase = pendingOpenPhase
    ? phases.find(item => item !== pendingOpenPhase && selectedCycle?.phases[item]?.isOpen)
    : undefined;

  return (
    <Box>
      <PageHeader
        title="Cycle Management"
        subtitle="Configure performance review cycles and phases"
        action={
          <Button variant="contained" startIcon={<Plus size={18} />}>
            Create New Cycle
          </Button>
        }
      />

      <SurfaceCard sx={{ mb: 3 }}>
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
      </SurfaceCard>

      <Grid container spacing={3}>
        {phases.map((phase) => {
          const phaseData = selectedCycle?.phases[phase];
          const meta = PHASE_METADATA[phase];
          const inDateWindow = isDateInPhaseWindow(selectedCycle, phase);
          const validationMessage = getValidationMessage(phase);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={phase}>
              <PremiumCard>
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
                        onChange={(event) => handleTogglePhase(phase, event.target.checked)}
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
                          onChange={(date) => date && updatePhaseWithValidation(phase, { start: date })}
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
                          onChange={(date) => date && updatePhaseWithValidation(phase, { end: date })}
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

                  {validationMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {validationMessage}
                    </Alert>
                  )}

                  <Box sx={{ mt: 2, p: 1.5, bgcolor: 'var(--phoenix-surface-muted)', borderRadius: 2, fontSize: 12, border: '1px solid var(--phoenix-border-subtle)' }}>
                    Status: {phaseData?.isOpen ? 'Open for submissions' : 'Locked'} / Calendar window: {inDateWindow ? 'today is within the configured dates' : 'today is outside the configured dates'}
                  </Box>
              </PremiumCard>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={Boolean(pendingOpenPhase)} onClose={() => setPendingOpenPhase(null)}>
        <DialogTitle>Open Another Phase?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {pendingOpenPhase && currentOpenPhase
              ? simultaneousOpenPhaseMessage(PHASE_METADATA[pendingOpenPhase].label, PHASE_METADATA[currentOpenPhase].label)
              : 'Opening this phase will make multiple phases active simultaneously. Confirm this is intentional before proceeding.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingOpenPhase(null)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={confirmOpenPhase}>
            Open Phase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
