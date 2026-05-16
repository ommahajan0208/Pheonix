import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Box, Card, CardContent, TextField, Button, Divider } from '@mui/material';
import { Target, LogIn, User, Users, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      login(email, password);
      navigate('/employee/dashboard');
    }
  };

  const handleDemoLogin = (role: 'employee' | 'manager' | 'admin') => {
    loginAsRole(role);
    navigate(`/${role}/dashboard`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#10233f',
      }}
    >
      <Card sx={{ width: 450, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: 3,
                bgcolor: '#e3f2fd',
                mb: 2,
              }}
            >
              <Target size={48} color="#1976d2" />
            </Box>
            <Box sx={{ fontSize: 28, fontWeight: 700, mb: 1 }}>
              Pheonix
            </Box>
            <Box sx={{ fontSize: 14, color: 'text.secondary' }}>
              Enterprise Performance Management Portal
            </Box>
          </Box>

          <Box
            component="form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleLogin();
            }}
          >
            <TextField
              fullWidth
              id="login-email"
              name="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              id="login-password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              startIcon={<LogIn size={20} />}
              sx={{ mb: 2, py: 1.5, textTransform: 'none', fontSize: 15 }}
            >
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Box sx={{ fontSize: 13, color: 'text.secondary', px: 2 }}>
              Demo Access
            </Box>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<User size={18} />}
              onClick={() => handleDemoLogin('employee')}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                py: 1.2,
                borderColor: '#2e7d32',
                color: '#2e7d32',
                '&:hover': { borderColor: '#2e7d32', bgcolor: '#e8f5e9' },
              }}
            >
              Login as Employee (John Smith)
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Users size={18} />}
              onClick={() => handleDemoLogin('manager')}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                py: 1.2,
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': { borderColor: '#1976d2', bgcolor: '#e3f2fd' },
              }}
            >
              Login as Manager (Sarah Johnson)
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Shield size={18} />}
              onClick={() => handleDemoLogin('admin')}
              sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                py: 1.2,
                borderColor: '#9c27b0',
                color: '#9c27b0',
                '&:hover': { borderColor: '#9c27b0', bgcolor: '#f3e5f5' },
              }}
            >
              Login as Admin (Alex Chen)
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
