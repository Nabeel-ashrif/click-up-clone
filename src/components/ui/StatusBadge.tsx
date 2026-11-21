'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Status } from '@/lib/types';
import { useApp } from '@/lib/store';

interface StatusBadgeProps {
  statusId: string;
  onChange?: (newStatusId: string) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}

export function StatusBadge({ statusId, onChange, readOnly = false, size = 'sm' }: StatusBadgeProps) {
  const { workspace, getStatusById } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentStatus = getStatusById(statusId);

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

  const allStatuses = workspace.spaces.flatMap((s) => s.statuses).filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  );

  const badgeStyle = {
    backgroundColor: `${currentStatus.color}15`,
    color: currentStatus.color,
    borderColor: `${currentStatus.color}40`,
  };

  if (readOnly || !onChange) {
    return (
      <span
        style={badgeStyle}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border select-none`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
        />
        {currentStatus.name}
      </span>
    );
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={badgeStyle}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border hover:opacity-90 transition-opacity select-none ${
          size === 'md' ? 'px-2.5 py-1 text-xs' : ''
        }`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: currentStatus.color }}
        />
        <span>{currentStatus.name}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white rounded-md shadow-dropdown border border-border py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Move Status
          </div>
          {allStatuses.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                onChange(st.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left hover:bg-surface-hover transition-colors ${
                st.id === statusId ? 'bg-surface font-semibold' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                <span className="text-text font-medium">{st.name}</span>
              </div>
              {st.id === statusId && <Check className="w-3.5 h-3.5 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
