'use client';

import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Calendar,
  Wifi,
  WifiOff,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useOfflineSync } from '../sync/OfflineSyncContext';
import { UserRole } from '@/lib/types';

interface HeaderProps {
  onToggleSidebar: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onToggleSidebar, title = 'Dashboard', subtitle = 'Vehicle Tally & Verification Overview' }: HeaderProps) {
  const { user, role, loginAs } = useAuth();
  const { isOnline, syncState, pendingCount, triggerSync } = useOfflineSync();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const roles: UserRole[] = [
    'Administrator',
    'Security Officer',
    'Supervisor',
    'CSD',
    'Security Viewer',
    'Delivery Driver',
  ];

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md">
      {/* Left side: Hamburger toggle + Title & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Offline / Online Sync Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all bg-slate-50 border-slate-200">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-semibold">{syncState}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <WifiOff className="w-3.5 h-3.5" />
              <span className="font-semibold">Offline Mode</span>
            </span>
          )}

          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
              {pendingCount}
            </span>
          )}

          {isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              title="Synchronize offline tallies with server"
              className="ml-1 p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
        </div>

        {/* Date Display (from mockup: Today, 09 Nov 2026) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Today, 09 Nov 2026</span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="3 Pending Approvals"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Pill & Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2.5 p-1 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#155EEF] to-[#00A3FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.name?.slice(0, 1) || 'O'}
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-900">{user?.name || 'Operations User'}</div>
              <div className="text-[10px] font-medium text-blue-600">{user?.role || 'Security Officer'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (Demo)
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Test DTVS with different operational permissions:
                </p>
              </div>
              <div className="py-1">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      loginAs(r);
                      setShowRoleSwitcher(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${role === r
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      {r}
                    </span>
                    {role === r && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400">
                  Badge: {user?.badgeNumber || 'HIPG-SEC-104'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

