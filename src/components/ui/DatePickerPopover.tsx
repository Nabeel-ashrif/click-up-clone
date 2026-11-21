'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react';
import { format, isPast, isToday, addDays, parseISO } from 'date-fns';

interface DatePickerPopoverProps {
  date?: string;
  onChange?: (newDate?: string) => void;
  readOnly?: boolean;
  dropUp?: boolean;
}

export function DatePickerPopover({ date, onChange, readOnly = false, dropUp = false }: DatePickerPopoverProps) {
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

  let isOverdue = false;
  let formattedDate = 'Set Date';

  if (date) {
    try {
      const parsed = parseISO(date);
      formattedDate = format(parsed, 'MMM d');
      isOverdue = isPast(parsed) && !isToday(parsed);
    } catch {
      formattedDate = date;
    }
  }

  if (readOnly || !onChange) {
    if (!date) return <span className="text-xs text-text-muted">-</span>;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium ${
          isOverdue ? 'text-red-600 font-semibold' : 'text-text-secondary'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        {formattedDate}
      </span>
    );
  }

  const setRelativeDate = (daysToAdd: number) => {
    const target = addDays(new Date(), daysToAdd);
    target.setHours(18, 0, 0, 0);
    onChange(target.toISOString());
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs border transition-colors ${
          date
            ? isOverdue
              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              : 'bg-surface text-text-secondary border-border hover:bg-surface-hover'
            : 'border-transparent text-text-muted hover:bg-surface'
        }`}
        title="Due Date"
      >
        <CalendarIcon className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-600' : ''}`} />
        <span>{date ? formattedDate : 'Due Date'}</span>
      </button>

      {isOpen && (
        <div className={`absolute left-0 w-52 bg-white rounded-md shadow-dropdown border border-border p-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
            Set Due Date
          </div>

          <div className="grid grid-cols-2 gap-1 mb-2">
            <button
              type="button"
              onClick={() => setRelativeDate(0)}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-surface-hover text-left"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setRelativeDate(1)}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-surface-hover text-left"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setRelativeDate(7)}
              className="px-2 py-1 text-xs rounded border border-border hover:bg-surface-hover text-left"
            >
              Next Week
            </button>
            {date && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className="px-2 py-1 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50 text-left"
              >
                Clear Date
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-border">
            <label className="block text-[10px] text-text-muted mb-1 font-medium">Custom Date</label>
            <input
              type="date"
              value={date ? date.slice(0, 10) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  onChange(new Date(e.target.value).toISOString());
                  setIsOpen(false);
                }
              }}
              className="w-full text-xs p-1 border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>
      )}
    </div>
  );
}
