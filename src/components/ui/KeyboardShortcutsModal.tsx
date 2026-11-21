'use client';

import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '⌘ K / Ctrl+K', description: 'Open Command Palette & Global Search' },
    { key: '⌘ T / Ctrl+T', description: 'Quickly create a new task' },
    { key: 'Esc', description: 'Close modal or active task inspector' },
    { key: '?', description: 'Toggle this keyboard shortcuts dialog' },
    { key: 'Enter', description: 'Confirm inline task creation' },
    { key: 'Tab', description: 'Navigate through inputs and controls' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-modal border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent" />
            <h3 className="font-semibold text-sm text-slate-800">Keyboard Shortcuts</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {shortcuts.map((item) => (
            <div key={item.key} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{item.description}</span>
              <kbd className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md font-mono text-[11px] text-slate-700 shadow-xs">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Enterprise Power-User Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-700 font-medium hover:bg-slate-100"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
