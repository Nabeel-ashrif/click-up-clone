'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { Status, Task } from '@/lib/types';
import { useApp } from '@/lib/store';
import { canTransitionTaskStatus } from '@/lib/permissions';

interface StatusBadgeProps {
  statusId: string;
  onChange?: (newStatusId: string) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
  dropUp?: boolean;
  task?: Task;
}

export function StatusBadge({ statusId, onChange, readOnly = false, size = 'sm', dropUp = false, task }: StatusBadgeProps) {
  const { workspace, getStatusById, currentUser, showToast } = useApp();
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
        <div className={`absolute left-0 w-48 bg-white rounded-xl shadow-modal border border-slate-200 py-1.5 z-[9999] animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1 flex items-center justify-between">
            <span>Move Phase</span>
            <span className="text-[9px] text-teal-800 capitalize font-mono">{currentUser.role || 'Member'}</span>
          </div>
          {allStatuses.map((st) => {
            const check = canTransitionTaskStatus(task, st, currentUser);
            const isCurrent = st.id === statusId;
            const isLocked = !check.allowed && !isCurrent;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  if (isLocked) {
                    showToast(check.reason || 'Permission denied: Stage is locked.');
                    return;
                  }
                  onChange(st.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                  isCurrent
                    ? 'bg-slate-100 font-bold text-slate-900'
                    : isLocked
                      ? 'opacity-50 hover:bg-amber-50/50 cursor-not-allowed text-slate-400'
                      : 'hover:bg-slate-50 text-slate-700'
                }`}
                title={isLocked ? check.reason : `Set to ${st.name}`}
              >
                <div className="flex items-center gap-2 overflow-hidden truncate">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                  <span className="truncate">{st.name}</span>
                </div>
                {isCurrent ? (
                  <Check className="w-3.5 h-3.5 text-teal-800 flex-shrink-0" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
