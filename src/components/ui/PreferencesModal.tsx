'use client';

import React from 'react';
import {
  X,
  Palette,
  ZoomIn,
  Type,
  Check,
  Sparkles,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { ColorTheme, ZoomLevel, FontFamily } from '@/lib/types';

export function PreferencesModal() {
  const {
    isPreferencesModalOpen,
    setIsPreferencesModalOpen,
    preferences,
    updatePreferences,
    currentUser,
  } = useApp();

  if (!isPreferencesModalOpen) return null;

  const themes: { id: ColorTheme; name: string; description: string; colors: string[] }[] = [
    {
      id: 'executive',
      name: 'Executive Cream & Teal',
      description: 'Off-white major base, rich teal green, gold, and deep navy.',
      colors: ['#faf9f6', '#0f766e', '#1e3a5f', '#d97706'],
    },
    {
      id: 'dark',
      name: 'Obsidian Deep Dark',
      description: 'True dark mode with midnight charcoal, slate, and glowing teal.',
      colors: ['#090d16', '#111827', '#14b8a6', '#3b82f6'],
    },
    {
      id: 'navy',
      name: 'Corporate Navy & Cobalt',
      description: 'Crisp cool gray base with authoritative royal navy and cobalt.',
      colors: ['#f1f5f9', '#1e3a5f', '#2563eb', '#0284c7'],
    },
    {
      id: 'crimson',
      name: 'Burgundy & Warm Crimson',
      description: 'Sophisticated maroon and warm bone white executive tone.',
      colors: ['#faf5f5', '#881337', '#9f1239', '#e11d48'],
    },
    {
      id: 'emerald',
      name: 'Evergreen & Sage Forest',
      description: 'Natural organic emerald greens with soothing light background.',
      colors: ['#f2f9f5', '#064e3b', '#059669', '#10b981'],
    },
  ];

  const zoomLevels: { id: ZoomLevel; name: string; note: string }[] = [
    { id: '90', name: '90% Compact', note: 'High density for spreadsheets and multi-tasking' },
    { id: '100', name: '100% Standard', note: 'Balanced default interface scaling' },
    { id: '110', name: '110% Comfortable', note: 'Spacious padding with larger typography' },
    { id: '120', name: '120% High Visibility', note: 'Maximum accessibility and readability' },
  ];

  const fonts: { id: FontFamily; name: string; preview: string; sample: string }[] = [
    {
      id: 'inter',
      name: 'Modern Sans (Inter)',
      preview: 'Crisp, high-legibility enterprise UI font',
      sample: 'Aa Bb Gg 123',
    },
    {
      id: 'jakarta',
      name: 'Plus Jakarta Sans',
      preview: 'Geometric, friendly contemporary digital design',
      sample: 'Aa Bb Gg 123',
    },
    {
      id: 'mono',
      name: 'Technical Monospace',
      preview: 'Engineered code aesthetic with fixed-pitch alignment',
      sample: 'Aa Bb Gg 123',
    },
    {
      id: 'serif',
      name: 'Editorial Serif (Merriweather)',
      preview: 'Refined book typography with warm literary contrast',
      sample: 'Aa Bb Gg 123',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={() => setIsPreferencesModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8f7f4] border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                Personal Display & Accessibility Preferences
              </h3>
              <p className="text-[11px] text-slate-500">
                Customized for @{currentUser.username || currentUser.fullName} &bull; Persists across sessions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPreferencesModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Color Themes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-teal-800" />
                <span>Color Theme</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Instant preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themes.map((th) => {
                const isSelected = preferences.theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => updatePreferences({ theme: th.id })}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/30'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-900">{th.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-800 stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-snug mb-2.5">
                        {th.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-auto">
                      {th.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-slate-300/80 shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Sidebar Appearance (Light / Dark) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-teal-800" />
                <span>Left Sidebar Appearance</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Clean Minimalist vs Dark</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updatePreferences({ sidebarTheme: 'light' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  (preferences.sidebarTheme || 'light') === 'light'
                    ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-xs text-slate-900">Clean Light (Reference)</span>
                  </div>
                  {(preferences.sidebarTheme || 'light') === 'light' && (
                    <Check className="w-3.5 h-3.5 text-teal-800 stroke-[3]" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  Off-white modern minimalist panel, subtle borders, crisp readable typography.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updatePreferences({ sidebarTheme: 'dark' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  preferences.sidebarTheme === 'dark'
                    ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/30'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-slate-600" />
                    <span className="font-bold text-xs text-slate-900">Obsidian Dark</span>
                  </div>
                  {preferences.sidebarTheme === 'dark' && (
                    <Check className="w-3.5 h-3.5 text-teal-800 stroke-[3]" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">
                  High-contrast dark slate rail for maximum visual focus on content.
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Zoom / Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-teal-800" />
                <span>Zoom Level / UI Scale</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono font-bold">
                Current: {preferences.zoom}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {zoomLevels.map((z) => {
                const isSelected = preferences.zoom === z.id;
                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => updatePreferences({ zoom: z.id })}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">{z.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{z.note}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Font Family */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-teal-800" />
                <span>Typography & Font Family</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fonts.map((f) => {
                const isSelected = preferences.font === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => updatePreferences({ font: f.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-2 ring-teal-700/30'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{f.name}</span>
                      <span className="text-[11px] font-semibold text-slate-400">{f.sample}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{f.preview}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8f7f4] border-t border-slate-200">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Preferences are saved to this browser profile automatically</span>
          </div>
          <button
            type="button"
            onClick={() => setIsPreferencesModalOpen(false)}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
