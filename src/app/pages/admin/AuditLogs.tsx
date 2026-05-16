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
import { Download, Lock } from 'lucide-react';
import { downloadCsv, toCsv } from '../../utils/governanceAnalytics';

export default function AuditLogs() {
  const { auditLogs } = useData();
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const actionOptions = Array.from(new Set(auditLogs.map(log => log.action)));
  const filteredLogs = auditLogs
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
    const csv = toCsv(
      ['Timestamp', 'User', 'Action', 'Goal', 'Changed After Lock', 'Fields Changed', 'Before', 'After'],
      filteredLogs.map(log => [
        log.timestamp.toLocaleString(),
        log.userName,
        log.action,
        log.goalTitle || 'N/A',
        log.changedAfterLock ? 'Yes' : 'No',
        log.fieldChanges?.map(change => change.field).join('; ') || 'N/A',
        log.before ? JSON.stringify(log.before) : 'N/A',
        log.after ? JSON.stringify(log.after) : 'N/A',
      ]),
    );
    downloadCsv('audit-logs.csv', csv);
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
              {actionOptions.map(action => <MenuItem key={action} value={action}>{action}</MenuItem>)}
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
                  <TableCell sx={{ fontWeight: 600 }}>Locked Change</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Before</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
                        {log.changedAfterLock ? (
                          <Chip icon={<Lock size={14} />} label="After lock" size="small" color="error" />
                        ) : (
                          <Chip label="Standard" size="small" variant="outlined" />
                        )}
                        {log.fieldChanges && log.fieldChanges.length > 0 && (
                          <Box sx={{ fontSize: 11, color: 'text.secondary', mt: 0.5 }}>
                            {log.fieldChanges.map(change => change.field).join(', ')}
                          </Box>
                        )}
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
