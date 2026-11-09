'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Car,
  Anchor,
  FileText,
  Printer,
  ArrowLeft,
  Lock,
  Download,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { generateTallyPdf } from '@/lib/pdf-generator';
import { VehicleTally } from '@/lib/types';

export default function GateVerificationResultPage() {
  const params = useParams();
  const router = useRouter();
  const [tally, setTally] = useState<VehicleTally | null>(null);
  const [loading, setLoading] = useState(true);
  const refParam = params?.ref as string;

  useEffect(() => {
    if (refParam) {
      fetch(`/api/tallies/${encodeURIComponent(refParam)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.tally) {
            setTally(data.tally);

            // Log QR verification audit event
            fetch('/api/audit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: 'gate-scanner',
                userName: 'Gate Security Officer',
                userRole: 'Security Viewer',
                action: 'QR_VERIFIED',
                recordId: data.tally.id,
                referenceNo: data.tally.referenceNo,
                details: `Scanned & verified vehicle ${data.tally.vehicleNo} at Terminal Gate`,
                deviceId: 'HIPG-GATE-TERM-03',
              }),
            });
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [refParam]);

  if (loading) {
    return (
      <AppShell title="Verifying Record" subtitle="Checking port security database...">
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Validating electronic tally certification...
          </p>
        </div>
      </AppShell>
    );
  }

  if (!tally) {
    return (
      <AppShell title="Verification Failed" subtitle="Invalid QR Code or Reference">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-rose-200 text-center shadow-lg space-y-4 my-10">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <XCircle className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Invalid Vehicle Record</h3>
            <p className="text-xs text-slate-500 mt-1">
              Reference &quot;{refParam}&quot; could not be verified in the Hambantota Port DTVS database.
            </p>
          </div>
          <button
            onClick={() => router.push('/verify')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Scan Another QR Code
          </button>
        </div>
      </AppShell>
    );
  }

  const isApproved = tally.status === 'Approved';

  return (
    <AppShell
      title="Gate Clearance Verification"
      subtitle={`Security Gate Scan Result: ${tally.vehicleNo}`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => router.push('/verify')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>

        {/* Big Decision Hero Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-4 ${isApproved
              ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800'
              : 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800'
            }`}
        >
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto">
            {isApproved ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : (
              <Clock className="w-12 h-12 text-white" />
            )}
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-white/80 block">
              Gate Clearance Decision
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              {isApproved
                ? 'CLEARED FOR GATE OUT'
                : 'HOLD - AWAITING SUPERVISOR APPROVAL'}
            </h2>
            <p className="text-xs text-white/90 mt-1">
              {isApproved
                ? 'Certified electronic tally verified. Driver authorized for exit.'
                : 'This vehicle cannot exit until terminal supervisor certifies physical inspection.'}
            </p>
          </div>
        </div>

        {/* Certified Vehicle Data Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Vehicle Number
                </span>
                <p className="text-lg font-black text-slate-900 leading-none">
                  {tally.vehicleNo}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Reference
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">
                {tally.referenceNo}
              </p>
            </div>
          </div>

          {/* Key Field Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Vessel Name</span>
              <strong className="text-slate-800 font-bold">{tally.vesselName}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Voyage & DOC</span>
              <strong className="text-slate-800 font-bold">
                {tally.voyageNo} • DOC: {tally.docNo}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Chassis Number</span>
              <strong className="text-slate-800 font-mono font-bold">
                {tally.chassisNo}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Cargo Classification</span>
              <strong className="text-slate-800 font-bold">{tally.cargoType}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Recorded Damage</span>
              <strong
                className={`font-bold ${tally.damages && tally.damages.length > 0
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                  }`}
              >
                {tally.damages && tally.damages.length > 0
                  ? `Yes (${tally.damages[0].category})`
                  : 'Clean / None'}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 font-medium block">Verification Timestamp</span>
              <strong className="text-slate-800 font-bold">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </strong>
            </div>
          </div>

          {/* Supervisor Certification Details */}
          {isApproved && tally.approvalDetails && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>Certified & Locked by: {tally.approvalDetails.supervisorName}</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Supervisor Remarks: {tally.approvalDetails.comments || 'Approved for release'}
              </p>
            </div>
          )}

          {/* Action Links */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Link
              href={`/tally/${tally.id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>View Full Inspection Certificate</span>
            </Link>

            <button
              onClick={() => generateTallyPdf(tally)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
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

