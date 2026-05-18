import { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Download, FileSpreadsheet, Users, CheckCircle, Clock } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import PageHeader from '../../components/common/PageHeader';
import SurfaceCard from '../../components/common/SurfaceCard';
import ModernTable from '../../components/common/ModernTable';
import FormInput from '../../components/common/FormInput';
import { GoalStatus, Quarter } from '../../types';
import { buildAchievementRows, buildCompletionRows, downloadCsv, toCsv } from '../../utils/governanceAnalytics';

const QUARTERS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function Reports() {
  const { goals, checkIns, teamMembers } = useData();
  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [department, setDepartment] = useState('all');
  const [manager, setManager] = useState('all');
  const [status, setStatus] = useState<GoalStatus | 'all'>('all');

  const achievementRows = useMemo(() => (
    buildAchievementRows(goals, checkIns, teamMembers)
  ), [goals, checkIns, teamMembers]);

  const completionRows = useMemo(() => (
    buildCompletionRows(goals, checkIns, teamMembers, quarter)
  ), [goals, checkIns, teamMembers, quarter]);

  const departments = Array.from(new Set(teamMembers.map(member => member.departmentName)));
  const managers = Array.from(new Set(achievementRows.map(row => row.managerName)));

  const filteredAchievementRows = achievementRows.filter(row => (
    row.quarter === quarter
    && (department === 'all' || row.departmentName === department)
    && (manager === 'all' || row.managerName === manager)
    && (status === 'all' || row.status === status)
  ));

  const totalApprovedGoals = goals.filter(goal => goal.status === 'approved').length;
  const employeeCompletionAverage = completionRows.length
    ? Math.round(completionRows.reduce((sum, row) => sum + row.employeeCompletionRate, 0) / completionRows.length)
    : 0;
  const managerCompletionAverage = completionRows.length
    ? Math.round(completionRows.reduce((sum, row) => sum + row.managerCompletionRate, 0) / completionRows.length)
    : 0;

  const handleExportAchievement = () => {
    const csv = toCsv(
      ['Employee', 'Manager', 'Department', 'Quarter', 'Goal', 'Thrust Area', 'UoM', 'Status', 'Target', 'Planned', 'Actual', 'Score', 'Check-in Status'],
      filteredAchievementRows.map(row => [
        row.employeeName,
        row.managerName,
        row.departmentName,
        row.quarter,
        row.goalTitle,
        row.thrustArea,
        row.unitOfMeasure,
        row.status,
        row.target,
        row.plannedValue,
        row.actualValue,
        `${row.progressScore}%`,
        row.checkInStatus,
      ]),
    );
    downloadCsv(`achievement-report-${quarter}.csv`, csv);
  };

  return (
    <Box>
      <PageHeader
        title="Reports & Governance"
        subtitle="Export achievement data and monitor quarterly check-in completion."
        action={
          <Button variant="contained" startIcon={<Download size={18} />} onClick={handleExportAchievement}>
            Export CSV
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <KPICard title="Approved Goals" value={totalApprovedGoals} icon={FileSpreadsheet} color="#1976d2" subtitle="Eligible for check-ins" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KPICard title="Employee Completion" value={`${employeeCompletionAverage}%`} icon={CheckCircle} color="#2e7d32" subtitle={`${quarter} check-ins submitted`} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <KPICard title="Manager Completion" value={`${managerCompletionAverage}%`} icon={Users} color="#ed6c02" subtitle={`${quarter} manager comments`} />
        </Grid>
      </Grid>

      <SurfaceCard sx={{ mb: 3 }}>
          <Box sx={{ fontSize: 'var(--phoenix-text-section)', fontWeight: 700, mb: 2 }}>Completion Dashboard</Box>
          <ModernTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Manager</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Goals</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Employee Done</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Manager Done</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completionRows.map(row => (
                  <TableRow key={row.employeeId} hover>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.managerName}</TableCell>
                    <TableCell>{row.departmentName}</TableCell>
                    <TableCell>{row.approvedGoals}</TableCell>
                    <TableCell>{row.employeeSubmitted} / {row.approvedGoals} ({row.employeeCompletionRate}%)</TableCell>
                    <TableCell>{row.managerCompleted} / {row.approvedGoals} ({row.managerCompletionRate}%)</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.status === 'complete' ? 'Complete' : row.status === 'manager-pending' ? 'Manager pending' : 'Employee pending'}
                        color={row.status === 'complete' ? 'success' : row.status === 'manager-pending' ? 'warning' : 'error'}
                        icon={row.status === 'complete' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModernTable>
      </SurfaceCard>

      <SurfaceCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Box sx={{ fontSize: 18, fontWeight: 700 }}>Achievement Report</Box>
              <Box sx={{ fontSize: 13, color: 'text.secondary' }}>Planned target vs. actual achievement for all employees.</Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormInput id="report-quarter" name="reportQuarter" select size="small" label="Quarter" value={quarter} onChange={(e) => setQuarter(e.target.value as Quarter)} sx={{ width: 120 }}>
                {QUARTERS.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </FormInput>
              <FormInput id="report-department" name="reportDepartment" select size="small" label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} sx={{ width: 170 }}>
                <MenuItem value="all">All departments</MenuItem>
                {departments.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </FormInput>
              <FormInput id="report-manager" name="reportManager" select size="small" label="Manager" value={manager} onChange={(e) => setManager(e.target.value)} sx={{ width: 170 }}>
                <MenuItem value="all">All managers</MenuItem>
                {managers.map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </FormInput>
              <FormInput id="report-status" name="reportStatus" select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value as GoalStatus | 'all')} sx={{ width: 150 }}>
                <MenuItem value="all">All statuses</MenuItem>
                {['draft', 'pending', 'approved', 'rework', 'completed'].map(item => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </FormInput>
            </Box>
          </Box>

          <ModernTable>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Goal</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Planned</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actual</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAchievementRows.map((row, index) => (
                  <TableRow key={`${row.employeeId}-${row.goalTitle}-${row.quarter}-${index}`} hover>
                    <TableCell>
                      <Box sx={{ fontWeight: 700 }}>{row.employeeName}</Box>
                      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{row.managerName} / {row.departmentName}</Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ fontWeight: 600 }}>{row.goalTitle}</Box>
                      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{row.thrustArea} / {row.unitOfMeasure}</Box>
                    </TableCell>
                    <TableCell>{row.target}</TableCell>
                    <TableCell>{row.plannedValue}</TableCell>
                    <TableCell>{row.actualValue}</TableCell>
                    <TableCell>
                      <Chip size="small" label={`${row.progressScore}%`} color={row.progressScore >= 80 ? 'success' : row.progressScore >= 40 ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ModernTable>
      </SurfaceCard>
    </Box>
  );
}
