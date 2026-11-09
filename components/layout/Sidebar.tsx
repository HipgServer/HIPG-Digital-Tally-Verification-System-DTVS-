'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Car,
  FileSpreadsheet,
  CheckCircle2,
  BarChart3,
  Ship,
  Users,
  Settings,
  QrCode,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Anchor,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Tally', href: '/tally/new', icon: Car },
    { name: 'Tally Records', href: '/tally/records', icon: FileSpreadsheet },
    {
      name: 'Approvals',
      href: '/approvals',
      icon: CheckCircle2,
      badge: '3',
      badgeColor: 'bg-rose-500',
    },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Vessels', href: '/vessels', icon: Ship },
    { name: 'QR Gate Verify', href: '/verify', icon: QrCode },
    { name: 'Audit Trail', href: '/audit', icon: ShieldAlert },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      adminOnly: true,
    },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const visibleNav = navigation.filter((item) => {
    if (item.adminOnly && role !== 'Administrator') return false;
    return true;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#08162A] text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-[#162744] shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#162744]">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#155EEF] to-[#00A3FF] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className="text-white text-lg tracking-wider font-black">HIPG</span>
              <span className="text-slate-500 font-normal">|</span>
              <span className="text-[#00A3FF] text-lg font-bold tracking-wide">DTVS</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            Operations Menu
          </div>
          {visibleNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? 'bg-[#155EEF] text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-[#0F284B] hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[11px] font-bold rounded-full text-white ${item.badgeColor || 'bg-rose-500'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Current Port Terminal Info */}
        <div className="px-4 py-3 mx-3 my-2 rounded-lg bg-[#0B1F3A]/70 border border-[#163866]/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Terminal</span>
            <span className="font-semibold text-emerald-400">Berth 07 (RoRo)</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Port</span>
            <span className="text-white font-medium">Hambantota (LKHAM)</span>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#162744] bg-[#061120]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-[#0B1F3A]">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                {user?.name?.slice(0, 2).toUpperCase() || 'OP'}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operations User'}</p>
                <p className="text-[10px] text-blue-300 truncate">{user?.role || 'Security Officer'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

