'use client';

import React from 'react';
import { Clock, Calendar, ChevronRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { canUserViewTask } from '@/lib/permissions';
import { PriorityBadge } from '../ui/PriorityBadge';
import { format, parseISO } from 'date-fns';

export function GanttView({ listId }: { listId: string }) {
  const { tasks, getStatusById, setSelectedTaskId, currentUser } = useApp();

  const listTasks = tasks.filter(
    (t) => t.listId === listId && !t.parentTaskId && canUserViewTask(t, currentUser)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="h-12 px-6 border-b border-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <h2 className="font-bold text-sm text-text">Timeline & Gantt Schedule</h2>
        </div>
        <div className="text-xs text-text-muted">Sprint 14 Schedule (November 2026)</div>
      </div>

      {/* Gantt Table & Duration Bars */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px] border border-border rounded-lg overflow-hidden bg-white shadow-xs">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-surface border-b border-border text-[11px] font-bold text-text-muted uppercase tracking-wider py-2 px-4">
            <div className="col-span-4">Task Name</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-4">Timeline Span (Nov 1 - Nov 30)</div>
          </div>

          <div className="divide-y divide-border">
            {listTasks.map((task) => {
              const status = getStatusById(task.statusId);

              // Calculate faux duration width for visual timeline display
              let formattedDate = 'No date';
              let percentOffset = 20;
              let percentWidth = 40;

              if (task.dueDate) {
                try {
                  const parsed = parseISO(task.dueDate);
                  formattedDate = format(parsed, 'MMM d');
                  const day = parsed.getDate();
                  percentOffset = Math.max(5, Math.min(80, (day / 30) * 80));
                  percentWidth = Math.max(15, 30);
                } catch {
                  formattedDate = task.dueDate;
                }
              }

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  className="grid grid-cols-12 items-center py-2.5 px-4 hover:bg-surface-hover text-xs cursor-pointer transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-2 overflow-hidden pr-2">
                    <PriorityBadge priority={task.priority} readOnly />
                    <span className="font-medium text-text truncate">{task.title}</span>
                  </div>

                  <div className="col-span-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: status.color }}
                    >
                      {status.name}
                    </span>
                  </div>

                  <div className="col-span-2 text-text-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>

                  {/* Visual Duration Bar */}
                  <div className="col-span-4 relative h-6 bg-surface rounded flex items-center px-1">
                    <div
                      className="h-4 rounded shadow-xs flex items-center px-2 text-[10px] font-bold text-white truncate transition-all"
                      style={{
                        backgroundColor: status.color,
                        marginLeft: `${percentOffset}%`,
                        width: `${percentWidth}%`,
                      }}
                    >
                      {task.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
