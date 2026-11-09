'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  Ship,
  Camera,
  User,
  ArrowRight,
  Plus,
  QrCode,
  ShieldAlert,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/components/auth/AuthContext';
import { DashboardStats } from '@/lib/types';

export default function DashboardPage() {
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error('Error fetching dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      title="Dashboard"
      subtitle="Vehicle Tally & Verification Overview"
    >
      <div className="space-y-6">
        {/* KPI Cards Row (Matching Mockup: 245 Total, 240 Approved, 3 Pending, 2 Rejected) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Vehicles Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Vehicles
              </span>
              <p className="text-3xl font-black text-slate-900">
                {stats?.totalVehicles ?? 245}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-medium text-blue-600">
                <TrendingUp className="w-3 h-3" />
                <span>Discharged from GP-015</span>
              </div>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center p-3 border border-blue-100/80 shadow-xs">
              <Car className="w-7 h-7" />
            </div>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved
              </span>
              <p className="text-3xl font-black text-emerald-600">
                {stats?.approvedCount ?? 240}
              </p>
              <span className="text-[11px] font-medium text-emerald-600">
                98% verified & locked
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center p-3 border border-emerald-100/80 shadow-xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>

          {/* Pending Card */}
          <Link
            href="/approvals"
            className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Pending
              </span>
              <p className="text-3xl font-black text-amber-600">
                {stats?.pendingCount ?? 3}
              </p>
              <span className="text-[11px] font-medium text-amber-600 group-hover:underline">
                Awaiting supervisor review →
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center p-3 border border-amber-100 shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-7 h-7" />
            </div>
          </Link>

          {/* Rejected Card */}
          <Link
            href="/approvals"
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Rejected
              </span>
              <p className="text-3xl font-black text-rose-600">
                {stats?.rejectedCount ?? 2}
              </p>
              <span className="text-[11px] font-medium text-rose-500">
                Requires correction / reinspection
              </span>
            </div>
            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center p-3 border border-rose-100/80 shadow-xs">
              <XCircle className="w-7 h-7" />
            </div>
          </Link>
        </div>

        {/* Middle Two-Column Grid: Today's Operation & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Today's Operation (Grand Pioneer) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Ship className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Today&apos;s Operation
                  </h2>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Progress
                </span>
              </div>

              {/* Vessel Details Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden flex-shrink-0 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=400&q=80"
                    alt="Grand Pioneer RoRo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                    Berth 07
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {stats?.todayOperation.vesselName || 'Grand Pioneer'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-0.5">
                      <span>
                        Voyage: <strong className="text-slate-800">{stats?.todayOperation.voyageNo || 'GP-015'}</strong>
                      </span>
                      <span>
                        DOC No: <strong className="text-slate-800">{stats?.todayOperation.docNo || '37538'}</strong>
                      </span>
                      <span>
                        Agent: <strong className="text-slate-800">MOL</strong>
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar (240 / 245 - 98%) */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Vehicle Tally</span>
                      <span className="text-blue-700 font-bold">
                        {stats?.todayOperation.dischargedCount ?? 240} / {stats?.todayOperation.totalManifested ?? 245} ({stats?.todayOperation.percentComplete ?? 98}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-[#00A3FF] rounded-full transition-all duration-500"
                        style={{ width: `${stats?.todayOperation.percentComplete ?? 98}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/tally/new"
                  className="px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Tally Entry</span>
                </Link>
                <Link
                  href="/tally/records"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>View All Tally Records</span>
                </Link>
                <Link
                  href="/vessels"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Ship className="w-4 h-4" />
                  <span>Vessel Schedule</span>
                </Link>
              </div>
            </div>

            {/* Quick Gate & Verification Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/verify"
                className="p-5 rounded-2xl bg-gradient-to-br from-[#08162A] to-[#0B1F3A] text-white border border-slate-800 shadow-md hover:shadow-xl transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-[#00A3FF] border border-blue-400/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#00A3FF] transition-colors">
                    Gate QR Verification
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Scan vehicle QR code at Port Gate 03 to verify supervisor clearance.
                  </p>
                </div>
              </Link>

              <Link
                href="/approvals"
                className="p-5 rounded-2xl bg-gradient-to-br from-[#155EEF] to-[#0B1F3A] text-white border border-blue-800 shadow-md hover:shadow-xl transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 text-white border border-white/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white transition-colors">
                    Supervisor Approval Desk
                  </h4>
                  <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                    3 vehicles awaiting inspection check and final digital sign-off.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Recent Activities (Matching Mockup) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight">
                    Recent Activities
                  </h2>
                  <Link
                    href="/audit"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Activity List matching mockup exactly */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Vehicle ABC-1234 approved
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Grand Pioneer • DOC: 37538
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      2 min ago
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Photo evidence uploaded
                      </p>
                      <p className="text-[11px] text-slate-500">
                        4 photos attached to ABC-1234
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      5 min ago
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Tally record created by Security01
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Vehicle CAB-9921 (Toyota Harrier)
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      8 min ago
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 border border-rose-100">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        Vehicle CBA-5510 rejected
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Missing quarter panel damage photo
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      1 hour ago
                    </span>
                  </div>
                </div>
              </div>

              {/* Terminal Device Status */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  Terminal ID: <strong className="text-slate-800">HIPG-TAB-RO-04</strong>
                </span>
                <span className="text-emerald-600 font-semibold">Ready for Entry</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

