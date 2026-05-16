import { Box, Card, CardContent, Grid, TextField, Switch, Button, Divider } from '@mui/material';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 24, fontWeight: 700, mb: 0.5 }}>System Settings</Box>
        <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
          Configure global system preferences and policies
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Goal Settings
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  type="number"
                  label="Maximum Goals per Employee"
                  defaultValue={8}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  type="number"
                  label="Minimum Weightage per Goal (%)"
                  defaultValue={10}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  type="number"
                  label="Required Total Weightage (%)"
                  defaultValue={100}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Allow Shared Goals</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ fontSize: 14 }}>Require Manager Approval</Box>
                <Switch defaultChecked />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Notification Settings
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Email Notifications</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Deadline Reminders</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Approval Alerts</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
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

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Performance Review
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
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
                  type="number"
                  label="Check-in Window (Days)"
                  defaultValue={15}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Self-Assessment Required</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ fontSize: 14 }}>Peer Feedback Enabled</Box>
                <Switch />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Security & Compliance
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Audit Logging</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 14 }}>Data Encryption</Box>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  type="number"
                  label="Session Timeout (Minutes)"
                  defaultValue={60}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <TextField
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

        <Grid item xs={12}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ fontSize: 18, fontWeight: 600, mb: 2 }}>
                Integration Settings
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="SMTP Server"
                    defaultValue="smtp.company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="SMTP Port"
                    defaultValue="587"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="From Email"
                    defaultValue="noreply@company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SSO Provider URL"
                    placeholder="https://sso.company.com"
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="API Key"
                    type="password"
                    placeholder="****************"
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
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
