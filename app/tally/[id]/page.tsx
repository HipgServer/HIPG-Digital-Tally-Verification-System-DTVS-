'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Download,
  Share2,
  Printer,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  QrCode,
  ShieldCheck,
  Lock,
  Anchor,
  Car,
  Camera,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { generateTallyPdf } from '@/lib/pdf-generator';
import { VehicleTally } from '@/lib/types';

export default function TallyReportPage() {
  const params = useParams();
  const router = useRouter();
  const [tally, setTally] = useState<VehicleTally | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/tallies/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.tally) {
            setTally(data.tally);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const handleDownloadPdf = async () => {
    if (!tally) return;
    await generateTallyPdf(tally);
    // Audit log
    fetch('/api/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'current-user',
        userName: 'Authorized User',
        userRole: 'Port User',
        action: 'PDF_GENERATED',
        recordId: tally.id,
        referenceNo: tally.referenceNo,
        details: `Downloaded PDF Tally Report for ${tally.vehicleNo}`,
      }),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && tally) {
      const shareUrl = `${window.location.origin}/verify/${encodeURIComponent(tally.referenceNo)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <AppShell title="Tally Report" subtitle="Loading official vehicle record...">
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!tally) {
    return (
      <AppShell title="Tally Report" subtitle="Record Not Found">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Record Not Found</h3>
          <p className="text-xs text-slate-500">
            The requested vehicle tally reference number does not exist or has been archived.
          </p>
          <button
            onClick={() => router.push('/tally/records')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Back to Tally Records
          </button>
        </div>
      </AppShell>
    );
  }

  const isApproved = tally.status === 'Approved';

  return (
    <AppShell title="Tally Report" subtitle={`Official Vehicle Record: ${tally.referenceNo}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="no-print flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Records</span>
          </button>

          {/* Status Badge matching Mockup */}
          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Approved (Locked)</span>
              </span>
            ) : tally.status === 'Pending Approval' ? (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Approval</span>
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Rejected</span>
              </span>
            )}
          </div>
        </div>

        {/* Official HIPG Tally Certificate Card matching Mockup panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 space-y-8 relative overflow-hidden">
          {/* Subtle security background watermark */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
            <Anchor className="w-[450px] h-[450px] text-blue-900" />
          </div>

          {/* Letterhead Header matching Mockup */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#0B1F3A] flex items-center justify-center text-white font-black text-xl shadow-md">
                HIPG
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  HIPG
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Hambantota International Port Group
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm font-black text-[#155EEF]">DTVS</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs font-bold text-slate-900">Vehicle Tally Report</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Ref: {tally.referenceNo}
              </p>
            </div>
          </div>

          {/* Main Details & QR Code Grid matching Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left 8 Cols: Tabular Information Grid */}
            <div className="md:col-span-8 space-y-2 text-xs">
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Reference No.</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {tally.referenceNo}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Vessel</span>
                <span className="col-span-2 font-bold text-slate-900">: {tally.vesselName}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Voyage No.</span>
                <span className="col-span-2 font-medium text-slate-800">: {tally.voyageNo}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">DOC No.</span>
                <span className="col-span-2 font-medium text-slate-800">: {tally.docNo}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Vehicle No.</span>
                <span className="col-span-2 font-black text-blue-700 text-sm">: {tally.vehicleNo}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Chassis No.</span>
                <span className="col-span-2 font-mono font-bold text-slate-800">: {tally.chassisNo}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Cargo Type</span>
                <span className="col-span-2 font-medium text-slate-800">: {tally.cargoType}</span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Damage</span>
                <span className="col-span-2 font-medium">
                  {tally.damages && tally.damages.length > 0 ? (
                    <strong className="text-amber-700">
                      : Yes ({tally.damages[0].category} - {tally.damages[0].location})
                    </strong>
                  ) : (
                    <strong className="text-emerald-700">: None (Clean Bill of Discharge)</strong>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Tally Date & Time</span>
                <span className="col-span-2 text-slate-700">
                  : {new Date(tally.createdAt).toLocaleDateString()} {new Date(tally.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="grid grid-cols-3 py-1.5 border-b border-slate-100">
                <span className="font-bold text-slate-500">Recorded By</span>
                <span className="col-span-2 text-slate-700">
                  : {tally.createdBy.name} ({tally.createdBy.badgeNo})
                </span>
              </div>
              <div className="grid grid-cols-3 py-1.5">
                <span className="font-bold text-slate-500">Approved By</span>
                <span className="col-span-2 text-slate-700">
                  : {tally.approvalDetails?.supervisorName || 'Pending Certification'}
                </span>
              </div>
            </div>

            {/* Right 4 Cols: QR Code matching Mockup */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              {tally.qrCodeDataUrl ? (
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                  <img
                    src={tally.qrCodeDataUrl}
                    alt="Verification QR Code"
                    className="w-36 h-36 object-contain"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 bg-slate-200 rounded-xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 mt-3 tracking-wide">
                Scan to Verify
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                Hambantota Gate Terminal Control
              </span>
            </div>
          </div>

          {/* Photo Evidence Strip */}
          {tally.photos && tally.photos.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block mb-3">
                Evidence Photographs Recorded
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tally.photos.map((p) => (
                  <div key={p.id} className="rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 relative group">
                    <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[10px] text-white font-medium truncate">
                      {p.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Buttons matching Mockup */}
          <div className="no-print pt-6 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3 relative z-10">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={handleShare}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

