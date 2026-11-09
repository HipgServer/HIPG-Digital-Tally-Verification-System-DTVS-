'use client';

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Wifi,
  Sliders,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Save,
  Shield,
  Laptop,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useOfflineSync } from '@/components/sync/OfflineSyncContext';
import { DEFAULT_CHECKLIST_ITEMS, DAMAGE_CATEGORIES } from '@/lib/constants';

export default function SettingsPage() {
  const { deviceId, pendingCount, triggerSync } = useOfflineSync();
  const [syncInterval, setSyncInterval] = useState('10');
  const [portCode, setPortCode] = useState('LKHAM');
  const [terminalName, setTerminalName] = useState('Hambantota International Port Group');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <AppShell
      title="System Settings"
      subtitle="Terminal parameters, offline synchronization & port configuration"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved and updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Port Terminal Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Port Operations Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Port Authority Name
                </label>
                <input
                  type="text"
                  value={terminalName}
                  onChange={(e) => setTerminalName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UN/LOCODE Port Code
                </label>
                <input
                  type="text"
                  value={portCode}
                  onChange={(e) => setPortCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Device & Offline Synchronization Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Wifi className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Device & Offline Synchronization
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Registered Device Terminal ID
                </label>
                <input
                  type="text"
                  readOnly
                  value={deviceId}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 text-slate-600 cursor-not-allowed"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Unique hardware device identifier stamped on every vehicle tally submission.
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Auto-Sync Heartbeat (seconds)
                </label>
                <input
                  type="number"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Interval for checking pending offline queue and syncing with server.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Pending Offline Items in Queue: <strong>{pendingCount} item(s)</strong>
              </span>
              <button
                type="button"
                onClick={triggerSync}
                className="px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Force Sync Now</span>
              </button>
            </div>
          </div>

          {/* Inspection Checklist Configuration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Configured Inspection Checklist Items ({DEFAULT_CHECKLIST_ITEMS.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {DEFAULT_CHECKLIST_ITEMS.map((item) => (
                <span
                  key={item.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          {/* Damage Categories */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HardDrive className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                Authorized Damage Codes ({DAMAGE_CATEGORIES.length})
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {DAMAGE_CATEGORIES.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

