'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Check,
  Plus,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { format, parseISO, isPast, isToday } from 'date-fns';
import Link from 'next/link';

export default function HomeMyWorkPage() {
  const {
    tasks,
    currentUser,
    workspace,
    setSelectedTaskId,
    updateTask,
    setIsQuickAddOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assigned' | 'created' | 'due' | 'completed'>('assigned');

  // Tasks assigned to current user — match by id, username, or email for cross-device compatibility
  const myTasks = tasks.filter((t) => {
    if (t.assigneeIds.includes(currentUser.id)) return true;
    if (currentUser.username && t.assigneeIds.includes(currentUser.username)) return true;
    if (currentUser.email && t.assigneeIds.includes(currentUser.email)) return true;
    return false;
  });
  const activeTasks = myTasks.filter((t) => t.statusId !== 'st-done');
  const completedTasks = myTasks.filter((t) => t.statusId === 'st-done');

  // Tasks created/assigned by current user to others
  const createdByMeTasks = tasks.filter((t) => {
    const isCreator =
      t.creatorId === currentUser.id ||
      (currentUser.username && t.creatorId === currentUser.username) ||
      (currentUser.email && t.creatorId === currentUser.email);
    const isAssignee =
      t.assigneeIds.includes(currentUser.id) ||
      (currentUser.username && t.assigneeIds.includes(currentUser.username)) ||
      (currentUser.email && t.assigneeIds.includes(currentUser.email));
    return isCreator && !isAssignee && t.statusId !== 'st-done';
  });

  // Overdue or due soon
  const dueSoonTasks = activeTasks.filter((t) => {
    if (!t.dueDate) return false;
    try {
      const parsed = parseISO(t.dueDate);
      return isPast(parsed) || isToday(parsed);
    } catch {
      return false;
    }
  });

  const displayedTasks =
    activeTab === 'assigned'
      ? activeTasks
      : activeTab === 'created'
      ? createdByMeTasks
      : activeTab === 'due'
      ? dueSoonTasks
      : completedTasks;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
      {/* Enterprise Welcome Banner Card */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-purple-50/30 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-bold text-[11px] tracking-wide uppercase">
              Pro Workspace
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {currentUser.fullName} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            You have <strong className="text-slate-800">{activeTasks.length} active tasks</strong> assigned
            to you. Zero seat limits or paywalls are enabled for your internal team.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xl font-extrabold text-accent">{activeTasks.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              To Do
            </div>
          </div>
          <div className="text-center px-4 py-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="text-xl font-extrabold text-emerald-600">{completedTasks.length}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Completed
            </div>
          </div>
          <Link
            href={`/w/${workspace.slug}/dashboard`}
            className="flex items-center gap-1.5 px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-102 active:scale-98"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main 2 Cols: My Work Tabbed List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-xs">
            {/* Segmented Filter Tab Buttons */}
            <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('assigned')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'assigned'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Assigned ({activeTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('created')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'created'
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Assigned by Me ({createdByMeTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('due')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'due'
                      ? 'bg-white text-red-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Due Soon ({dueSoonTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'completed'
                      ? 'bg-white text-emerald-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Done ({completedTasks.length})
                </button>
              </div>

              <span className="text-[11px] font-semibold text-slate-400">
                Click any row to open inspector
              </span>
            </div>

            {/* Tasks List */}
            <div className="divide-y divide-slate-100">
              {displayedTasks.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-400">
                  🎉 Nothing in this view right now! You are all caught up.
                </div>
              ) : (
                displayedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between text-xs transition-colors group cursor-pointer"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="flex items-center gap-3 overflow-hidden flex-1 mr-3">
                      {/* Interactive checkmark icon button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTask(task.id, {
                            statusId: task.statusId === 'st-done' ? 'st-todo' : 'st-done',
                          });
                        }}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all flex-shrink-0 ${
                          task.statusId === 'st-done'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                            : 'border-slate-300 hover:border-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Toggle complete"
                      >
                        {task.statusId === 'st-done' && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>

                      <span
                        className={`font-semibold truncate transition-colors ${
                          task.statusId === 'st-done'
                            ? 'line-through text-slate-400 font-normal'
                            : 'text-slate-800 group-hover:text-accent'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-2 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StatusBadge
                        statusId={task.statusId}
                        onChange={(statusId) => updateTask(task.id, { statusId })}
                      />
                      <PriorityBadge
                        priority={task.priority}
                        onChange={(priority) => updateTask(task.id, { priority })}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Due Soon & Spaces Jump */}
        <div className="space-y-4">
          {/* Due Soon Box */}
          <div className="border border-slate-200/90 rounded-2xl bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Critical & Due Soon ({dueSoonTasks.length})
              </h3>
            </div>

            {dueSoonTasks.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No urgent items. Great work!</div>
            ) : (
              <div className="space-y-2">
                {dueSoonTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTaskId(t.id)}
                    className="w-full text-left p-3 rounded-xl bg-red-50/60 border border-red-200/70 hover:border-red-300 transition-all shadow-2xs"
                  >
                    <div className="font-semibold text-xs text-red-950 truncate">{t.title}</div>
                    <div className="text-[10px] text-red-600 mt-1 font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {t.dueDate ? format(parseISO(t.dueDate), 'MMM d, h:mm a') : 'Overdue'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Spaces Jump */}
          <div className="border border-slate-200/90 rounded-2xl bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Workspace Spaces
            </h3>
            <div className="space-y-1.5">
              {workspace.spaces.map((sp) => (
                <Link
                  key={sp.id}
                  href={`/w/${workspace.slug}/v/l/${sp.lists[0]?.id || 'l-sprint-14'}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors border border-transparent hover:border-slate-200 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-md shadow-xs"
                      style={{ backgroundColor: sp.color }}
                    />
                    <span className="font-semibold text-slate-800">{sp.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
