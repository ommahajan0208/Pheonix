import { Outlet, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';
import ContextPanel from '../components/layout/ContextPanel';
import { Box } from '@mui/material';

export default function RootLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const routeRole = location.pathname.split('/')[2];
  if (!['employee', 'manager', 'admin'].includes(routeRole)) {
    return <Navigate to={`/dashboard/${user.role}/dashboard`} replace />;
  }
  if (routeRole !== user.role) {
    return <Navigate to={`/dashboard/${user.role}/dashboard`} replace />;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f7fb' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', minWidth: 0 }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopNavbar />
          <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
            <Outlet />
          </Box>
        </Box>
        <ContextPanel />
      </Box>
    </Box>
  );
}
