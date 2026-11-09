'use client';

import React, { useState, useEffect } from 'react';
import {
  Ship,
  Plus,
  Anchor,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Edit2,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Vessel, VesselStatus } from '@/lib/types';
import { SHIPPING_AGENTS, PORT_LOCATIONS } from '@/lib/constants';

export default function VesselsPage() {
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [voyageNumber, setVoyageNumber] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [shippingAgent, setShippingAgent] = useState('MOL');
  const [berthLocation, setBerthLocation] = useState('Berth 07 (RoRo)');
  const [status, setStatus] = useState<VesselStatus>('Scheduled');
  const [totalManifested, setTotalManifested] = useState(300);

  const fetchVessels = () => {
    setLoading(true);
    fetch('/api/vessels')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vessels) {
          setVessels(data.vessels);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          imoNumber,
          voyageNumber,
          docNumber,
          shippingAgent,
          berthLocation,
          status,
          totalManifestedVehicles: totalManifested,
          arrivalDate: new Date().toISOString(),
          operationStartDate: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        fetchVessels();
        // Reset form
        setName('');
        setImoNumber('');
        setVoyageNumber('');
        setDocNumber('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredVessels = vessels.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.voyageNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.docNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell
      title="Vessel Management"
      subtitle="RoRo auto carrier schedules, voyage numbers & discharge operations"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vessel name, voyage or DOC..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Vessel</span>
          </button>
        </div>

        {/* Vessels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVessels.map((vessel) => {
            const percent = vessel.totalManifestedVehicles
              ? Math.min(100, Math.round((vessel.dischargedCount / vessel.totalManifestedVehicles) * 100))
              : 0;

            return (
              <div
                key={vessel.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {vessel.name}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        IMO: {vessel.imoNumber} • Agent: {vessel.shippingAgent}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${vessel.status === 'In Progress'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : vessel.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                  >
                    {vessel.status}
                  </span>
                </div>

                {/* Voyage & Location */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">VOYAGE NO</span>
                    <strong className="text-slate-800">{vessel.voyageNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold">DOC NUMBER</span>
                    <strong className="text-slate-800 font-mono">{vessel.docNumber}</strong>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Berth: <strong>{vessel.berthLocation}</strong></span>
                    <span className="text-slate-500 text-[11px]">
                      Arrived: {new Date(vessel.arrivalDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Discharge Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600">Discharge Progress</span>
                    <span className="text-blue-700 font-bold">
                      {vessel.dischargedCount} / {vessel.totalManifestedVehicles} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-[#00A3FF] rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-600 font-bold">
                      {vessel.approvedCount} Approved
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-600 font-bold">
                      {vessel.pendingCount} Pending
                    </span>
                  </div>

                  <a
                    href={`/tally/records?vesselId=${vessel.id}`}
                    className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                  >
                    View Tallies →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Schedule New Vessel */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  Schedule New RoRo Vessel
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveVessel} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Vessel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hoegh Autoliner Target"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      IMO Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={imoNumber}
                      onChange={(e) => setImoNumber(e.target.value)}
                      placeholder="e.g. 9845112"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Voyage Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={voyageNumber}
                      onChange={(e) => setVoyageNumber(e.target.value)}
                      placeholder="e.g. HT-022"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      DOC Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      placeholder="e.g. 37549"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Manifest Vehicles Count *
                    </label>
                    <input
                      type="number"
                      required
                      value={totalManifested}
                      onChange={(e) => setTotalManifested(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Shipping Agent
                    </label>
                    <select
                      value={shippingAgent}
                      onChange={(e) => setShippingAgent(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                    >
                      {SHIPPING_AGENTS.map((agent) => (
                        <option key={agent} value={agent}>
                          {agent}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Berth Location
                    </label>
                    <select
                      value={berthLocation}
                      onChange={(e) => setBerthLocation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                    >
                      {PORT_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Arrived">Arrived</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                  >
                    Add Vessel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

