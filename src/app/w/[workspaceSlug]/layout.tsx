'use client';

import React from 'react';
import { Sidebar } from '@/components/shell/Sidebar';
import { Navbar } from '@/components/shell/Navbar';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg">
      {/* ClickUp Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* View Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface/30">
          {children}
        </main>
      </div>
    </div>
  );
}
