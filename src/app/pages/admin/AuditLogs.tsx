import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Button,
  Chip,
} from '@mui/material';
import { Download, Filter } from 'lucide-react';

export default function AuditLogs() {
  const { auditLogs } = useData();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const mockLogs = [
    {
      id: '1',
      timestamp: new Date('2026-05-16T10:30:00'),
      userId: 'emp-001',
      userName: 'John Smith',
      action: 'Created Goal',
      goalId: 'goal-001',
      goalTitle: 'Increase API Response Time',
      before: null,
      after: { title: 'Increase API Response Time', weightage: 20 },
    },
    {
      id: '2',
      timestamp: new Date('2026-05-16T09:15:00'),
      userId: 'mgr-001',
      userName: 'Sarah Johnson',
      action: 'Approved Goal',
      goalId: 'goal-001',
      goalTitle: 'Increase API Response Time',
      before: { status: 'pending' },
      after: { status: 'approved' },
    },
    {
      id: '3',
      timestamp: new Date('2026-05-15T14:20:00'),
      userId: 'emp-001',
      userName: 'John Smith',
      action: 'Updated Goal',
      goalId: 'goal-002',
      goalTitle: 'Launch Mobile App MVP',
      before: { weightage: 25 },
      after: { weightage: 30 },
    },
    {
      id: '4',
      timestamp: new Date('2026-05-15T11:00:00'),
      userId: 'admin-001',
      userName: 'Alex Chen',
      action: 'Opened Cycle Phase',
      goalId: null,
      goalTitle: null,
      before: { phase: 'goalSetting', isOpen: false },
      after: { phase: 'goalSetting', isOpen: true },
    },
    {
      id: '5',
      timestamp: new Date('2026-05-14T16:45:00'),
      userId: 'mgr-001',
      userName: 'Sarah Johnson',
      action: 'Requested Rework',
      goalId: 'goal-003',
      goalTitle: 'Mentor Junior Developers',
      before: { status: 'pending' },
      after: { status: 'rework' },
    },
  ];

  const allLogs = [...mockLogs, ...auditLogs];
  const filteredLogs = allLogs
    .filter((log) => filterAction === 'all' || log.action === filterAction)
    .filter((log) =>
      searchQuery === '' ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.goalTitle && log.goalTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const getActionColor = (action: string) => {
    if (action.includes('Created')) return 'primary';
    if (action.includes('Approved')) return 'success';
    if (action.includes('Rework') || action.includes('Rejected')) return 'error';
    if (action.includes('Updated')) return 'warning';
    return 'default';
  };

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Goal', 'Before', 'After'].join(','),
      ...filteredLogs.map((log) =>
        [
          log.timestamp.toLocaleString(),
          log.userName,
          log.action,
          log.goalTitle || 'N/A',
          log.before ? JSON.stringify(log.before) : 'N/A',
          log.after ? JSON.stringify(log.after) : 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Audit Logs</Box>
          <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
            Track all system changes and user actions
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Download size={18} />} onClick={handleExport}>
          Export CSV
        </Button>
      </Box>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              size="small"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
            />
            <TextField
              select
              size="small"
              label="Filter by Action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              sx={{ width: 200 }}
            >
              <MenuItem value="all">All Actions</MenuItem>
              <MenuItem value="Created Goal">Created Goal</MenuItem>
              <MenuItem value="Updated Goal">Updated Goal</MenuItem>
              <MenuItem value="Approved Goal">Approved Goal</MenuItem>
              <MenuItem value="Requested Rework">Requested Rework</MenuItem>
              <MenuItem value="Opened Cycle Phase">Opened Cycle Phase</MenuItem>
            </TextField>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Goal</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Before</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        {log.timestamp.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ fontWeight: 600, fontSize: 14 }}>{log.userName}</Box>
                        <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{log.userId}</Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.action}
                          size="small"
                          color={getActionColor(log.action)}
                        />
                      </TableCell>
                      <TableCell>
                        {log.goalTitle ? (
                          <Box>
                            <Box sx={{ fontSize: 13 }}>{log.goalTitle}</Box>
                            <Box sx={{ fontSize: 11, color: 'text.secondary' }}>{log.goalId}</Box>
                          </Box>
                        ) : (
                          <Box sx={{ color: 'text.secondary', fontSize: 13 }}>N/A</Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.before ? (
                          <Box
                            sx={{
                              fontSize: 11,
                              fontFamily: 'monospace',
                              bgcolor: '#f5f5f5',
                              p: 0.5,
                              borderRadius: 0.5,
                            }}
                          >
                            {JSON.stringify(log.before)}
                          </Box>
                        ) : (
                          <Box sx={{ color: 'text.secondary', fontSize: 13 }}>-</Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.after ? (
                          <Box
                            sx={{
                              fontSize: 11,
                              fontFamily: 'monospace',
                              bgcolor: '#f5f5f5',
                              p: 0.5,
                              borderRadius: 0.5,
                            }}
                          >
                            {JSON.stringify(log.after)}
                          </Box>
                        ) : (
                          <Box sx={{ color: 'text.secondary', fontSize: 13 }}>-</Box>
                        )}
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
