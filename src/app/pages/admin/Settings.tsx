import { Box, Card, CardContent, Grid, TextField, Switch, Button, Divider } from '@mui/material';
import { Save, Unlock } from 'lucide-react';
import { useData } from '../../context/DataContext';
import SharedKpiForm from '../../components/common/SharedKpiForm';

export default function Settings() {
  const { goals, adminUnlockGoal } = useData();
  const lockedGoals = goals.filter(goal => goal.status === 'approved');

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>System Settings</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Configure global system preferences and policies
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Goal Settings
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="max-goals-per-employee"
                  name="maxGoalsPerEmployee"
                  type="number"
                  label="Maximum Goals per Employee"
                  defaultValue={8}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="minimum-weightage-per-goal"
                  name="minimumWeightagePerGoal"
                  type="number"
                  label="Minimum Weightage per Goal (%)"
                  defaultValue={10}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="required-total-weightage"
                  name="requiredTotalWeightage"
                  type="number"
                  label="Required Total Weightage (%)"
                  defaultValue={100}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Allow Shared Goals</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'allow-shared-goals', name: 'allowSharedGoals', 'aria-label': 'Allow shared goals' } }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ fontSize: 14 }}>Require Manager Approval</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'require-manager-approval', name: 'requireManagerApproval', 'aria-label': 'Require manager approval' } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Admin Goal Intervention
              </Box>
              <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Unlock an approved goal by moving it back to rework for correction.
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 280, overflow: 'auto' }}>
                {lockedGoals.map(goal => (
                  <Box
                    key={goal.id}
                    sx={{
                      p: 1.5,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Box sx={{ fontSize: 13, fontWeight: 700 }}>{goal.title}</Box>
                      <Box sx={{ fontSize: 12, color: 'text.secondary' }}>{goal.employeeName} / {goal.weightage}%</Box>
                    </Box>
                    <Button size="small" variant="outlined" startIcon={<Unlock size={14} />} onClick={() => adminUnlockGoal(goal.id)}>
                      Unlock
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 0.5 }}>
                Push Shared Department KPI
              </Box>
              <Box sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
                Admins can push a locked-title shared KPI to multiple employee goal sheets.
              </Box>
              <SharedKpiForm />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Notification Settings
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Email Notifications</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'email-notifications', name: 'emailNotifications', 'aria-label': 'Email notifications' } }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Deadline Reminders</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'deadline-reminders', name: 'deadlineReminders', 'aria-label': 'Deadline reminders' } }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Approval Alerts</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'approval-alerts', name: 'approvalAlerts', 'aria-label': 'Approval alerts' } }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="reminder-days-before-deadline"
                  name="reminderDaysBeforeDeadline"
                  type="number"
                  label="Reminder Days Before Deadline"
                  defaultValue={7}
                  fullWidth
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Performance Review
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="review-frequency"
                  name="reviewFrequency"
                  select
                  label="Review Frequency"
                  defaultValue="quarterly"
                  fullWidth
                  size="small"
                  SelectProps={{ native: true }}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </TextField>
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="check-in-window-days"
                  name="checkInWindowDays"
                  type="number"
                  label="Check-in Window (Days)"
                  defaultValue={15}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Self-Assessment Required</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'self-assessment-required', name: 'selfAssessmentRequired', 'aria-label': 'Self-assessment required' } }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ fontSize: 14 }}>Peer Feedback Enabled</Box>
                <Switch slotProps={{ input: { id: 'peer-feedback-enabled', name: 'peerFeedbackEnabled', 'aria-label': 'Peer feedback enabled' } }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Security & Compliance
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Audit Logging</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'audit-logging', name: 'auditLogging', 'aria-label': 'Audit logging' } }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Data Encryption</Box>
                <Switch defaultChecked slotProps={{ input: { id: 'data-encryption', name: 'dataEncryption', 'aria-label': 'Data encryption' } }} />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="session-timeout-minutes"
                  name="sessionTimeoutMinutes"
                  type="number"
                  label="Session Timeout (Minutes)"
                  defaultValue={60}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  id="data-retention-days"
                  name="dataRetentionDays"
                  type="number"
                  label="Data Retention (Days)"
                  defaultValue={365}
                  fullWidth
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Integration Settings
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="smtp-server"
                    name="smtpServer"
                    label="SMTP Server"
                    defaultValue="smtp.company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="smtp-port"
                    name="smtpPort"
                    label="SMTP Port"
                    defaultValue="587"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    id="from-email"
                    name="fromEmail"
                    label="From Email"
                    defaultValue="noreply@company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="sso-provider-url"
                    name="ssoProviderUrl"
                    label="SSO Provider URL"
                    placeholder="https://sso.company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    id="api-key"
                    name="apiKey"
                    label="API Key"
                    placeholder="****************"
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" size="large">
              Reset to Defaults
            </Button>
            <Button variant="contained" size="large" startIcon={<Save size={18} />}>
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
