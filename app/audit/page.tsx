'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  QrCode,
  Download,
  RefreshCw,
  Clock,
  Laptop,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { AuditLogEntry } from '@/lib/types';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    fetch('/api/audit')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.logs) setLogs(data.logs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.details.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      (log.referenceNo && log.referenceNo.toLowerCase().includes(q));
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'TALLY_APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TALLY_REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'TALLY_SUBMITTED':
      case 'TALLY_CREATED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'QR_VERIFIED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'OFFLINE_SYNC_COMPLETED':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AppShell
      title="Audit Trail"
      subtitle="Immutable cryptographic log of all port discharge transactions & approvals"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, officer name or detail..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
            >
              <option value="All">All Operations</option>
              <option value="TALLY_APPROVED">Tally Approved</option>
              <option value="TALLY_SUBMITTED">Tally Submitted</option>
              <option value="TALLY_REJECTED">Tally Rejected</option>
              <option value="QR_VERIFIED">QR Gate Verified</option>
              <option value="OFFLINE_SYNC_COMPLETED">Offline Synchronized</option>
              <option value="USER_LOGIN">User Login</option>
            </select>
          </div>
        </div>

        {/* Audit Log Timeline Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Reference No</th>
                  <th className="py-3.5 px-4">Event Details</th>
                  <th className="py-3.5 px-4 text-right">Device ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading audit logs...</span>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No audit log records match the search filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{log.userName}</div>
                        <div className="text-[10px] text-slate-400">{log.userRole}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {log.referenceNo || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium max-w-md">
                        {log.details}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.deviceId || 'HIPG-SYS-01'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

