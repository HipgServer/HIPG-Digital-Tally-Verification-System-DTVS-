'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Zap,
  CloudLightning,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Anchor,
  CheckCircle,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, loginAs } = useAuth();
  const [username, setUsername] = useState('security01');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const ok = await loginWithCredentials(username, password);
      if (ok) {
        router.push('/dashboard');
      } else {
        setErrorMessage('Invalid credentials. Please verify or use Quick Access.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRole = async (role: UserRole) => {
    setIsLoading(true);
    await loginAs(role);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden bg-[#08162A]">
      {/* Background Port Visuals */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(8, 22, 42, 0.94) 30%, rgba(11, 31, 58, 0.8) 70%, rgba(15, 40, 75, 0.85)), url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Subtle overlay ship light streaks */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Brand & Product Features */}
        <div className="lg:col-span-7 text-white space-y-8 py-6">
          {/* HIPG Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#155EEF] to-[#00A3FF] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-wider text-white">HIPG</span>
                <span className="text-blue-400 font-light text-xl">|</span>
                <span className="text-xs uppercase tracking-wider text-slate-300 font-medium">Hambantota International Port Group</span>
              </div>
              <p className="text-[11px] text-blue-200/80 tracking-wide">PORT OPERATIONS MANAGEMENT SYSTEM</p>
            </div>
          </div>

          {/* Large Title */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A3FF] to-[#155EEF] flex items-center justify-center shadow-xl shadow-cyan-500/30">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                DTVS
              </h1>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              Digital Tally & Verification System
            </p>
            <p className="text-base text-slate-300 max-w-lg leading-relaxed">
              Automated vehicle discharge tracking, digital damage inspection, instant photo evidence, and supervisor verification for RoRo vessel operations.
            </p>
          </div>

          {/* Feature Badges matching mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-lg">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Secure & Verified</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Real-time Recording</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0">
                <CloudLightning className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-200">Offline Ready</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphism Login Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl bg-white/15 backdrop-blur-xl border border-white/20 p-8 sm:p-9 shadow-2xl text-white">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Welcome Back <span className="text-amber-300">👋</span>
              </h2>
              <p className="text-sm text-slate-200 mt-1">
                Sign in to access DTVS operational terminal
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Username / Terminal ID
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] focus:border-transparent text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#155EEF] to-[#00A3FF] hover:from-[#0052e0] hover:to-[#008fdf] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* SSO Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <span className="relative px-3 bg-[#0B1F3A]/80 backdrop-blur-md text-[11px] font-medium text-slate-300 rounded-full">
                Sign in with Enterprise Account
              </span>
            </div>

            {/* Microsoft 365 & DingTalk SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickRole('Security Officer')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 21 21" fill="none">
                  <path d="M1 1h9v9H1V1z" fill="#f25022" />
                  <path d="M11 1h9v9h-9V1z" fill="#7fba00" />
                  <path d="M1 11h9v9H1v-9z" fill="#00a4ef" />
                  <path d="M11 11h9v9h-9v-9z" fill="#ffb900" />
                </svg>
                <span>Microsoft 365</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRole('Supervisor')}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all"
              >
                <div className="w-4 h-4 rounded bg-[#0089FF] text-white flex items-center justify-center font-black text-[9px]">
                  钉
                </div>
                <span>DingTalk</span>
              </button>
            </div>

            {/* Quick Role Tester Pills */}
            <div className="mt-6 pt-4 border-t border-white/15">
              <p className="text-[11px] font-medium text-slate-300 mb-2 text-center">
                Instant Demo Access by Role:
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {(
                  [
                    'Security Officer',
                    'Supervisor',
                    'Administrator',
                    'CSD',
                    'Security Viewer',
                  ] as UserRole[]
                ).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleQuickRole(r)}
                    className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

