'use client';

import React, { useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  Plus,
  Search,
  CheckCircle,
  Key,
  Smartphone,
  Building,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/components/auth/AuthContext';
import { SEED_USERS } from '@/lib/constants';
import { User, UserRole } from '@/lib/types';

export default function UsersManagementPage() {
  const { user: currentUser, role: currentRole, loginAs } = useAuth();
  const [usersList, setUsersList] = useState<User[]>(SEED_USERS);
  const [search, setSearch] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');

  const filteredUsers = usersList.filter((u) => {
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.badgeNumber.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  return (
    <AppShell
      title="User Management"
      subtitle="Role-Based Access Control (RBAC) & Terminal Badge Registry"
    >
      <div className="space-y-6">
        {/* Banner with Role Switcher info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Session: {currentUser?.name} ({currentUser?.role})
              </h3>
              <p className="text-xs text-slate-500">
                You can switch between any of the 6 port operator personas below to test DTVS permissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, badge, role..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* User Persona Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((u) => {
            const isCurrentUser = currentUser?.id === u.id || currentUser?.role === u.role;

            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${isCurrentUser
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-slate-200/80 hover:shadow-md'
                  }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#155EEF] to-[#00A3FF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {u.name}
                        </h4>
                        <p className="text-xs text-blue-600 font-semibold">{u.role}</p>
                      </div>
                    </div>

                    {isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        Active Now
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-2 text-xs pt-1 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Username: <strong className="text-slate-800 font-mono">{u.username}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Badge No: <strong className="text-slate-800 font-mono">{u.badgeNumber}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{u.department}</span>
                    </div>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 text-slate-500">
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">
                      Operational Capabilities:
                    </span>
                    {u.role === 'Administrator' && (
                      <p>✓ All modules, system config, user roles, full audit log access.</p>
                    )}
                    {u.role === 'Security Officer' && (
                      <p>✓ Create tallies, checklists, damage entries, photo uploads, save drafts.</p>
                    )}
                    {u.role === 'Supervisor' && (
                      <p>✓ Review submitted tallies, approve & lock records, reject with reasons.</p>
                    )}
                    {u.role === 'CSD' && (
                      <p>✓ Search, verify vehicle status, view tally details, customer reports.</p>
                    )}
                    {u.role === 'Security Viewer' && (
                      <p>✓ Scan QR codes at Gate 03, verify clearance status, read-only access.</p>
                    )}
                    {u.role === 'Delivery Driver' && (
                      <p>✓ View driver vehicle manifests, tag numbers, and clearance certificates.</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => loginAs(u.role)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${isCurrentUser
                        ? 'bg-slate-100 text-slate-700 cursor-default'
                        : 'bg-[#155EEF] hover:bg-[#004dc7] text-white shadow-xs'
                      }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isCurrentUser ? 'Currently Logged In' : `Switch Role to ${u.role}`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

