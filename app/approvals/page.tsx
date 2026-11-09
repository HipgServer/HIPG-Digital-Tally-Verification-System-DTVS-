'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  X,
  Clock,
  Eye,
  FileText,
  Lock,
  MessageSquare,
  Ship,
  Camera,
  Search,
  Car,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/components/auth/AuthContext';
import { VehicleTally } from '@/lib/types';

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [tallies, setTallies] = useState<VehicleTally[]>([]);
  const [activeTab, setActiveTab] = useState<'Pending Approval' | 'Approved' | 'Rejected'>('Pending Approval');
  const [selectedTally, setSelectedTally] = useState<VehicleTally | null>(null);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject' | 'changes' | null;
    tally: VehicleTally | null;
  }>({ type: null, tally: null });
  const [feedbackNote, setFeedbackNote] = useState('');

  const fetchTallies = () => {
    fetch('/api/tallies')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tallies) {
          setTallies(data.tallies);
          if (!selectedTally && data.tallies.length > 0) {
            setSelectedTally(data.tallies[0]);
          }
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchTallies();
  }, []);

  const filteredTallies = tallies.filter((t) => {
    const matchesTab = t.status === activeTab;
    const matchesSearch =
      !search ||
      t.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      t.chassisNo.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (tally: VehicleTally) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tallies/${tally.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisor: user,
          comments: feedbackNote || 'Approved and certified by Supervisor',
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Trigger celebratory confetti micro-interaction
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#12B76A', '#155EEF', '#00A3FF'],
        });
        setActionModal({ type: null, tally: null });
        setFeedbackNote('');
        fetchTallies();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (tally: VehicleTally) => {
    if (!feedbackNote.trim()) {
      alert('Please specify the reason for rejection.');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tallies/${tally.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisor: user,
          reason: feedbackNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionModal({ type: null, tally: null });
        setFeedbackNote('');
        fetchTallies();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async (tally: VehicleTally) => {
    if (!feedbackNote.trim()) {
      alert('Please provide instructions for the requested changes.');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tallies/${tally.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisor: user,
          comments: feedbackNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionModal({ type: null, tally: null });
        setFeedbackNote('');
        fetchTallies();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppShell
      title="Supervisor Approval"
      subtitle="Review the tally record and approve"
    >
      <div className="space-y-6">
        {/* Banner matching Mockup */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0B1F3A] via-[#155EEF] to-[#00A3FF] p-6 text-white shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-13 h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Supervisor Approval
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                Review physical discharge tallies, damage evidence photos, and authorize record locking.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-blue-200" />
            <span>Digital Tamper-Lock Active</span>
          </div>
        </div>

        {/* Status Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto">
            {(['Pending Approval', 'Approved', 'Rejected'] as const).map((tab) => {
              const count = tallies.filter((t) => t.status === tab).length;
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#155EEF] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab === 'Pending Approval'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle or chassis..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* Tallies List or Empty State */}
        {filteredTallies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No records in &quot;{activeTab}&quot;
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All vehicles matching this filter have been processed. Switch tabs above to inspect other records.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredTallies.map((tally) => (
              <div
                key={tally.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Vehicle Info & Details matching mockup */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold uppercase">Vehicle No.</span>
                            <span className="text-lg font-black text-slate-900 tracking-tight">
                              {tally.vehicleNo}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            Ref: {tally.referenceNo}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          tally.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : tally.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}
                      >
                        {tally.status}
                      </span>
                    </div>

                    {/* Metadata Grid matching Mockup */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Vessel:</span>
                        <strong className="text-slate-800">{tally.vesselName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Voyage No.:</span>
                        <strong className="text-slate-800">{tally.voyageNo}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">DOC No.:</span>
                        <strong className="text-slate-800">{tally.docNo}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block font-medium">Chassis No.:</span>
                        <strong className="text-slate-800 font-mono tracking-tight">
                          {tally.chassisNo}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Cargo Type:</span>
                        <strong className="text-slate-800">{tally.cargoType}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Damage:</span>
                        {tally.damages && tally.damages.length > 0 ? (
                          <span className="text-rose-600 font-bold">
                            Yes ({tally.damages[0].category} - {tally.damages[0].location})
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold">None</span>
                        )}
                      </div>
                    </div>

                    {/* Photo Thumbnails Strip matching Mockup */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Inspection Evidence Photos ({tally.photos.length})
                      </span>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1">
                        {tally.photos.map((photo) => (
                          <div
                            key={photo.id}
                            className="w-20 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0 group relative shadow-2xs"
                          >
                            <img
                              src={photo.dataUrl}
                              alt={photo.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[9px] text-white font-bold px-1 text-center truncate">
                                {photo.label}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action Buttons matching Mockup */}
                  <div className="lg:col-span-4 flex flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
                    {tally.status === 'Pending Approval' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setActionModal({ type: 'approve', tally })}
                          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve & Lock</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActionModal({ type: 'reject', tally })}
                          className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                        >
                          <X className="w-4 h-4 stroke-[3]" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActionModal({ type: 'changes', tally })}
                          className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-500" />
                          <span>Request Changes</span>
                        </button>
                      </>
                    ) : tally.status === 'Approved' ? (
                      <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-center space-y-1">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Record Locked</span>
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Approved by {tally.approvalDetails?.supervisorName || 'Supervisor'} on{' '}
                          {new Date(tally.approvalDetails?.approvedAt || tally.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-1">
                        <span className="text-xs font-bold text-rose-800">
                          Rejection Recorded
                        </span>
                        <p className="text-[11px] text-rose-700">
                          {tally.rejectionDetails?.reason || 'Damage exception discrepancy'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Approve / Reject / Request Changes */}
        {actionModal.type && actionModal.tally && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-slate-900">
                  {actionModal.type === 'approve'
                    ? 'Confirm Approval & Lock'
                    : actionModal.type === 'reject'
                    ? 'Reject Tally Record'
                    : 'Request Changes from Security Officer'}
                </h3>
                <button
                  onClick={() => setActionModal({ type: null, tally: null })}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-1">
                  Target Vehicle: <strong>{actionModal.tally.vehicleNo}</strong> (Chassis: {actionModal.tally.chassisNo})
                </p>
                {actionModal.type === 'approve' && (
                  <p className="text-xs text-slate-500">
                    Once approved, this tally will be officially certified, assigned a verified QR code, and locked against any further modifications.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {actionModal.type === 'approve'
                    ? 'Supervisor Verification Remarks (Optional)'
                    : actionModal.type === 'reject'
                    ? 'Reason for Rejection *'
                    : 'Notes / Required Changes *'}
                </label>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder={
                    actionModal.type === 'approve'
                      ? 'e.g. Certified physical condition matches vessel discharge manifest.'
                      : actionModal.type === 'reject'
                      ? 'Specify why this vehicle record cannot be approved...'
                      : 'Specify required photo angle or missing checklist item...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ type: null, tally: null })}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>

                {actionModal.type === 'approve' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(actionModal.tally!)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                  >
                    Confirm & Lock
                  </button>
                )}

                {actionModal.type === 'reject' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleReject(actionModal.tally!)}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                  >
                    Reject Record
                  </button>
                )}

                {actionModal.type === 'changes' && (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleRequestChanges(actionModal.tally!)}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20"
                  >
                    Submit Correction Request
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
