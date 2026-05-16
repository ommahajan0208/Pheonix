import { createBrowserRouter, Navigate } from 'react-router';
import RootLayout from './layouts/RootLayout';
import Login from './pages/auth/Login';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MyGoals from './pages/employee/MyGoals';
import GoalSubmitReview from './pages/employee/GoalSubmitReview';
import QuarterlyCheckIn from './pages/employee/QuarterlyCheckIn';
import SharedGoals from './pages/employee/SharedGoals';
import Notifications from './pages/employee/Notifications';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import TeamGoals from './pages/manager/TeamGoals';
import Approvals from './pages/manager/Approvals';
import ManagerCheckIn from './pages/manager/ManagerCheckIn';
import TeamAnalytics from './pages/manager/TeamAnalytics';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import CycleManagement from './pages/admin/CycleManagement';
import OrgHierarchy from './pages/admin/OrgHierarchy';
import AuditLogs from './pages/admin/AuditLogs';
import Reports from './pages/admin/Reports';
import EscalationCenter from './pages/admin/EscalationCenter';
import Settings from './pages/admin/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/employee/dashboard" replace />,
      },
      // Employee routes
      {
        path: 'employee',
        children: [
          { path: 'dashboard', Component: EmployeeDashboard },
          { path: 'my-goals', Component: MyGoals },
          { path: 'submit-review', Component: GoalSubmitReview },
          { path: 'checkin', Component: QuarterlyCheckIn },
          { path: 'shared-goals', Component: SharedGoals },
          { path: 'notifications', Component: Notifications },
        ],
      },
      // Manager routes
      {
        path: 'manager',
        children: [
          { path: 'dashboard', Component: ManagerDashboard },
          { path: 'team-goals', Component: TeamGoals },
          { path: 'approvals', Component: Approvals },
          { path: 'checkin', Component: ManagerCheckIn },
          { path: 'analytics', Component: TeamAnalytics },
        ],
      },
      // Admin routes
      {
        path: 'admin',
        children: [
          { path: 'dashboard', Component: AdminDashboard },
          { path: 'cycles', Component: CycleManagement },
          { path: 'org-hierarchy', Component: OrgHierarchy },
          { path: 'audit-logs', Component: AuditLogs },
          { path: 'reports', Component: Reports },
          { path: 'escalations', Component: EscalationCenter },
          { path: 'settings', Component: Settings },
        ],
      },
    ],
  },
]);
