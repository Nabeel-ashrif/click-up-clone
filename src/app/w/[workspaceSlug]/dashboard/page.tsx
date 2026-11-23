'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Users,
  CheckSquare,
  Calendar,
  Sparkles,
  BarChart3,
  Filter,
  Eye,
  Check,
  ChevronRight,
  FolderKanban,
  Target,
  Zap,
  X,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Avatar } from '@/components/ui/Avatar';
import { TaskWorkflowStepper } from '@/components/tasks/TaskWorkflowStepper';
import { defaultStatuses } from '@/lib/mock-data';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Task } from '@/lib/types';

// ─── Drill-Down Modal ────────────────────────────────────────────────────────

interface DrillDownModalProps {
  title: string;
  color: string;
  tasks: Task[];
  onClose: () => void;
}

function DrillDownModal({ title, color, tasks, onClose }: DrillDownModalProps) {
  const { users, updateTask, setSelectedTaskId } = useApp();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Auto-focus search
  useEffect(() => { searchRef.current?.focus(); }, []);

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0"
          style={{ borderLeftWidth: 4, borderLeftColor: color }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">{title}</h2>
              <p className="text-[11px] text-slate-500">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} — click any task to open inspector
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${tasks.length} tasks...`}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              {search ? 'No tasks match your search.' : 'No tasks in this category.'}
            </div>
          ) : (
            filtered.map((task) => {
              const assignedUsers = task.assigneeIds
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean);

              return (
                <div
                  key={task.id}
                  className="px-5 py-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                >
                  {/* Left: Checkbox + Title */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Quick complete checkbox */}
                    <button
                      type="button"
                      title="Toggle complete"
                      onClick={() =>
                        updateTask(task.id, {
                          statusId: task.statusId === 'st-done' ? 'st-todo' : 'st-done',
                        })
                      }
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                        task.statusId === 'st-done'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50'
                      }`}
                    >
                      {task.statusId === 'st-done' && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    {/* Title — click to open inspector */}
                    <button
                      type="button"
                      onClick={() => { setSelectedTaskId(task.id); onClose(); }}
                      className={`text-left font-semibold text-xs truncate transition-colors ${
                        task.statusId === 'st-done'
                          ? 'line-through text-slate-400'
                          : 'text-slate-800 hover:text-teal-800 group-hover:underline'
                      }`}
                    >
                      {task.title}
                    </button>
                  </div>

                  {/* Right: Status, Priority, Assignees, Due, Open */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {/* Inline status change */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusBadge
                        statusId={task.statusId}
                        onChange={(statusId) => updateTask(task.id, { statusId })}
                      />
                    </div>

                    {/* Inline priority change */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <PriorityBadge
                        priority={task.priority}
                        onChange={(priority) => updateTask(task.id, { priority })}
                      />
                    </div>

                    {/* Assignees */}
                    <div className="flex -space-x-1.5">
                      {assignedUsers.slice(0, 3).map((u: any) => (
                        <Avatar key={u.id} user={u} size="xs" />
                      ))}
                      {assignedUsers.length > 3 && (
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-[9px] font-bold text-slate-600 flex items-center justify-center border border-white">
                          +{assignedUsers.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Due date */}
                    {task.dueDate && (
                      <span
                        className={`text-[10px] font-mono flex items-center gap-1 ${
                          isPast(parseISO(task.dueDate)) && task.statusId !== 'st-done'
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-400'
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        {format(parseISO(task.dueDate), 'MMM d')}
                      </span>
                    )}

                    {/* Open inspector */}
                    <button
                      type="button"
                      title="Open full inspector"
                      onClick={() => { setSelectedTaskId(task.id); onClose(); }}
                      className="p-1 rounded-lg text-slate-400 hover:text-teal-800 hover:bg-teal-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 flex-shrink-0">
          <span>
            Showing <strong className="text-slate-700">{filtered.length}</strong> of{' '}
            <strong className="text-slate-700">{tasks.length}</strong> tasks
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────

export default function ExecutiveDashboardPage() {
  const {
    workspace,
    tasks,
    users,
    currentUser,
    setSelectedTaskId,
    updateTask,
  } = useApp();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');

  // ── Drill-down state ──────────────────────────────────────────────────────
  type DrillCategory =
    | 'all'
    | 'todo'
    | 'in-progress'
    | 'in-review'
    | 'completed'
    | 'critical'
    | `member-${string}`;

  const [drillCategory, setDrillCategory] = useState<DrillCategory | null>(null);

  const openDrill = (cat: DrillCategory) => setDrillCategory(cat);
  const closeDrill = () => setDrillCategory(null);

  // Filter tasks based on space, status, and member selection
  const filteredTasks = tasks.filter((t) => {
    if (selectedSpaceId !== 'all') {
      const space = workspace.spaces.find((s) => s.id === selectedSpaceId);
      const spaceListIds = space
        ? [...space.lists.map((l) => l.id), ...space.folders.flatMap((f) => f.lists.map((l) => l.id))]
        : [];
      if (!spaceListIds.includes(t.listId)) return false;
    }
    if (selectedStatusFilter !== 'all' && t.statusId !== selectedStatusFilter) return false;
    if (selectedMemberId !== 'all' && !t.assigneeIds.includes(selectedMemberId)) return false;
    return true;
  });

  // Global calculations across workspace
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.statusId === 'st-todo');
  const inProgressTasks = tasks.filter((t) => t.statusId === 'st-progress');
  const inReviewTasks = tasks.filter((t) => t.statusId === 'st-review');
  const completedTasks = tasks.filter((t) => t.statusId === 'st-done');
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Critical & overdue tasks
  const criticalTasks = tasks.filter((t) => {
    if (t.statusId === 'st-done') return false;
    if (t.priority === 'urgent' || t.priority === 'high') return true;
    if (t.dueDate) {
      try {
        const parsed = parseISO(t.dueDate);
        return isPast(parsed) || isToday(parsed);
      } catch {
        return false;
      }
    }
    return false;
  });

  // Determine which tasks to show in the drill-down modal
  const getDrillTasks = (): Task[] => {
    if (!drillCategory) return [];
    if (drillCategory === 'all') return tasks;
    if (drillCategory === 'todo') return todoTasks;
    if (drillCategory === 'in-progress') return inProgressTasks;
    if (drillCategory === 'in-review') return inReviewTasks;
    if (drillCategory === 'completed') return completedTasks;
    if (drillCategory === 'critical') return criticalTasks;
    if (drillCategory.startsWith('member-')) {
      const uid = drillCategory.replace('member-', '');
      return tasks.filter((t) => t.assigneeIds.includes(uid));
    }
    return [];
  };

  const getDrillTitle = (): string => {
    if (!drillCategory) return '';
    if (drillCategory === 'all') return 'All Tasks';
    if (drillCategory === 'todo') return 'TO DO — Backlog';
    if (drillCategory === 'in-progress') return 'In Progress — Active Execution';
    if (drillCategory === 'in-review') return 'In Review — Awaiting Sign-off';
    if (drillCategory === 'completed') return 'Completed Tasks';
    if (drillCategory === 'critical') return 'Critical / Urgent / Overdue';
    if (drillCategory.startsWith('member-')) {
      const uid = drillCategory.replace('member-', '');
      const u = users.find((u) => u.id === uid);
      return `${u?.fullName || 'Member'} — Assigned Tasks`;
    }
    return '';
  };

  const getDrillColor = (): string => {
    if (!drillCategory) return '#0f766e';
    if (drillCategory === 'todo') return '#87909e';
    if (drillCategory === 'in-progress') return '#2563eb';
    if (drillCategory === 'in-review') return '#ea580c';
    if (drillCategory === 'completed') return '#16a34a';
    if (drillCategory === 'critical') return '#dc2626';
    if (drillCategory.startsWith('member-')) {
      const uid = drillCategory.replace('member-', '');
      return users.find((u) => u.id === uid)?.color || '#0f766e';
    }
    return '#0f766e';
  };

  // Calculate space-specific stats
  const spacesStats = workspace.spaces.map((space) => {
    const listIds = [
      ...space.lists.map((l) => l.id),
      ...space.folders.flatMap((f) => f.lists.map((l) => l.id)),
    ];
    const spaceTasks = tasks.filter((t) => listIds.includes(t.listId));
    const done = spaceTasks.filter((t) => t.statusId === 'st-done').length;
    const rate = spaceTasks.length > 0 ? Math.round((done / spaceTasks.length) * 100) : 0;
    const defaultList = space.lists[0];
    return {
      space,
      total: spaceTasks.length,
      done,
      inProgress: spaceTasks.filter((t) => t.statusId === 'st-progress').length,
      inReview: spaceTasks.filter((t) => t.statusId === 'st-review').length,
      rate,
      defaultListId: defaultList ? defaultList.id : '',
    };
  });

  const getSpaceIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'clock': return <Clock className="w-4 h-4" />;
      case 'target': return <Target className="w-4 h-4" />;
      case 'check-square':
      case 'zap': return <Zap className="w-4 h-4" />;
      default: return <CheckSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Drill-down Modal */}
      {drillCategory && (
        <DrillDownModal
          title={getDrillTitle()}
          color={getDrillColor()}
          tasks={getDrillTasks()}
          onClose={closeDrill}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-teal-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-800/10 text-teal-800 font-bold text-[11px] tracking-wide uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Executive Workload &amp; Governance</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">&bull; Company: {workspace.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-teal-800" />
            <span>Workspace Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Click any metric card or status stage to drill into the full interactive task list.
            All items inside are fully actionable.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/w/${workspace.slug}/reports`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:border-teal-700 text-slate-700 hover:text-teal-900 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-102"
          >
            <BarChart3 className="w-4 h-4 text-teal-800" />
            <span>Analytics &amp; Reports</span>
          </Link>
          <Link
            href={`/w/${workspace.slug}/home`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <span>My Personal Agenda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards — all clickable with drill-down */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Workload */}
        <button
          type="button"
          onClick={() => openDrill('all')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left hover:border-slate-400 hover:shadow-md transition-all group cursor-pointer active:scale-98"
          title="Click to drill down into all tasks"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Workload
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalTasks}</span>
            <span className="text-xs text-slate-500 font-medium">tasks active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>TO DO Backlog:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              {todoTasks.length} items
              <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </button>

        {/* KPI 2: In Progress */}
        <button
          type="button"
          onClick={() => openDrill('in-progress')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left hover:border-blue-400 hover:shadow-md hover:bg-blue-50/20 transition-all group cursor-pointer active:scale-98"
          title="Click to drill down into in-progress tasks"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Execution
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{inProgressTasks.length}</span>
            <span className="text-xs text-slate-500 font-medium">in progress</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Contributors:</span>
            <span className="font-bold text-blue-700 flex items-center gap-1">
              {new Set(inProgressTasks.flatMap((t) => t.assigneeIds)).size} members
              <ArrowUpRight className="w-3 h-3 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </button>

        {/* KPI 3: In Review */}
        <button
          type="button"
          onClick={() => openDrill('in-review')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left hover:border-amber-400 hover:shadow-md hover:bg-amber-50/20 transition-all group cursor-pointer active:scale-98"
          title="Click to drill down into tasks awaiting review"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span>Awaiting Review</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{inReviewTasks.length}</span>
            <span className="text-xs text-amber-800 font-semibold bg-amber-100/60 px-1.5 py-0.5 rounded">
              Needs Sign-off
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Authorized Reviewers:</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              Owner / Admin
              <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </button>

        {/* KPI 4: Completion Rate */}
        <button
          type="button"
          onClick={() => openDrill('completed')}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between text-left hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/10 transition-all group cursor-pointer active:scale-98"
          title="Click to drill down into completed tasks"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              ({completedTasks.length} done)
              <ArrowUpRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Critical / Urgent highlight band — clickable */}
      {criticalTasks.length > 0 && (
        <button
          type="button"
          onClick={() => openDrill('critical')}
          className="w-full bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-rose-100/60 hover:border-rose-300 transition-all group text-left"
          title="Click to drill down into critical/overdue tasks"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-rose-900">
                {criticalTasks.length} Critical / Urgent / Overdue Task{criticalTasks.length !== 1 ? 's' : ''}
              </div>
              <div className="text-[11px] text-rose-600">Require immediate attention — click to review</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-rose-400 group-hover:text-rose-700 transition-colors flex-shrink-0" />
        </button>
      )}

      {/* Interactive Phase Progression Stepper Funnel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              <span>Phase Progression Pipeline &amp; Governance Flow</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any stage to drill down into its tasks. Progression is gated: members execute &amp; move to review, while Owner/Admins approve to Complete.
            </p>
          </div>
          {selectedStatusFilter !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('all')}
              className="text-xs text-teal-800 hover:underline font-semibold"
            >
              Reset Stage Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Phase 1: TO DO */}
          <button
            type="button"
            onClick={() => openDrill('todo')}
            className="p-4 rounded-xl border text-left transition-all hover:border-slate-400 hover:shadow-sm hover:bg-slate-50 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>1. TO DO</span>
              </span>
              <span className="text-lg font-black text-slate-800 flex items-center gap-1">
                {todoTasks.length}
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Assigned backlog awaiting work kickoff.</p>
          </button>

          {/* Phase 2: IN PROGRESS */}
          <button
            type="button"
            onClick={() => openDrill('in-progress')}
            className="p-4 rounded-xl border text-left transition-all hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/40 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>2. IN PROGRESS</span>
              </span>
              <span className="text-lg font-black text-blue-700 flex items-center gap-1">
                {inProgressTasks.length}
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Currently being executed by team members.</p>
          </button>

          {/* Phase 3: IN REVIEW */}
          <button
            type="button"
            onClick={() => openDrill('in-review')}
            className="p-4 rounded-xl border text-left transition-all relative overflow-hidden hover:border-amber-300 hover:shadow-sm hover:bg-amber-50/40 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>3. IN REVIEW</span>
              </span>
              <span className="text-lg font-black text-amber-700 flex items-center gap-1">
                {inReviewTasks.length}
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Owner &amp; Admin authorization gate</span>
            </p>
          </button>

          {/* Phase 4: COMPLETE */}
          <button
            type="button"
            onClick={() => openDrill('completed')}
            className="p-4 rounded-xl border text-left transition-all hover:border-emerald-300 hover:shadow-sm hover:bg-emerald-50/40 group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>4. COMPLETE</span>
              </span>
              <span className="text-lg font-black text-emerald-700 flex items-center gap-1">
                {completedTasks.length}
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </div>
            <p className="text-[10px] text-slate-500">Fully signed-off and delivered deliverables.</p>
          </button>
        </div>
      </div>

      {/* Two Columns: Team Capacity Matrix & 4 Core Spaces Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Capacity & Allocation Matrix (All Users) — each row clickable */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-800" />
                  <span>Team Workload &amp; Capacity Matrix</span>
                </h3>
                <span className="text-[11px] text-slate-500">
                  {users.length} Authorized Team Members across {workspace.name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                Active Roster
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {users.map((u) => {
                const userTasks = tasks.filter((t) => t.assigneeIds.includes(u.id));
                const userDone = userTasks.filter((t) => t.statusId === 'st-done').length;
                const userInProgress = userTasks.filter((t) => t.statusId === 'st-progress').length;
                const userInReview = userTasks.filter((t) => t.statusId === 'st-review').length;
                const userRate = userTasks.length > 0 ? Math.round((userDone / userTasks.length) * 100) : 0;
                const isSelected = selectedMemberId === u.id;

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => openDrill(`member-${u.id}`)}
                    title={`Click to see all tasks assigned to ${u.fullName}`}
                    className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-left hover:shadow-sm ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                        : 'border-slate-100 hover:border-teal-200 hover:bg-teal-50/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Avatar user={u} size="sm" showTooltip={false} />
                      <div className="truncate">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {u.role === 'owner' && (
                            <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                              Owner
                            </span>
                          )}
                          {u.role === 'admin' && (
                            <span className="text-[9px] bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {u.role || 'Member'} &bull; @{u.username || u.fullName.toLowerCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-800">
                          {userTasks.length} <span className="text-[10px] text-slate-400 font-normal">tasks</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {userInProgress} in prog &bull; {userInReview} review
                        </div>
                      </div>

                      <div className="w-14 text-right">
                        <span className="text-xs font-bold text-emerald-600">{userRate}%</span>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${userRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedMemberId !== 'all' && (
            <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Filtering by: <strong>{users.find((u) => u.id === selectedMemberId)?.fullName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedMemberId('all')}
                className="text-teal-800 font-bold hover:underline"
              >
                Clear Member Filter
              </button>
            </div>
          )}
        </div>

        {/* 4 Core Spaces Health Tracker */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-teal-800" />
                  <span>Configured Workspace Spaces</span>
                </h3>
                <span className="text-[11px] text-slate-500">Health &amp; velocity across all operational spaces</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {workspace.spaces.length} Active Spaces
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spacesStats.map((st) => {
                const isSelected = selectedSpaceId === st.space.id;
                return (
                  <div
                    key={st.space.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/60 ring-2 ring-teal-700/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-2xs"
                            style={{ backgroundColor: st.space.color }}
                          >
                            {getSpaceIcon(st.space.icon)}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 leading-tight block">
                              {st.space.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {st.total} total items
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-emerald-600">
                          {st.rate}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ backgroundColor: st.space.color, width: `${st.rate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedSpaceId(isSelected ? 'all' : st.space.id)}
                        className="font-bold text-teal-800 hover:underline"
                      >
                        {isSelected ? 'Reset Filter' : 'Filter Tasks'}
                      </button>

                      {st.defaultListId && (
                        <Link
                          href={`/w/${workspace.slug}/v/l/${st.defaultListId}`}
                          className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                        >
                          <span>Open View</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Spaces: {workspace.spaces.map((s) => s.name).join(', ')}</span>
            <Link href={`/w/${workspace.slug}/reports`} className="font-bold text-teal-800 hover:underline">
              View Detailed Velocity &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Filtered Tasks Explorer Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">Task Intelligence Explorer</h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredTasks.length}</strong> of {tasks.length} workspace tasks
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Space Filter Dropdown */}
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Spaces</option>
              {workspace.spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Statuses</option>
              <option value="st-todo">TO DO</option>
              <option value="st-progress">IN PROGRESS</option>
              <option value="st-review">IN REVIEW</option>
              <option value="st-done">COMPLETE</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tasks match the selected filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredTasks.map((t) => {
              const assignedUserObjects = t.assigneeIds
                .map((id) => users.find((u) => u.id === id))
                .filter(Boolean);

              return (
                <div
                  key={t.id}
                  className="px-5 py-3 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                >
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedTaskId(t.id)}
                  >
                    <div className="font-bold text-xs text-slate-900 hover:text-teal-800 truncate mb-1">
                      {t.title}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <PriorityBadge priority={t.priority} showLabel readOnly />
                      {t.dueDate && (
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Due {format(parseISO(t.dueDate), 'MMM d')}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Controls: Task Workflow Stepper & Assignees */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <TaskWorkflowStepper task={t} statuses={defaultStatuses} />
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {assignedUserObjects.map((u: any) => (
                        <Avatar key={u.id} user={u} size="xs" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
