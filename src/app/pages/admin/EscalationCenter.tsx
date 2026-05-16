import { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import GoalCard from '../../components/common/GoalCard';

export default function EscalationCenter() {
  const { goals, escalations } = useData();
  const [selectedTab, setSelectedTab] = useState(0);

  const atRiskGoals = goals.filter(g => g.progress < 30 && g.status === 'approved');
  const overdue = goals.filter(g => {
    if (!g.deadlineDate) return false;
    return new Date(g.deadlineDate) < new Date() && g.progress < 100;
  });
  const reworkGoals = goals.filter(g => g.status === 'rework');

  const allEscalations = [...atRiskGoals, ...overdue, ...reworkGoals];

  const tabs = [
    { label: 'All', count: allEscalations.length, goals: allEscalations },
    { label: 'At Risk', count: atRiskGoals.length, goals: atRiskGoals },
    { label: 'Overdue', count: overdue.length, goals: overdue },
    { label: 'Rework', count: reworkGoals.length, goals: reworkGoals },
  ];

  const currentGoals = tabs[selectedTab].goals;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>Escalation Center</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Monitor and manage goals requiring immediate attention
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {escalations.map(item => (
          <Grid item xs={12} md={4} key={item.id}>
            <Card sx={{ border: '1px solid #f3c7c7', boxShadow: '0 1px 4px rgba(211,47,47,0.08)' }}>
              <CardContent>
                <Chip label={item.severity.toUpperCase()} size="small" color={item.severity === 'high' ? 'error' : item.severity === 'medium' ? 'warning' : 'default'} sx={{ mb: 1 }} />
                <Box sx={{ fontSize: 15, fontWeight: 800, mb: 0.5 }}>{item.title}</Box>
                <Box sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>{item.owner} / {item.reason}</Box>
                <Chip label={item.status} size="small" variant="outlined" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ boxShadow: 2, mb: 3 }}>
        <CardContent sx={{ pb: 0 }}>
          <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)}>
            {tabs.map((tab, idx) => (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip
                      label={tab.count}
                      size="small"
                      color={tab.count > 0 ? 'error' : 'default'}
                      sx={{ height: 20 }}
                    />
                  </Box>
                }
              />
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {currentGoals.length === 0 ? (
        <Card sx={{ boxShadow: 2 }}>
          <CardContent>
            <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
              <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <Box sx={{ fontSize: 16, mb: 1 }}>No escalations</Box>
              <Box sx={{ fontSize: 14 }}>All goals are on track!</Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {currentGoals.map((goal) => {
            const isAtRisk = goal.progress < 30 && goal.status === 'approved';
            const isOverdue = goal.deadlineDate && new Date(goal.deadlineDate) < new Date() && goal.progress < 100;
            const isRework = goal.status === 'rework';

            return (
              <Card key={goal.id} sx={{ boxShadow: 2, mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {isAtRisk && (
                      <Chip
                        icon={<AlertCircle size={14} />}
                        label="At Risk"
                        size="small"
                        color="error"
                      />
                    )}
                    {isOverdue && (
                      <Chip
                        icon={<Clock size={14} />}
                        label="Overdue"
                        size="small"
                        sx={{ bgcolor: '#d32f2f', color: 'white' }}
                      />
                    )}
                    {isRework && (
                      <Chip
                        icon={<XCircle size={14} />}
                        label="Needs Rework"
                        size="small"
                        color="warning"
                      />
                    )}
                  </Box>

                  <GoalCard goal={goal} showActions={false} />

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="outlined" size="small">
                      View Details
                    </Button>
                    <Button variant="outlined" size="small">
                      Contact Manager
                    </Button>
                    <Button variant="contained" size="small" color="error">
                      Flag for Review
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
