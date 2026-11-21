'use client';

import './globals.css';
import { AppProvider, useApp } from '@/lib/store';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { QuickAddTaskModal } from '@/components/tasks/QuickAddTaskModal';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal';
import { CheckCircle2 } from 'lucide-react';

function GlobalOverlays() {
  const { isShortcutsOpen, setIsShortcutsOpen, toastMessage } = useApp();

  return (
    <>
      <TaskDetailDrawer />
      <QuickAddTaskModal />
      <CommandPalette />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 text-white rounded-lg shadow-xl text-xs font-medium animate-in slide-in-from-bottom-5 duration-200 border border-slate-700/60">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>ClickUp Pro | Enterprise Team Project Management</title>
        <meta
          name="description"
          content="Clean-room internal team clone of ClickUp with enterprise-grade UI/UX."
        />
      </head>
      <body className="h-screen overflow-hidden bg-bg text-text antialiased">
        <AppProvider>
          {children}
          <GlobalOverlays />
        </AppProvider>
      </body>
    </html>
  );
}
