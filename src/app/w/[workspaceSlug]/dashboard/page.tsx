'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Avatar } from '@/components/ui/Avatar';
import { TaskWorkflowStepper } from '@/components/tasks/TaskWorkflowStepper';
import { defaultStatuses } from '@/lib/mock-data';
import { format, parseISO, isPast, isToday } from 'date-fns';

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

  // Filter tasks based on space, status, and member selection
  const filteredTasks = tasks.filter((t) => {
    if (selectedSpaceId !== 'all') {
      const space = workspace.spaces.find((s) => s.id === selectedSpaceId);
      const spaceListIds = space ? space.lists.map((l) => l.id) : [];
      if (!spaceListIds.includes(t.listId)) return false;
    }
    if (selectedStatusFilter !== 'all' && t.statusId !== selectedStatusFilter) {
      return false;
    }
    if (selectedMemberId !== 'all' && !t.assigneeIds.includes(selectedMemberId)) {
      return false;
    }
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

  // Calculate space-specific stats for the 4 spaces
  const spacesStats = workspace.spaces.map((space) => {
    const listIds = space.lists.map((l) => l.id);
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

  // Space icons mapping
  const getSpaceIcon = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
        return <Calendar className="w-4 h-4" />;
      case 'clock':
        return <Clock className="w-4 h-4" />;
      case 'target':
        return <Target className="w-4 h-4" />;
      case 'check-square':
      case 'zap':
        return <Zap className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-teal-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-800/10 text-teal-800 font-bold text-[11px] tracking-wide uppercase flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Executive Workload & Governance</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">&bull; Company: {workspace.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-teal-800" />
            <span>Workspace Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time stage transitions, team capacity allocation, and cross-space completion velocity for{' '}
            <strong className="text-slate-800">{workspace.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/w/${workspace.slug}/reports`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:border-teal-700 text-slate-700 hover:text-teal-900 rounded-xl text-xs font-bold shadow-2xs transition-all hover:scale-102"
          >
            <BarChart3 className="w-4 h-4 text-teal-800" />
            <span>Analytics & Reports</span>
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

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Workload */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Workload
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalTasks}</span>
            <span className="text-xs text-slate-500 font-medium">tasks active</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>TO DO Backlog:</span>
            <span className="font-bold text-slate-800">{todoTasks.length} items</span>
          </div>
        </div>

        {/* KPI 2: In Progress */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              In Execution
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">{inProgressTasks.length}</span>
            <span className="text-xs text-slate-500 font-medium">in progress</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Contributors:</span>
            <span className="font-bold text-blue-700">
              {new Set(inProgressTasks.flatMap((t) => t.assigneeIds)).size} members
            </span>
          </div>
        </div>

        {/* KPI 3: In Review (Crucial for Owner/Admin Sign-off) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span>Awaiting Review</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
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
            <span className="font-bold text-slate-800">Space Owner / Admin</span>
          </div>
        </div>

        {/* KPI 4: Completion Rate */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Completion Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
            <span className="text-xs text-slate-500 font-medium">({completedTasks.length} done)</span>
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
        </div>
      </div>

      {/* Interactive Phase Progression Stepper Funnel */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-800" />
              <span>Phase Progression Pipeline & Governance Flow</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Click any stage below to filter tasks. Progression is gated: members execute & move to review, while Owner/Admins approve to Complete.
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
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'st-todo' ? 'all' : 'st-todo')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedStatusFilter === 'st-todo'
                ? 'border-slate-800 bg-slate-100 ring-2 ring-slate-800/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>1. TO DO</span>
              </span>
              <span className="text-lg font-black text-slate-800">{todoTasks.length}</span>
            </div>
            <p className="text-[10px] text-slate-500">Assigned backlog awaiting work kickoff.</p>
          </button>

          {/* Phase 2: IN PROGRESS */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'st-progress' ? 'all' : 'st-progress')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedStatusFilter === 'st-progress'
                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>2. IN PROGRESS</span>
              </span>
              <span className="text-lg font-black text-blue-700">{inProgressTasks.length}</span>
            </div>
            <p className="text-[10px] text-slate-500">Currently being executed by team members.</p>
          </button>

          {/* Phase 3: IN REVIEW */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'st-review' ? 'all' : 'st-review')}
            className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
              selectedStatusFilter === 'st-review'
                ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20'
                : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>3. IN REVIEW</span>
              </span>
              <span className="text-lg font-black text-amber-700">{inReviewTasks.length}</span>
            </div>
            <p className="text-[10px] text-amber-800 font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Owner & Admin authorization gate</span>
            </p>
          </button>

          {/* Phase 4: COMPLETE */}
          <button
            type="button"
            onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'st-done' ? 'all' : 'st-done')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedStatusFilter === 'st-done'
                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20'
                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>4. COMPLETE</span>
              </span>
              <span className="text-lg font-black text-emerald-700">{completedTasks.length}</span>
            </div>
            <p className="text-[10px] text-slate-500">Fully signed-off and delivered deliverables.</p>
          </button>
        </div>
      </div>

      {/* Two Columns: Team Capacity Matrix & 4 Core Spaces Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Capacity & Allocation Matrix (All 9 Users) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-800" />
                  <span>Team Workload & Capacity Matrix</span>
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
                  <div
                    key={u.id}
                    onClick={() => setSelectedMemberId(isSelected ? 'all' : u.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
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
                  </div>
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
                <span className="text-[11px] text-slate-500">Health & velocity across all 4 operational spaces</span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                4 Active Spaces
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
                          style={{
                            backgroundColor: st.space.color,
                            width: `${st.rate}%`,
                          }}
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
            <span>Spaces configured: Daily Tasks, Monthly Tasks, Yearly Tasks, On-Off</span>
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
              <option value="all">All Spaces (4 Spaces)</option>
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
              <option value="all">All Statuses (4 Phases)</option>
              <option value="st-todo">TO DO</option>
              <option value="st-progress">IN PROGRESS</option>
              <option value="st-review">IN REVIEW (Sign-off)</option>
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
