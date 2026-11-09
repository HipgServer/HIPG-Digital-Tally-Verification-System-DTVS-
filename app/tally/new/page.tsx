'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  ClipboardCheck,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Trash2,
  AlertTriangle,
  Save,
  Check,
  Ship,
  FileText,
  ShieldCheck,
  Plus,
  RefreshCw,
  Info,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { CarInspectionGraphic } from '@/components/tally/CarInspectionGraphic';
import { useAuth } from '@/components/auth/AuthContext';
import { useOfflineSync } from '@/components/sync/OfflineSyncContext';
import {
  DEFAULT_CHECKLIST_ITEMS,
  DAMAGE_CATEGORIES,
  CARGO_TYPES,
  PORT_LOCATIONS,
  SHIPPING_AGENTS,
  SAMPLE_VEHICLE_PHOTOS,
} from '@/lib/constants';
import { InspectionItem, DamageEntry, PhotoEvidenceItem, Vessel } from '@/lib/types';

export default function NewTallyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { saveTallyWithSync, isOnline } = useOfflineSync();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);

  // Vessel options
  const [vessels, setVessels] = useState<Vessel[]>([]);

  // Step 1: Vehicle Details
  const [vesselName, setVesselName] = useState('Grand Pioneer');
  const [vesselId, setVesselId] = useState('vessel-gp-015');
  const [voyageNo, setVoyageNo] = useState('GP-015');
  const [docNo, setDocNo] = useState('37538');
  const [vehicleNo, setVehicleNo] = useState('ABC-1234');
  const [chassisNo, setChassisNo] = useState('NNAAL5566577876543');
  const [tagNo, setTagNo] = useState('TAG-88915');
  const [cargoType, setCargoType] = useState<'Vehicle (CBU)' | 'Heavy Equipment' | 'High & Heavy' | 'Breakbulk' | 'Machinery'>('Vehicle (CBU)');
  const [agentName, setAgentName] = useState('MOL');
  const [yardLocation, setYardLocation] = useState('Berth 07 (RoRo)');
  const [brandModel, setBrandModel] = useState('Toyota Harrier (Pearl White)');
  const [driverName, setDriverName] = useState('K. Perera');

  // Step 2: Checklist
  const [checklist, setChecklist] = useState<InspectionItem[]>(
    DEFAULT_CHECKLIST_ITEMS.map((item) => ({ ...item, notes: '' }))
  );

  // Step 3: Damage Recording
  const [hasDamage, setHasDamage] = useState(false);
  const [damages, setDamages] = useState<DamageEntry[]>([]);
  const [currentDamageCategory, setCurrentDamageCategory] = useState<any>('Scratched');
  const [damageLocation, setDamageLocation] = useState('Front Bumper');
  const [damageSeverity, setDamageSeverity] = useState<'Minor' | 'Moderate' | 'Severe'>('Minor');
  const [damageRemarks, setDamageRemarks] = useState('');

  // Step 4: Photo Evidence (pre-populated with realistic initial previews matching mockup)
  const [photos, setPhotos] = useState<PhotoEvidenceItem[]>([
    {
      id: 'photo-front',
      type: 'front',
      label: 'Front View',
      dataUrl: SAMPLE_VEHICLE_PHOTOS.front,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'photo-rear',
      type: 'rear',
      label: 'Rear View',
      dataUrl: SAMPLE_VEHICLE_PHOTOS.rear,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'photo-chassis',
      type: 'chassis',
      label: 'Chassis No.',
      dataUrl: SAMPLE_VEHICLE_PHOTOS.chassis,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'photo-damage',
      type: 'damage',
      label: 'Damage (if Any)',
      dataUrl: SAMPLE_VEHICLE_PHOTOS.damage,
      uploadedAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    fetch('/api/vessels')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.vessels) {
          setVessels(data.vessels);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleVesselChange = (selectedName: string) => {
    setVesselName(selectedName);
    const found = vessels.find((v) => v.name === selectedName);
    if (found) {
      setVesselId(found.id);
      setVoyageNo(found.voyageNumber);
      setDocNo(found.docNumber);
      setAgentName(found.shippingAgent);
      setYardLocation(found.berthLocation);
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'OK' ? 'Missing' : item.status === 'Missing' ? 'Damaged' : 'OK';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const setChecklistItemStatus = (id: string, status: 'OK' | 'Missing' | 'Damaged' | 'NA') => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const addDamageEntry = () => {
    if (!damageRemarks.trim()) return;
    const newEntry: DamageEntry = {
      id: `dmg-${Date.now()}`,
      category: currentDamageCategory,
      location: damageLocation,
      severity: damageSeverity,
      remarks: damageRemarks,
    };
    setDamages([...damages, newEntry]);
    setHasDamage(true);
    setDamageRemarks('');
  };

  const removeDamageEntry = (id: string) => {
    const updated = damages.filter((d) => d.id !== id);
    setDamages(updated);
    if (updated.length === 0) setHasDamage(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string = 'additional', label: string = 'Extra Photo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotos((prev) => [
        ...prev,
        {
          id: `photo-${Date.now()}`,
          type: type as any,
          label,
          dataUrl: result,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setIsSubmitting(true);
    try {
      const tallyData = {
        vesselId,
        vesselName,
        voyageNo,
        docNo,
        vehicleNo,
        chassisNo,
        tagNo,
        agentName,
        yardLocation,
        brandModel,
        cargoType,
        driverName,
        checklist,
        hasDamage: damages.length > 0,
        damages,
        photos,
        createdBy: user
          ? {
            id: user.id,
            name: user.name,
            role: user.role,
            badgeNo: user.badgeNumber,
          }
          : {
            id: 'user-sec-01',
            name: 'Security01',
            role: 'Security Officer',
            badgeNo: 'HIPG-SEC-104',
          },
      };

      const result = await saveTallyWithSync(tallyData, isDraft);
      setSuccessReference(result.referenceNo);
    } catch (err) {
      console.error('Failed to submit tally', err);
      alert('Error submitting tally. Saved to offline queue safely.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper Header
  const steps = [
    { num: 1, title: 'Vehicle Details' },
    { num: 2, title: 'Checklist' },
    { num: 3, title: 'Photos' },
    { num: 4, title: 'Review' },
  ];

  if (successReference) {
    return (
      <AppShell title="Tally Submitted" subtitle="Record Successfully Recorded">
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg space-y-6 my-10">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Tally Record Submitted!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Vehicle <strong className="text-slate-800">{vehicleNo}</strong> ({chassisNo}) has been queued for supervisor verification.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1">
            <span className="text-xs font-semibold text-blue-600 uppercase">
              Unique Reference Number
            </span>
            <p className="text-2xl font-black text-slate-900 font-mono tracking-wider">
              {successReference}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => router.push(`/tally/records`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              View Tally Records
            </button>
            <button
              onClick={() => router.push(`/verify/${encodeURIComponent(successReference)}`)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              View QR Gate Verification
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="New Tally Record"
      subtitle="Vessel Discharge Vehicle Inspection"
    >
      <div className="space-y-6">
        {/* Stepper Navigation Bar matching Mockup */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : router.push('/dashboard'))}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900 hidden sm:block">
              New Tally Record
            </h2>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-2 sm:gap-6">
            {steps.map((s, idx) => {
              const isPassed = step > s.num;
              const isCurrent = step === s.num;

              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${isPassed
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : isCurrent
                          ? 'bg-[#155EEF] text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-100'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden md:inline ${isCurrent
                        ? 'text-blue-600 font-bold'
                        : isPassed
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                  >
                    {s.title}
                  </span>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-6 sm:w-10 h-0.5 hidden sm:block ${isPassed ? 'bg-emerald-400' : 'bg-slate-200'
                        }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: VEHICLE DETAILS */}
        {step === 1 && (
          <div className="relative bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs overflow-hidden">
            {/* Background vehicle silhouette watermark matching mockup */}
            <div className="absolute right-0 bottom-0 opacity-[0.04] pointer-events-none select-none">
              <svg width="450" height="260" viewBox="0 0 500 300" fill="currentColor">
                <path d="M50 200 C30 200 20 180 30 160 L80 120 C100 100 150 90 200 90 L340 90 C380 90 420 110 440 140 L480 170 C495 180 495 200 480 205 L470 205 C460 175 420 175 410 205 L150 205 C140 175 100 175 90 205 Z" />
              </svg>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Car className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Vehicle Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              {/* Vessel Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vessel *
                </label>
                <select
                  value={vesselName}
                  onChange={(e) => handleVesselChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                >
                  <option value="Grand Pioneer">Grand Pioneer (GP-015)</option>
                  <option value="Morning Sapphire">Morning Sapphire (MS-088)</option>
                  <option value="Asian Aurora">Asian Aurora (AA-102)</option>
                </select>
              </div>

              {/* Chassis Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Chassis No. *
                </label>
                <input
                  type="text"
                  value={chassisNo}
                  onChange={(e) => setChassisNo(e.target.value.toUpperCase())}
                  placeholder="e.g. NNAAL5566577876543"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                  required
                />
              </div>

              {/* Voyage Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Voyage No. *
                </label>
                <input
                  type="text"
                  value={voyageNo}
                  onChange={(e) => setVoyageNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Cargo Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cargo Type *
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {CARGO_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* DOC Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  DOC No. *
                </label>
                <input
                  type="text"
                  value={docNo}
                  onChange={(e) => setDocNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              {/* Shipping Agent */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Agent
                </label>
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {SHIPPING_AGENTS.map((agent) => (
                    <option key={agent} value={agent}>
                      {agent}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Vehicle No. *
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC-1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500 font-bold"
                  required
                />
              </div>

              {/* Yard Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Location
                </label>
                <select
                  value={yardLocation}
                  onChange={(e) => setYardLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {PORT_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand & Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Brand / Model
                </label>
                <input
                  type="text"
                  value={brandModel}
                  onChange={(e) => setBrandModel(e.target.value)}
                  placeholder="e.g. Toyota Harrier (Pearl White)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Assigned Driver / Operator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Driver / Terminal Operator
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. K. Perera"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Step 1 Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
              >
                <span>Next: Checklist</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INSPECTION CHECKLIST */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-6">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Inspection Checklist</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Visual Graphic */}
              <div className="lg:col-span-5">
                <CarInspectionGraphic checklist={checklist} />
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Inspection Instructions</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Tap any item below to cycle between <strong>OK [✓]</strong>, <strong>Missing [✗]</strong>, or <strong>Damaged [!]</strong>.
                  </p>
                </div>
              </div>

              {/* Right Column: Two Columns of Checklist Items matching mockup */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {checklist.map((item) => {
                    const isChecked = item.status === 'OK';
                    const isMissing = item.status === 'Missing';
                    const isDamaged = item.status === 'Damaged';

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-3 rounded-xl border cursor-pointer select-none transition-all flex items-center justify-between ${isChecked
                            ? 'bg-blue-50/50 border-blue-200 text-slate-900'
                            : isMissing
                              ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                              : isDamaged
                                ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <span className="text-xs font-semibold">{item.label}</span>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isChecked
                              ? 'bg-[#155EEF] text-white shadow-xs'
                              : isMissing
                                ? 'bg-rose-500 text-white shadow-xs'
                                : isDamaged
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'border border-slate-300 bg-white'
                            }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          {isMissing && <span className="text-[10px] font-bold">✕</span>}
                          {isDamaged && <span className="text-[10px] font-bold">!</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2 Actions */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
              >
                <span>Next: Damage & Photos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTO EVIDENCE & DAMAGE RECORDING */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Damage Entry Section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Vehicle Damage Identification
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Cargo Exceptions / Damage Identified?
                  </label>
                  <input
                    type="checkbox"
                    checked={hasDamage}
                    onChange={(e) => setHasDamage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              {hasDamage && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Damage Category
                      </label>
                      <select
                        value={currentDamageCategory}
                        onChange={(e) => setCurrentDamageCategory(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      >
                        {DAMAGE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Location on Vehicle
                      </label>
                      <input
                        type="text"
                        value={damageLocation}
                        onChange={(e) => setDamageLocation(e.target.value)}
                        placeholder="e.g. Front Right Bumper"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Severity
                      </label>
                      <select
                        value={damageSeverity}
                        onChange={(e) => setDamageSeverity(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      >
                        <option value="Minor">Minor</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Remarks
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={damageRemarks}
                          onChange={(e) => setDamageRemarks(e.target.value)}
                          placeholder="e.g. Scratch approx 10cm"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                        />
                        <button
                          type="button"
                          onClick={addDamageEntry}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex-shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Damages List */}
                  {damages.length > 0 && (
                    <div className="space-y-2">
                      {damages.map((dmg) => (
                        <div
                          key={dmg.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-amber-900">
                              [{dmg.category}]
                            </span>{' '}
                            <span className="font-semibold text-slate-800">
                              {dmg.location}
                            </span>{' '}
                            <span className="text-amber-700">({dmg.severity})</span> -{' '}
                            <span className="text-slate-600">{dmg.remarks}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDamageEntry(dmg.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photo Evidence Gallery matching Mockup */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-6">
                <Camera className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Photo Evidence</h3>
              </div>

              {/* Grid of Photo Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs"
                  >
                    <div className="aspect-[4/3] w-full bg-slate-800 relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2.5 bg-white text-center">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {photo.label}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Add More Photos Upload Card matching Mockup */}
                <label className="aspect-[4/3] rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/70 cursor-pointer flex flex-col items-center justify-center p-4 text-center transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-blue-900">Add More Photos</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Drag & drop or click to upload<br />JPG, PNG (Max 10 MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handleFileUpload(e, 'damage', 'Additional Photo')}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Step 3 Actions */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  <span>Next: Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {step === 4 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Review & Final Submission
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Ready for Supervisor Queue
              </span>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vessel Details
                </span>
                <p className="text-sm font-bold text-slate-900">{vesselName}</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Voyage: {voyageNo}</div>
                  <div>DOC: {docNo}</div>
                  <div>Agent: {agentName}</div>
                  <div>Location: {yardLocation}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Vehicle Identification
                </span>
                <p className="text-sm font-bold text-slate-900">{vehicleNo}</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>Chassis: {chassisNo}</div>
                  <div>Cargo: {cargoType}</div>
                  <div>Model: {brandModel}</div>
                  <div>Driver: {driverName}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inspection Summary
                </span>
                <div className="text-xs text-slate-700 space-y-1">
                  <div>
                    Checklist Items:{' '}
                    <strong>{checklist.filter((c) => c.status === 'OK').length} OK</strong> /{' '}
                    <strong className="text-rose-600">
                      {checklist.filter((c) => c.status !== 'OK').length} Exceptions
                    </strong>
                  </div>
                  <div>
                    Recorded Damages:{' '}
                    <strong className={damages.length > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                      {damages.length > 0 ? `${damages.length} Damage(s)` : 'None'}
                    </strong>
                  </div>
                  <div>
                    Photos Attached: <strong>{photos.length} Photographs</strong>
                  </div>
                  <div>
                    Recorded By: <strong>{user?.name || 'Security01'} ({user?.badgeNumber || 'HIPG-SEC-104'})</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo Strip Preview */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Attached Photo Previews</p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {photos.map((p) => (
                  <div key={p.id} className="w-20 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                    <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Offline Sync Banner if offline */}
            {!isOnline && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  You are currently operating <strong>Offline</strong>. This record will be safely cached in your tablet&apos;s IndexedDB and synchronized automatically once network connectivity is reestablished.
                </span>
              </div>
            )}

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Back to Photos
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(true)}
                  className="px-5 py-2.5 rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(false)}
                  className="px-7 py-2.5 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Final Tally</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

