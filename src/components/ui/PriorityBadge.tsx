'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Flag, X } from 'lucide-react';
import { TaskPriority } from '@/lib/types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  onChange?: (newPriority: TaskPriority) => void;
  readOnly?: boolean;
  showLabel?: boolean;
  dropUp?: boolean;
}

export const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; iconColor: string; bg: string }
> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-700',
    iconColor: '#dc2626',
    bg: 'bg-red-50 hover:bg-red-100 border-red-200',
  },
  high: {
    label: 'High',
    color: 'text-amber-700',
    iconColor: '#f59e0b',
    bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
  },
  normal: {
    label: 'Normal',
    color: 'text-blue-700',
    iconColor: '#2563eb',
    bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
  },
  low: {
    label: 'Low',
    color: 'text-slate-600',
    iconColor: '#64748b',
    bg: 'bg-slate-50 hover:bg-slate-100 border-slate-200',
  },
  none: {
    label: 'Clear',
    color: 'text-gray-400',
    iconColor: '#9ca3af',
    bg: 'bg-transparent hover:bg-gray-100 border-transparent',
  },
};

export function PriorityBadge({
  priority,
  onChange,
  readOnly = false,
  showLabel = false,
  dropUp = false,
}: PriorityBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const current = priorityConfig[priority] || priorityConfig.none;

  if (readOnly || !onChange) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border font-medium ${current.bg} ${current.color}`}
        title={`Priority: ${current.label}`}
      >
        <Flag className="w-3.5 h-3.5 fill-current" style={{ color: current.iconColor }} />
        {showLabel && <span>{current.label}</span>}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs border transition-colors ${current.bg} ${current.color}`}
        title="Change Priority"
      >
        <Flag className="w-3.5 h-3.5 fill-current" style={{ color: current.iconColor }} />
        {showLabel && <span className="font-medium">{current.label}</span>}
      </button>

      {isOpen && (
        <div className={`absolute left-0 w-36 bg-white rounded-md shadow-dropdown border border-border py-1 z-[9999] animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="px-2 py-1 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Set Priority
          </div>
          {(['urgent', 'high', 'normal', 'low', 'none'] as TaskPriority[]).map((p) => {
            const item = priorityConfig[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(p);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left hover:bg-surface-hover transition-colors ${
                  priority === p ? 'bg-surface font-semibold' : ''
                }`}
              >
                <Flag className="w-3.5 h-3.5 fill-current" style={{ color: item.iconColor }} />
                <span className={item.color}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
