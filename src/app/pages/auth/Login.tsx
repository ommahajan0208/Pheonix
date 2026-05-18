import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Box, Button, Divider } from '@mui/material';
import { ArrowRight, Target, User, Users, Shield } from 'lucide-react';
import FormInput from '../../components/common/FormInput';
import SurfaceCard from '../../components/common/SurfaceCard';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      login(email, password);
      navigate('/dashboard/employee/dashboard');
    }
  };

  const handleDemoLogin = (role: 'employee' | 'manager' | 'admin') => {
    loginAsRole(role);
    navigate(`/dashboard/${role}/dashboard`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--phoenix-hero-start) 0%, var(--phoenix-hero-end) 100%)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', top: -120, left: -120, width: 320, height: 320, borderRadius: '50%', bgcolor: 'rgba(111,178,255,0.24)', filter: 'blur(30px)' }} />
      <Box sx={{ position: 'absolute', bottom: -150, right: -80, width: 360, height: 360, borderRadius: '50%', bgcolor: 'rgba(25,118,210,0.2)', filter: 'blur(40px)' }} />
      <Box
        sx={{
          width: '100%',
          maxWidth: 1180,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' },
          px: { xs: 2.5, md: 5 },
          py: { xs: 2, md: 3 },
          gap: 4,
          alignItems: 'center',
          justifyItems: 'center',
          zIndex: 1,
        }}
      >
        <Box sx={{ color: 'white', pr: { md: 4 } }}>
          <Box sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.18em', opacity: 0.72, fontWeight: 700, mb: 2 }}>Performance OS</Box>
          <Box sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-0.03em', mb: 2.5 }}>
            Goal setting, performance, and growth in one unified workspace.
          </Box>
          <Box sx={{ fontSize: 17, lineHeight: 1.65, color: 'rgba(232,238,251,0.86)', maxWidth: 560, mb: 3.5 }}>
            Bring admin, manager, and employee workflows into one premium experience with consistent visibility and accountability.
          </Box>
        </Box>

        <SurfaceCard
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 'var(--phoenix-radius-lg)',
            border: '1px solid rgba(255,255,255,0.34)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.8) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'var(--phoenix-shadow-lg)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box sx={{ display: 'inline-flex', p: 1.7, borderRadius: 3, bgcolor: 'rgba(25,118,210,0.1)', mb: 1.5 }}>
              <Target size={40} color="#1976d2" />
            </Box>
            <Box sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--phoenix-text-primary)' }}>Pheonix</Box>
            <Box sx={{ fontSize: 14, color: 'var(--phoenix-text-secondary)' }}>Enterprise Performance Management Portal</Box>
          </Box>

          <Box component="form" autoComplete="off" noValidate onSubmit={(event) => { event.preventDefault(); handleLogin(); }}>
            <FormInput fullWidth id="login-email" name="loginIdentifier" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" sx={{ mb: 2 }} />
            <FormInput fullWidth id="login-password" name="loginSecret" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" sx={{ mb: 3 }} />
            <Button fullWidth variant="contained" size="large" type="submit" endIcon={<ArrowRight size={18} />} sx={{ mb: 2, py: 1.5, textTransform: 'none', fontSize: 15, bgcolor: 'var(--phoenix-accent)', '&:hover': { bgcolor: 'var(--phoenix-accent-hover)' } }}>
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Box sx={{ fontSize: 13, color: 'text.secondary', px: 2 }}>
              Demo Access
            </Box>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button fullWidth variant="outlined" startIcon={<User size={18} />} onClick={() => handleDemoLogin('employee')} sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.2, borderColor: '#2e7d32', color: '#2e7d32', bgcolor: 'rgba(46,125,50,0.04)', '&:hover': { borderColor: '#2e7d32', bgcolor: 'rgba(46,125,50,0.1)' } }}>
              Login as Employee (John Smith)
            </Button>
            <Button fullWidth variant="outlined" startIcon={<Users size={18} />} onClick={() => handleDemoLogin('manager')} sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.2, borderColor: '#1976d2', color: '#1976d2', bgcolor: 'rgba(25,118,210,0.04)', '&:hover': { borderColor: '#1976d2', bgcolor: 'rgba(25,118,210,0.1)' } }}>
              Login as Manager (Sarah Johnson)
            </Button>
            <Button fullWidth variant="outlined" startIcon={<Shield size={18} />} onClick={() => handleDemoLogin('admin')} sx={{ textTransform: 'none', justifyContent: 'flex-start', py: 1.2, borderColor: '#9c27b0', color: '#9c27b0', bgcolor: 'rgba(156,39,176,0.04)', '&:hover': { borderColor: '#9c27b0', bgcolor: 'rgba(156,39,176,0.1)' } }}>
              Login as Admin (Alex Chen)
            </Button>
          </Box>
        </SurfaceCard>
      </Box>
    </Box>
  );
}