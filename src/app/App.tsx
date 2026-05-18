import { RouterProvider } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { router } from './routes';
import { ThemeProvider, createTheme } from '@mui/material';
import { Toaster } from 'sonner';

const theme = createTheme({
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    h3: {
      fontSize: '2.25rem',
      fontWeight: 700,
      color: '#0f172a',
      letterSpacing: '-0.02em',
    },
    h4: {
      fontSize: '1.375rem',
      fontWeight: 700,
      color: '#0f172a',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    error: {
      main: '#d32f2f',
    },
    info: {
      main: '#9c27b0',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 'var(--phoenix-radius-md)',
          border: '1px solid var(--phoenix-border-subtle)',
          boxShadow: 'var(--phoenix-shadow-sm)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all var(--phoenix-transition)',
        },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <DataProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors closeButton />
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
