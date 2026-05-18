import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => void;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  employee: {
    id: 'emp-001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@company.com',
    role: 'employee',
    managerId: 'mgr-001',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    title: 'Senior Software Engineer',
  },
  manager: {
    id: 'mgr-001',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@company.com',
    role: 'manager',
    departmentId: 'dept-eng',
    departmentName: 'Engineering',
    title: 'Engineering Manager',
  },
  admin: {
    id: 'admin-001',
    name: 'Vivaan Patel',
    email: 'vivaan.patel@company.com',
    role: 'admin',
    title: 'People Operations Admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string) => {
    // Demo login - in production, this would call an API
    const foundUser = Object.values(DEMO_USERS).find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    }
  };

  const loginAsRole = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (role: UserRole) => {
    setUser(DEMO_USERS[role]);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsRole, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
