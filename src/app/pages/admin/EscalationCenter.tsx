import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import { AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import { EscalationLog } from '../../types';

const levelLabel: Record<EscalationLog['currentLevel'], string> = {
  employee: 'Employee',
  manager: 'Manager',
  hr: 'Skip-level / HR',
};

export default function EscalationCenter() {
  const { escalationRules, escalationLogs, updateEscalationLogStatus } = useData();
  const [selectedStatus, setSelectedStatus] = useState<EscalationLog['status'] | 'all'>('all');

  const filteredLogs = escalationLogs.filter(log => selectedStatus === 'all' || log.status === selectedStatus);
  const openCount = escalationLogs.filter(log => log.status === 'open').length;
  const managerLevelCount = escalationLogs.filter(log => log.currentLevel === 'manager').length;
  const hrLevelCount = escalationLogs.filter(log => log.currentLevel === 'hr').length;

  const getStatusColor = (status: EscalationLog['status']) => {
    if (status === 'open') return 'error';
    if (status === 'monitoring') return 'warning';
    return 'success';
  };

  const getLevelColor = (level: EscalationLog['currentLevel']) => {
    if (level === 'hr') return 'error';
    if (level === 'manager') return 'warning';
    return 'primary';
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Escalation Center</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Rule-based escalation tracking for goal submission, approval, and quarterly check-ins.
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Open Escalations" value={openCount} icon={AlertCircle} color="#d32f2f" subtitle="Need action" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Manager Level" value={managerLevelCount} icon={Users} color="#ed6c02" subtitle="Escalated to L1" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="HR Level" value={hrLevelCount} icon={Clock} color="#9c27b0" subtitle="Skip-level / HR" />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <KPICard title="Active Rules" value={escalationRules.filter(rule => rule.active).length} icon={CheckCircle} color="#2e7d32" subtitle="Demo configuration" />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {escalationRules.map(rule => (
          <Grid size={{ xs: 12, md: 4 }} key={rule.id}>
            <Card sx={{ boxShadow: 2, height: '100%' }}>
              <CardContent>
                <Chip label={rule.active ? 'ACTIVE' : 'INACTIVE'} size="small" color={rule.active ? 'success' : 'default'} sx={{ mb: 1 }} />
                <Box sx={{ fontSize: 15, fontWeight: 800, mb: 0.5 }}>{rule.name}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1.5 }}>
                  Trigger after {rule.thresholdDays} day(s), manager at {rule.managerAfterDays}, HR at {rule.hrAfterDays}.
                </Box>
                <Chip label={rule.condition.replaceAll('-', ' ')} size="small" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={selectedStatus} onChange={(_, value) => setSelectedStatus(value)}>
            {(['all', 'open', 'monitoring', 'resolved'] as const).map(status => (
              <Tab
                key={status}
                value={status}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status === 'all' ? 'All' : status}
                    <Chip
                      label={status === 'all' ? escalationLogs.length : escalationLogs.filter(log => log.status === status).length}
                      size="small"
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 2 }}>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rule</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Escalation Chain</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Resolve</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                      No escalations for this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        <Box sx={{ fontWeight: 700 }}>{log.employeeName}</Box>
                        <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{log.managerName} / {log.departmentName}</Box>
                      </TableCell>
                      <TableCell>{log.ruleName}</TableCell>
                      <TableCell>
                        <Box>{log.goalTitle || log.quarter || 'Goal sheet'}</Box>
                        {log.quarter && <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{log.quarter}</Box>}
                      </TableCell>
                      <TableCell>
                        <Chip label={levelLabel[log.currentLevel]} size="small" color={getLevelColor(log.currentLevel)} />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>{log.reason}</TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          value={log.status}
                          onChange={(event) => updateEscalationLogStatus(log.id, event.target.value as EscalationLog['status'])}
                          sx={{ width: 140 }}
                        >
                          <MenuItem value="open">Open</MenuItem>
                          <MenuItem value="monitoring">Monitoring</MenuItem>
                          <MenuItem value="resolved">Resolved</MenuItem>
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={log.status === 'resolved'}
                          onClick={() => updateEscalationLogStatus(log.id, 'resolved')}
                        >
                          Mark Resolved
                        </Button>
                        <Box sx={{ mt: 1 }}>
                          <Chip label={log.status} size="small" color={getStatusColor(log.status)} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
