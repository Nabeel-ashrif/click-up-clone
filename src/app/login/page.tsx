'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, showToast } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register New Member: ONLY the 4 fields with red ticks (User ID, Full Name, Password, Role)
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('member');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to authenticate');
        setIsLoading(false);
        return;
      }

      setCurrentUser(data.user);
      showToast(`Welcome back, ${data.user.fullName}!`);
      router.push('/w/deutsche/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection error');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setCurrentUser(data.user);
      showToast(`Account created for ${data.user.fullName}!`);
      router.push('/w/deutsche/home');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Soft Ambient Pastel Glow at Top Edge (Matching Reference Screenshot) */}
      <div
        className="absolute top-0 left-0 right-0 h-80 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(circle at 15% -20%, rgba(244, 63, 94, 0.12) 0%, transparent 60%), radial-gradient(circle at 85% -20%, rgba(14, 165, 233, 0.14) 0%, transparent 60%)',
        }}
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* App Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-white p-1 hover:scale-105 transition-transform duration-300">
            <img
              src="/app-icon.jpg"
              alt="Workspace App Icon"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {mode === 'signin' ? 'Welcome back!' : 'Create your account'}
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-teal-800 hover:text-teal-900 font-semibold underline underline-offset-2"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg('');
                }}
                className="text-teal-800 hover:text-teal-900 font-semibold underline underline-offset-2"
              >
                Log In
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-[420px] relative z-10">
        <div className="bg-white py-8 px-6 shadow-sm rounded-2xl border border-slate-200/90 sm:px-8">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  User ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your user ID (e.g. alex)"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 shadow-2xs transition-all"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 shadow-2xs transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 shadow-sm transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Log In'}
              </button>
            </form>
          ) : (
            /* Register Form: ONLY 4 required fields (User ID, Full Name, Password, Role) */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  User ID / Username <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dev_sarah"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-600 font-bold">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team Role <span className="text-rose-600 font-bold">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 font-medium"
                >
                  <option value="admin">Admin - Manage spaces and members</option>
                  <option value="member">Member - Standard sprint contributor</option>
                  <option value="viewer">Viewer - Read-only stakeholder</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Log In'}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Internal Team Project Management System</span>
        </div>
      </div>
    </div>
  );
}
