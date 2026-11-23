'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { useApp } from '@/lib/store';
import { canUserViewTask } from '@/lib/permissions';
import { StatusBadge } from '../ui/StatusBadge';

export function CalendarView({ listId }: { listId: string }) {
  const { tasks, getStatusById, setSelectedTaskId, addTask, currentUser } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const listTasks = tasks.filter(
    (t) => t.listId === listId && !t.parentTaskId && t.dueDate && canUserViewTask(t, currentUser)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Month Header Nav */}
      <div className="h-12 px-6 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-4 h-4 text-accent" />
          <h2 className="font-bold text-sm text-text">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-2.5 py-1 text-xs border border-border rounded font-medium hover:bg-surface text-text"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-1 rounded hover:bg-surface border border-border"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-1 rounded hover:bg-surface border border-border"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border bg-surface text-center text-xs font-semibold text-text-muted py-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 divide-x divide-y divide-border overflow-y-auto">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isSameDay(day, new Date());

          const dayTasks = listTasks.filter((t) => {
            if (!t.dueDate) return false;
            try {
              return isSameDay(parseISO(t.dueDate), day);
            } catch {
              return false;
            }
          });

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                !isCurrentMonth ? 'bg-surface/50 text-text-muted' : 'bg-white'
              } ${isTodayDate ? 'ring-1 ring-accent bg-accent/5' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    isTodayDate
                      ? 'bg-accent text-white font-bold'
                      : isCurrentMonth
                      ? 'text-text'
                      : 'text-text-muted'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    addTask({
                      title: 'New scheduled task',
                      listId,
                      dueDate: day.toISOString(),
                    })
                  }
                  className="opacity-0 hover:opacity-100 p-0.5 text-text-muted hover:text-accent rounded"
                  title="Add task on this date"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks for the day */}
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayTasks.map((t) => {
                  const status = getStatusById(t.statusId);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTaskId(t.id)}
                      className="w-full text-left p-1 rounded text-[11px] font-medium border truncate flex items-center gap-1.5 shadow-xs hover:border-accent"
                      style={{
                        backgroundColor: `${status.color}15`,
                        borderColor: `${status.color}40`,
                        color: status.color,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="truncate text-text font-medium">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
