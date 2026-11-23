'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          router.replace('/w/deutsche/home');
        } else {
          router.replace('/login');
        }
      } catch {
        router.replace('/login');
      }
    }
    checkAuth();
  }, [router, setCurrentUser]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-400 text-xs">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="font-semibold text-white tracking-wide">
          Verifying ClickUp Workspace Session...
        </span>
      </div>
    </div>
  );
}
