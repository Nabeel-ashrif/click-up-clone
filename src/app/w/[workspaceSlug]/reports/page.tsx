'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Layers,
  ArrowRight,
  Shield,
  FileSpreadsheet,
  PieChart,
  Calendar,
  Target,
  Zap,
  CheckSquare,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { format, parseISO, isPast, isToday } from 'date-fns';

export default function ReportsPage() {
  const { workspace, tasks, users, currentUser, showToast } = useApp();

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'month' | 'week' | 'overdue'>('all');

  // Filter tasks based on selected space and timeframe
  const filteredTasks = tasks.filter((t) => {
    if (selectedSpaceId !== 'all') {
      const space = workspace.spaces.find((s) => s.id === selectedSpaceId);
      const spaceListIds = space ? space.lists.map((l) => l.id) : [];
      if (!spaceListIds.includes(t.listId)) return false;
    }

    if (selectedTimeframe === 'overdue') {
      if (t.statusId === 'st-done' || !t.dueDate) return false;
      try {
        const parsed = parseISO(t.dueDate);
        return isPast(parsed) && !isToday(parsed);
      } catch {
        return false;
      }
    }

    return true;
  });

  // Global calculations
  const totalTasksCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((t) => t.statusId === 'st-done').length;
  const inProgressCount = filteredTasks.filter((t) => t.statusId === 'st-progress').length;
  const inReviewCount = filteredTasks.filter((t) => t.statusId === 'st-review').length;
  const todoCount = filteredTasks.filter((t) => t.statusId === 'st-todo').length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Priority counts
  const urgentCount = filteredTasks.filter((t) => t.priority === 'urgent').length;
  const highCount = filteredTasks.filter((t) => t.priority === 'high').length;
  const normalCount = filteredTasks.filter((t) => t.priority === 'normal').length;
  const lowCount = filteredTasks.filter((t) => t.priority === 'low').length;

  // Space-by-space velocity breakdown
  const spacesReport = workspace.spaces.map((sp) => {
    const listIds = sp.lists.map((l) => l.id);
    const spTasks = filteredTasks.filter((t) => listIds.includes(t.listId));
    const done = spTasks.filter((t) => t.statusId === 'st-done').length;
    const rate = spTasks.length > 0 ? Math.round((done / spTasks.length) * 100) : 0;

    return {
      space: sp,
      total: spTasks.length,
      done,
      inProgress: spTasks.filter((t) => t.statusId === 'st-progress').length,
      inReview: spTasks.filter((t) => t.statusId === 'st-review').length,
      rate,
    };
  });

  // Member-by-member productivity breakdown
  const memberReport = users.map((u) => {
    const assignedTasks = filteredTasks.filter((t) => t.assigneeIds.includes(u.id));
    const done = assignedTasks.filter((t) => t.statusId === 'st-done').length;
    const inProg = assignedTasks.filter((t) => t.statusId === 'st-progress').length;
    const inRev = assignedTasks.filter((t) => t.statusId === 'st-review').length;
    const todo = assignedTasks.filter((t) => t.statusId === 'st-todo').length;
    const overdue = assignedTasks.filter((t) => {
      if (t.statusId === 'st-done' || !t.dueDate) return false;
      try {
        const parsed = parseISO(t.dueDate);
        return isPast(parsed) && !isToday(parsed);
      } catch {
        return false;
      }
    }).length;
    const rate = assignedTasks.length > 0 ? Math.round((done / assignedTasks.length) * 100) : 0;

    return {
      user: u,
      total: assignedTasks.length,
      done,
      inProg,
      inRev,
      todo,
      overdue,
      rate,
    };
  });

  // Export to CSV Functionality
  const handleExportCSV = () => {
    try {
      const headers = ['Task ID', 'Title', 'Space', 'Phase Status', 'Priority', 'Assignees', 'Due Date', 'Created At'];
      const rows = filteredTasks.map((t) => {
        const space = workspace.spaces.find((s) => s.lists.some((l) => l.id === t.listId));
        const assigneeNames = t.assigneeIds
          .map((id) => users.find((u) => u.id === id)?.fullName || id)
          .join('; ');

        return [
          t.id,
          `"${t.title.replace(/"/g, '""')}"`,
          `"${space ? space.name : 'Unknown'}"`,
          t.statusId,
          t.priority,
          `"${assigneeNames}"`,
          t.dueDate || 'N/A',
          t.createdAt,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${workspace.slug}-executive-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Executive CSV Report exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Failed to export CSV report');
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full print:p-0">
      {/* Top Header & Export Controls */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-indigo-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:border-none print:shadow-none">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-800 text-white font-bold text-[11px] tracking-wide uppercase flex items-center gap-1.5 shadow-2xs">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Reporting Suite</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">&bull; Company: {workspace.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Performance & Cross-Space Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Quantitative velocity audits, team member productivity metrics, and phase completion rates across all 4 operational spaces.
          </p>
        </div>

        {/* Action Buttons: Export CSV & Print */}
        <div className="flex items-center gap-2.5 flex-wrap print:hidden">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-102 active:scale-98"
            title="Download CSV for spreadsheet analysis"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-colors"
            title="Print or Save PDF Executive Briefing"
          >
            <Printer className="w-4 h-4" />
            <span>Print Brief</span>
          </button>
        </div>
      </div>

      {/* Dynamic Multi-Dimensional Filter Bar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-teal-800" />
          <span className="font-bold text-slate-800">Filter Analytics:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          {/* Space Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Space:</span>
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All 4 Spaces</option>
              {workspace.spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Timeframe:</span>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="overdue">Overdue Items Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top 4 Performance Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Deliverables
          </span>
          <div className="text-3xl font-black text-slate-900">{totalTasksCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active across filtered view</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Overall Completion Rate
          </span>
          <div className="text-3xl font-black text-emerald-600">{completionRate}%</div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Review Gate Backlog
          </span>
          <div className="text-3xl font-black text-amber-600">{inReviewCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold mt-1 block">
            Awaiting Owner / Admin Approval
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Team Members
          </span>
          <div className="text-3xl font-black text-teal-800">{users.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 block">100% unlocked seats</span>
        </div>
      </div>

      {/* Module 1: Team Member Productivity Matrix (Exhaustive Enterprise Table) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-800" />
              <span>Team Member Productivity & Performance Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Individual task load, execution progress, review submissions, and completion rates across all 9 roster members.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
            9 Members Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfbf9] text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Team Member</th>
                <th className="px-4 py-3">Role Status</th>
                <th className="px-4 py-3 text-center">Assigned</th>
                <th className="px-4 py-3 text-center">To Do</th>
                <th className="px-4 py-3 text-center">In Progress</th>
                <th className="px-4 py-3 text-center">In Review</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3 text-center">Overdue</th>
                <th className="px-6 py-3 text-right">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {memberReport.map((m) => (
                <tr key={m.user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar user={m.user} size="sm" showTooltip={false} />
                      <div>
                        <div className="font-bold text-slate-900">{m.user.fullName}</div>
                        <div className="text-[10px] text-slate-400">@{m.user.username || m.user.fullName.toLowerCase()}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        m.user.role === 'owner'
                          ? 'bg-amber-100 text-amber-900'
                          : m.user.role === 'admin'
                          ? 'bg-blue-100 text-blue-900'
                          : m.user.role === 'viewer'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {m.user.role === 'owner' ? 'Space Owner' : m.user.role || 'Member'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold">{m.total}</td>
                  <td className="px-4 py-3.5 text-center text-slate-500 font-medium">{m.todo}</td>
                  <td className="px-4 py-3.5 text-center text-blue-600 font-bold">{m.inProg}</td>
                  <td className="px-4 py-3.5 text-center text-amber-600 font-bold">{m.inRev}</td>
                  <td className="px-4 py-3.5 text-center text-emerald-600 font-bold">{m.done}</td>
                  <td className="px-4 py-3.5 text-center">
                    {m.overdue > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {m.overdue}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">0</span>
                    )}
                  </td>

                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-bold text-emerald-600">{m.rate}%</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${m.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module 2 & 3: Space Velocity & Priority Risk Index */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Space Completion Velocity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-800" />
                <span>Space Velocity Comparison (4 Core Spaces)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Completion %</span>
            </div>

            <div className="space-y-4">
              {spacesReport.map((sr) => (
                <div key={sr.space.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: sr.space.color }}
                      />
                      <span>{sr.space.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">
                        {sr.done} / {sr.total} tasks
                      </span>
                      <span className="font-black text-emerald-600">{sr.rate}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        backgroundColor: sr.space.color,
                        width: `${sr.rate}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-6 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Spaces configured: Daily Tasks, Monthly Tasks, Yearly Tasks, On-Off</span>
            <span className="font-bold text-teal-800">Operational Parity: 100%</span>
          </div>
        </div>

        {/* Priority & Risk Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-800" />
                <span>Priority & Risk Allocation Index</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">By Severity</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                  Urgent Priority
                </span>
                <span className="text-2xl font-black text-rose-800">{urgentCount}</span>
                <span className="text-[10px] text-rose-600 block mt-1">Requires immediate execution</span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block mb-1">
                  High Priority
                </span>
                <span className="text-2xl font-black text-amber-800">{highCount}</span>
                <span className="text-[10px] text-amber-600 block mt-1">Sprint critical path</span>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">
                  Normal Priority
                </span>
                <span className="text-2xl font-black text-blue-800">{normalCount}</span>
                <span className="text-[10px] text-blue-600 block mt-1">Standard deliverables</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Low Priority
                </span>
                <span className="text-2xl font-black text-slate-700">{lowCount}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Backlog buffer</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Quality Audit Status:</span>
            <strong className="text-emerald-700 font-bold">Compliant & Tracked</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
