'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { SEED_USERS } from '@/lib/constants';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isLoading: boolean;
  loginAs: (role: UserRole) => Promise<void>;
  loginWithCredentials: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  availableUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage or cookie on load
    const stored = localStorage.getItem('hipg_dtvs_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        setUser(SEED_USERS[0]);
      }
    } else {
      // Default to Security Officer for instant testing
      setUser(SEED_USERS[0]);
      localStorage.setItem('hipg_dtvs_user', JSON.stringify(SEED_USERS[0]));
    }
    setIsLoading(false);
  }, []);

  const loginAs = async (role: UserRole) => {
    const target = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    setUser(target);
    localStorage.setItem('hipg_dtvs_user', JSON.stringify(target));
    document.cookie = `hipg_user=${encodeURIComponent(JSON.stringify(target))}; path=/; max-age=604800`;

    // Call login API for audit logging
    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    } catch (e) {
      // offline safe
    }
  };

  const loginWithCredentials = async (username: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('hipg_dtvs_user', JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      // Fallback matching
      const target = SEED_USERS.find(
        (u) => u.username.toLowerCase() === username.toLowerCase().trim()
      );
      if (target) {
        setUser(target);
        localStorage.setItem('hipg_dtvs_user', JSON.stringify(target));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('hipg_dtvs_user');
    document.cookie = 'hipg_user=; path=/; max-age=0';
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'Security Officer',
        isLoading,
        loginAs,
        loginWithCredentials,
        logout,
        availableUsers: SEED_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

