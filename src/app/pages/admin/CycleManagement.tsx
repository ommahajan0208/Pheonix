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

export default function CycleManagement() {
  const { cycles } = useData();
  const [selectedCycle] = useState(cycles[0]);

  const phases = [
    { id: 'goalSetting', label: 'Goal Setting', color: '#1976d2' },
    { id: 'q1Checkin', label: 'Q1 Check-in', color: '#2e7d32' },
    { id: 'q2Checkin', label: 'Q2 Check-in', color: '#2e7d32' },
    { id: 'q3Checkin', label: 'Q3 Check-in', color: '#2e7d32' },
    { id: 'q4Checkin', label: 'Q4 Check-in', color: '#2e7d32' },
    { id: 'finalReview', label: 'Final Review', color: '#9c27b0' },
  ];

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
                const phaseData = selectedCycle?.phases[phase.id as keyof typeof selectedCycle.phases];
                return (
                  <Box
                    key={phase.id}
                    sx={{
                      flex: 1,
                      minWidth: 150,
                      p: 2,
                      borderRadius: 1,
                      bgcolor: phaseData?.isOpen ? `${phase.color}15` : '#f5f5f5',
                      border: `2px solid ${phaseData?.isOpen ? phase.color : '#e0e0e0'}`,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ fontSize: 13, fontWeight: 600, mb: 1, color: phase.color }}>
                      {phase.label}
                    </Box>
                    <Box sx={{ fontSize: 11, color: 'text.secondary' }}>
                      {phaseData && new Date(phaseData.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {phaseData && new Date(phaseData.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
                          borderLeft: `8px solid ${phaseData?.isOpen ? phase.color : '#e0e0e0'}`,
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
          const phaseData = selectedCycle?.phases[phase.id as keyof typeof selectedCycle.phases];
          return (
            <Grid item xs={12} md={6} key={phase.id}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ fontSize: 16, fontWeight: 600 }}>
                      {phase.label}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {phaseData?.isOpen ? <Unlock size={16} color="#2e7d32" /> : <Lock size={16} color="#d32f2f" />}
                      <Switch checked={phaseData?.isOpen} />
                    </Box>
                  </Box>

                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <DatePicker
                          label="Start Date"
                          value={phaseData?.start}
                          disabled={!phaseData?.isOpen}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DatePicker
                          label="End Date"
                          value={phaseData?.end}
                          disabled={!phaseData?.isOpen}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                      </Grid>
                    </Grid>
                  </LocalizationProvider>

                  <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: 12 }}>
                    Status: {phaseData?.isOpen ? 'Open for submissions' : 'Locked'}
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
