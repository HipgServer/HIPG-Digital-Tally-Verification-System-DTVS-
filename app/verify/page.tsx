'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import jsQR from 'jsqr';
import {
  QrCode,
  Search,
  Camera,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Video,
  VideoOff,
  Upload,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';

export default function GateVerifySearchPage() {
  const router = useRouter();
  const [referenceNo, setReferenceNo] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNo.trim()) return;
    router.push(`/verify/${encodeURIComponent(referenceNo.trim())}`);
  };

  const handleSimulateScan = (mockRef: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      router.push(`/verify/${encodeURIComponent(mockRef)}`);
    }, 600);
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(scanVideoFrame);
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('Camera access not available or permission denied. You can use image upload or quick simulation.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setCameraActive(false);
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.height = videoRef.current.videoHeight;
        canvas.width = videoRef.current.videoWidth;
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          stopCamera();
          const extractedRef = code.data.includes('/verify/')
            ? code.data.split('/verify/')[1]
            : code.data;
          router.push(`/verify/${encodeURIComponent(extractedRef)}`);
          return;
        }
      }
    }
    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Scan uploaded QR code image
  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            const extractedRef = code.data.includes('/verify/')
              ? code.data.split('/verify/')[1]
              : code.data;
            router.push(`/verify/${encodeURIComponent(extractedRef)}`);
          } else {
            alert('No valid QR code detected in this photo. Please ensure clear lighting.');
          }
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <AppShell
      title="Gate QR Verification"
      subtitle="Terminal Gate 03 Vehicle Clearance & Security Check"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#08162A] via-[#0B1F3A] to-[#155EEF] rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto text-[#00A3FF]">
            <QrCode className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Port Gate Verification Terminal
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
            Scan vehicle QR code from driver tablet or enter the tally reference number to verify supervisor sign-off before gate exit clearance.
          </p>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Live Optical QR Scanner
              </h3>
            </div>
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Activate Camera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <VideoOff className="w-4 h-4" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>

          {cameraError && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              {cameraError}
            </div>
          )}

          {/* Camera Viewport */}
          {cameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Aiming Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative animate-pulse shadow-lg">
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>
              <span className="absolute bottom-3 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                Align QR Code inside frame
              </span>
            </div>
          )}

          {/* Upload QR Photo */}
          <div className="flex items-center justify-center">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Or Upload QR Image from File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleQrImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase">
              Or Manual Search
            </span>
          </div>

          {/* Manual Reference Input Form */}
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Enter Tally Reference Number or Vehicle No
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  placeholder="e.g. DTVS-2026-000784 or ABC-1234"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#155EEF] hover:bg-[#004dc7] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Verify Vehicle Clearance</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo QR Test Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Quick Scan Simulation (Click to test gate scan):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleSimulateScan('DTVS-2026-000784')}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    DTVS-2026-000784
                  </p>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    ABC-1234 • Approved & Cleared
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={isScanning}
                onClick={() => handleSimulateScan('DTVS-2026-000785')}
                className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left transition-colors flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 font-mono">
                    DTVS-2026-000785
                  </p>
                  <p className="text-[10px] text-amber-700 font-semibold">
                    CAB-9921 • Pending Supervisor
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
