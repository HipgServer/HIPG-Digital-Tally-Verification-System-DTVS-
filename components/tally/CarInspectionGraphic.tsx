'use client';

import React from 'react';

interface CarInspectionGraphicProps {
  checklist: Array<{ id: string; name: string; status: string }>;
}

export function CarInspectionGraphic({ checklist }: CarInspectionGraphicProps) {
  const getStatusColor = (id: string) => {
    const item = checklist.find((c) => c.id === id);
    if (!item) return '#94A3B8';
    if (item.status === 'OK') return '#12B76A'; // Green
    if (item.status === 'Missing') return '#F04438'; // Red
    if (item.status === 'Damaged') return '#F79009'; // Amber
    return '#64748B';
  };

  return (
    <div className="relative w-full h-80 rounded-2xl bg-gradient-to-b from-[#EBF3FE] to-[#F0F5FF] border border-blue-100 p-6 flex flex-col items-center justify-center overflow-hidden shadow-inner">
      {/* Port Grid Backdrop Effect */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            'radial-gradient(#155EEF 1px, transparent 1px), radial-gradient(#155EEF 1px, #F0F5FF 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Modern High-End Car Front / Perspective SVG Illustration */}
      <svg
        className="relative z-10 w-64 sm:w-72 drop-shadow-2xl"
        viewBox="0 0 400 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground Shadow */}
        <ellipse cx="200" cy="285" rx="140" ry="18" fill="#155EEF" fillOpacity="0.15" filter="blur(6px)" />
        <ellipse cx="200" cy="282" rx="110" ry="10" fill="#0B1F3A" fillOpacity="0.2" filter="blur(3px)" />

        {/* Roof & Windshield */}
        <path
          d="M135 120 L165 72 C172 62 185 58 200 58 C215 58 228 62 235 72 L265 120 Z"
          fill="url(#windshieldGrad)"
          stroke="#1E3A8A"
          strokeWidth="3"
        />

        {/* Top Cap inspection point */}
        <circle cx="200" cy="62" r="5" fill={getStatusColor('top_cap')} className="animate-pulse" />
        <circle cx="200" cy="62" r="9" stroke={getStatusColor('top_cap')} strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Hood & Main Body */}
        <path
          d="M100 170 C95 145 110 120 135 120 L265 120 C290 120 305 145 300 170 L308 220 C308 235 298 245 285 245 L115 245 C102 245 92 235 92 220 Z"
          fill="url(#carBodyGrad)"
          stroke="#1E40AF"
          strokeWidth="3.5"
        />

        {/* Hood Character Creases */}
        <path d="M150 125 L165 180" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M250 125 L235 180" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />

        {/* Side Mirrors */}
        {/* Left Mirror */}
        <path
          d="M110 125 C88 122 80 132 82 142 C85 148 98 146 112 138 Z"
          fill="#1D4ED8"
          stroke="#0F172A"
          strokeWidth="2"
        />
        <circle cx="88" cy="135" r="4.5" fill={getStatusColor('side_mirror_left')} />

        {/* Right Mirror */}
        <path
          d="M290 125 C312 122 320 132 318 142 C315 148 302 146 288 138 Z"
          fill="#1D4ED8"
          stroke="#0F172A"
          strokeWidth="2"
        />
        <circle cx="312" cy="135" r="4.5" fill={getStatusColor('side_mirror_right')} />

        {/* Headlights */}
        {/* Left Headlight */}
        <path
          d="M102 175 C125 178 140 188 145 198 C120 200 100 192 102 175 Z"
          fill="url(#headlightGrad)"
          stroke="#38BDF8"
          strokeWidth="2"
        />
        {/* Right Headlight */}
        <path
          d="M298 175 C275 178 260 188 255 198 C280 200 300 192 298 175 Z"
          fill="url(#headlightGrad)"
          stroke="#38BDF8"
          strokeWidth="2"
        />

        {/* Front Radiator Grille */}
        <path
          d="M152 195 C170 192 230 192 248 195 C242 225 158 225 152 195 Z"
          fill="#0B1F3A"
          stroke="#1E3A8A"
          strokeWidth="2.5"
        />
        {/* Grille mesh horizontal lines */}
        <line x1="160" y1="202" x2="240" y2="202" stroke="#334155" strokeWidth="1.5" />
        <line x1="165" y1="210" x2="235" y2="210" stroke="#334155" strokeWidth="1.5" />
        <line x1="172" y1="218" x2="228" y2="218" stroke="#334155" strokeWidth="1.5" />

        {/* Front Monogram Emblem */}
        <ellipse cx="200" cy="204" rx="10" ry="7" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
        <circle cx="200" cy="204" r="3.5" fill={getStatusColor('monogram')} />

        {/* Camera Front */}
        <circle cx="200" cy="186" r="3" fill={getStatusColor('camera_front')} stroke="#0284C7" strokeWidth="1" />

        {/* Lower Bumper & Fog Lights */}
        <path
          d="M110 240 C140 252 260 252 290 240 L285 258 C255 264 145 264 115 258 Z"
          fill="#0F172A"
        />
        <circle cx="128" cy="248" r="5" fill="#38BDF8" fillOpacity="0.6" />
        <circle cx="272" cy="248" r="5" fill="#38BDF8" fillOpacity="0.6" />

        {/* Wheels (Visible base) */}
        <rect x="88" y="228" width="18" height="42" rx="6" fill="#1E293B" />
        <rect x="294" y="228" width="18" height="42" rx="6" fill="#1E293B" />
        <circle cx="97" cy="249" r="3.5" fill={getStatusColor('wheel')} />
        <circle cx="303" cy="249" r="3.5" fill={getStatusColor('wheel')} />

        {/* Gradients */}
        <defs>
          <linearGradient id="carBodyGrad" x1="200" y1="120" x2="200" y2="245" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="0.6" stopColor="#1D4ED8" />
            <stop offset="1" stopColor="#1E3A8A" />
          </linearGradient>
          <linearGradient id="windshieldGrad" x1="200" y1="58" x2="200" y2="120" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B1F3A" />
            <stop offset="0.7" stopColor="#1E293B" />
            <stop offset="1" stopColor="#38BDF8" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="headlightGrad" x1="120" y1="175" x2="120" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Diagram Caption */}
      <div className="relative z-10 mt-3 text-center">
        <span className="text-[11px] font-semibold text-blue-900/80 bg-white/70 px-3 py-1 rounded-full border border-blue-200/60 shadow-2xs">
          Interactive Inspection Hotspots
        </span>
      </div>
    </div>
  );
}

