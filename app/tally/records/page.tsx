'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Car,
  CheckCircle2,
  Clock,
  XCircle,
  FileDown,
  RefreshCw,
  QrCode,
  Ship,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { generateTallyPdf } from '@/lib/pdf-generator';
import { VehicleTally } from '@/lib/types';

export default function TallyRecordsPage() {
  const [tallies, setTallies] = useState<VehicleTally[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vesselFilter, setVesselFilter] = useState('All');

  const fetchTallies = () => {
    setLoading(true);
    fetch('/api/tallies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tallies) {
          setTallies(data.tallies);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTallies();
  }, []);

  const filteredTallies = tallies.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesVessel = vesselFilter === 'All' || t.vesselName === vesselFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      t.vehicleNo.toLowerCase().includes(q) ||
      t.chassisNo.toLowerCase().includes(q) ||
      t.referenceNo.toLowerCase().includes(q) ||
      t.docNo.toLowerCase().includes(q) ||
      t.vesselName.toLowerCase().includes(q);
    return matchesStatus && matchesVessel && matchesSearch;
  });

  const uniqueVessels = Array.from(new Set(tallies.map((t) => t.vesselName)));

  return (
    <AppShell
      title="Tally Records"
      subtitle="Searchable discharge registry & certified inspection sheets"
    >
      <div className="space-y-6">
        {/* Top Control Bar: Search & Filters */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Vehicle No, Chassis, DOC, Ref..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Vessel Filter & Status Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Approval">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Vessel:</span>
                <select
                  value={vesselFilter}
                  onChange={(e) => setVesselFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700"
                >
                  <option value="All">All Vessels</option>
                  {uniqueVessels.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <Link
                href="/tally/new"
                className="px-4 py-2 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Entry</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Reference No</th>
                  <th className="py-3.5 px-4">Vehicle No</th>
                  <th className="py-3.5 px-4">Chassis No</th>
                  <th className="py-3.5 px-4">Vessel / DOC</th>
                  <th className="py-3.5 px-4">Cargo Type</th>
                  <th className="py-3.5 px-4">Damage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                      <span>Loading port records...</span>
                    </td>
                  </tr>
                ) : filteredTallies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No vehicle tally records found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredTallies.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <Link
                          href={`/tally/${t.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5"
                        >
                          <span>{t.referenceNo}</span>
                        </Link>
                      </td>
                      <td className="py-4 px-4 font-black text-slate-800 whitespace-nowrap">
                        {t.vehicleNo}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {t.chassisNo}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{t.vesselName}</div>
                        <div className="text-[11px] text-slate-500">
                          Voyage {t.voyageNo} • DOC: {t.docNo}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {t.cargoType}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {t.damages && t.damages.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {t.damages[0].category} ({t.damages.length})
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold text-[11px]">
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${t.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {t.status === 'Approved' && <CheckCircle2 className="w-3 h-3" />}
                          {t.status === 'Pending Approval' && <Clock className="w-3 h-3" />}
                          {t.status === 'Rejected' && <XCircle className="w-3 h-3" />}
                          <span>{t.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/tally/${t.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="View Official Report"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/verify/${encodeURIComponent(t.referenceNo)}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Gate QR Verification"
                          >
                            <QrCode className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => generateTallyPdf(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{filteredTallies.length}</strong> of{' '}
              <strong>{tallies.length}</strong> vehicles recorded
            </span>
            <span>Hambantota International Port Group • Operations Center</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

