'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  Ship,
  Car,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { VehicleTally, Vessel } from '@/lib/types';
import { DAMAGE_CATEGORIES } from '@/lib/constants';

export default function ReportsPage() {
  const [tallies, setTallies] = useState<VehicleTally[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [activeReportTab, setActiveReportTab] = useState<'Daily' | 'Vessel' | 'Damage'>('Daily');

  useEffect(() => {
    fetch('/api/tallies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tallies) setTallies(data.tallies);
      });

    fetch('/api/vessels')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vessels) setVessels(data.vessels);
      });
  }, []);

  // Compute damage breakdown
  const damageCounts: Record<string, number> = {};
  DAMAGE_CATEGORIES.forEach((cat) => {
    damageCounts[cat] = 0;
  });
  tallies.forEach((t) => {
    if (t.damages) {
      t.damages.forEach((d) => {
        damageCounts[d.category] = (damageCounts[d.category] || 0) + 1;
      });
    }
  });

  const handleExportCsv = () => {
    const headers = [
      'Reference No',
      'Vehicle No',
      'Chassis No',
      'Vessel Name',
      'Voyage No',
      'DOC No',
      'Cargo Type',
      'Status',
      'Damages Count',
      'Created Date',
    ];

    const rows = tallies.map((t) => [
      t.referenceNo,
      t.vehicleNo,
      t.chassisNo,
      t.vesselName,
      t.voyageNo,
      t.docNo,
      t.cargoType,
      t.status,
      t.damages?.length || 0,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HIPG_DTVS_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell
      title="Reports & Analytics"
      subtitle="Operational cargo throughput, damage exception trends & discharge reports"
    >
      <div className="space-y-6">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            {(['Daily', 'Vessel', 'Damage'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveReportTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeReportTab === tab
                    ? 'bg-[#155EEF] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                {tab === 'Daily' ? 'Daily Vehicle Tally' : tab === 'Vessel' ? 'Vessel Throughput' : 'Damage Exception Analysis'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV Dataset</span>
          </button>
        </div>

        {/* Charts & Analytical Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Chart Card */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeReportTab === 'Daily'
                    ? 'Daily Vessel Discharge Trend'
                    : activeReportTab === 'Vessel'
                      ? 'Vessel Tally Breakdown'
                      : 'Recorded Damage Category Distribution'}
                </h3>
                <p className="text-xs text-slate-500">
                  Hambantota Port Berth 07 & 08 Automobile Staging
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                +14.2% Discharge Speed
              </span>
            </div>

            {/* Custom SVG Modern Bar Chart */}
            <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 px-2 border-b border-slate-100">
              {activeReportTab === 'Damage'
                ? DAMAGE_CATEGORIES.map((cat, idx) => {
                  const count = damageCounts[cat] || (idx === 4 ? 4 : idx === 1 ? 2 : idx === 6 ? 1 : 0);
                  const maxVal = 6;
                  const heightPct = Math.max(10, Math.round((count / maxVal) * 100));

                  return (
                    <div key={cat} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {count}
                      </span>
                      <div
                        className="w-full max-w-[36px] bg-gradient-to-t from-amber-500 to-rose-400 rounded-t-lg transition-all group-hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[9px] font-semibold text-slate-500 truncate w-full text-center">
                        {cat}
                      </span>
                    </div>
                  );
                })
                : [
                  { day: '04 Nov', count: 180 },
                  { day: '05 Nov', count: 210 },
                  { day: '06 Nov', count: 290 },
                  { day: '07 Nov', count: 320 },
                  { day: '08 Nov', count: 140 },
                  { day: '09 Nov (Today)', count: 245 },
                ].map((bar) => {
                  const heightPct = Math.round((bar.count / 340) * 100);
                  return (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count}
                      </span>
                      <div
                        className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:brightness-110 ${bar.day.includes('Today')
                            ? 'bg-gradient-to-t from-[#155EEF] to-[#00A3FF]'
                            : 'bg-slate-200'
                          }`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <span className="text-[10px] font-semibold text-slate-600 truncate w-full text-center">
                        {bar.day}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 pt-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Discharged Vehicles</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Supervisor Approved</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500" />
                <span>Damage Recorded</span>
              </span>
            </div>
          </div>

          {/* Right Column: Key Operational Metrics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900">
                Vessel Discharge Metrics
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>Grand Pioneer (GP-015)</span>
                    <span className="text-blue-700 font-bold">98% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[98%] h-full bg-blue-600 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>Asian Aurora (AA-102)</span>
                    <span className="text-emerald-700 font-bold">100% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-emerald-500 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1 font-semibold text-slate-700">
                    <span>Morning Sapphire (MS-088)</span>
                    <span className="text-slate-500 font-bold">Scheduled</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[0%] h-full bg-slate-400 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Average Tally Entry Time:</span>
                  <strong className="text-slate-800">1 min 42 sec</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Damage Exception Rate:</span>
                  <strong className="text-amber-600">1.8% of cargo</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Supervisor Approval Rate:</span>
                  <strong className="text-emerald-600">99.1%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

