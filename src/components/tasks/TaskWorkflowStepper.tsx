'use client';

import React from 'react';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Lock,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Task, Status } from '@/lib/types';
import { useApp } from '@/lib/store';
import { canTransitionTaskStatus } from '@/lib/permissions';

interface TaskWorkflowStepperProps {
  task: Task;
  statuses: Status[];
}

export function TaskWorkflowStepper({ task, statuses }: TaskWorkflowStepperProps) {
  const { currentUser, updateTask, showToast } = useApp();

  // Sort statuses by orderIndex
  const sortedStatuses = [...statuses].sort((a, b) => a.orderIndex - b.orderIndex);

  const currentIndex = sortedStatuses.findIndex((s) => s.id === task.statusId);
  const currentStatus = sortedStatuses[currentIndex] || sortedStatuses[0];
  const nextStatus = currentIndex >= 0 && currentIndex < sortedStatuses.length - 1
    ? sortedStatuses[currentIndex + 1]
    : null;

  const handleStageClick = (targetStatus: Status) => {
    if (targetStatus.id === task.statusId) return;

    const check = canTransitionTaskStatus(task, targetStatus, currentUser);
    if (!check.allowed) {
      showToast(check.reason || 'Permission denied: You are not authorized for this stage.');
      return;
    }

    updateTask(task.id, { statusId: targetStatus.id });
    showToast(`Task moved to stage: ${targetStatus.name}`);
  };

  const nextCheck = nextStatus
    ? canTransitionTaskStatus(task, nextStatus, currentUser)
    : null;

  return (
    <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
      {/* Header with Phase label and Next Stage Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
            Phase Lifecycle
          </span>
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span>Stage:</span>
            <span
              className="px-2 py-0.5 rounded-md font-bold text-white text-[11px] uppercase tracking-wider"
              style={{ backgroundColor: currentStatus.color }}
            >
              {currentStatus.name}
            </span>
          </span>
        </div>

        {/* Quick Advance Button */}
        {nextStatus && (
          <button
            type="button"
            onClick={() => handleStageClick(nextStatus)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
              nextCheck?.allowed
                ? 'bg-teal-800 hover:bg-teal-900 text-white hover:scale-101 active:scale-98'
                : 'bg-slate-200 text-slate-500 hover:bg-slate-300/80 cursor-not-allowed'
            }`}
            title={nextCheck?.allowed ? `Advance to ${nextStatus.name}` : nextCheck?.reason}
          >
            {nextCheck?.allowed ? (
              <>
                <span>Advance to {nextStatus.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Advance Locked</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Stepper Pipeline Tracks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sortedStatuses.map((st, index) => {
          const isCurrent = st.id === task.statusId;
          const isCompleted = currentIndex > index;
          const isFuture = currentIndex < index;
          const check = canTransitionTaskStatus(task, st, currentUser);
          const isLocked = !check.allowed;

          let cardStyle = 'border-slate-200 bg-white hover:border-slate-300';
          if (isCurrent) {
            cardStyle = 'ring-2 ring-offset-1 bg-white shadow-xs';
          } else if (isCompleted) {
            cardStyle = 'border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50';
          }

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStageClick(st)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all group relative ${cardStyle}`}
              style={{
                borderColor: isCurrent ? st.color : undefined,
                ...(isCurrent ? { boxShadow: `0 0 0 1px ${st.color}` } : {}),
              }}
              title={isLocked ? check.reason : `Click to move to ${st.name}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  0{index + 1}
                </span>

                {isLocked ? (
                  <span className="p-0.5 rounded bg-amber-50 text-amber-600" title={check.reason}>
                    <Lock className="w-3 h-3" />
                  </span>
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : isCurrent ? (
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-ping"
                    style={{ backgroundColor: st.color }}
                  />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />
                )}
              </div>

              <div>
                <div
                  className={`text-xs font-bold uppercase tracking-wider truncate mb-0.5 ${
                    isCurrent ? 'text-slate-900' : 'text-slate-700'
                  }`}
                  style={{ color: isCurrent ? st.color : undefined }}
                >
                  {st.name}
                </div>

                <div className="text-[10px] text-slate-400 truncate font-medium">
                  {st.type === 'open' && 'Open to Team'}
                  {st.type === 'in_progress' && 'Assignee Work'}
                  {st.type === 'review' && 'Review & QA'}
                  {st.type === 'done' && 'Owner / Admin Sign-off'}
                  {st.type === 'closed' && 'Closed'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Role & Stage Guidance Note */}
      <div className="text-[11px] text-slate-500 bg-white border border-slate-200/80 px-3 py-2 rounded-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden truncate">
          <ShieldCheck className="w-4 h-4 text-teal-800 flex-shrink-0" />
          <span className="truncate">
            {currentStatus.type === 'open' && (
              <>Assignees can claim and move this task to <strong>IN PROGRESS</strong>.</>
            )}
            {currentStatus.type === 'in_progress' && (
              <>Work ongoing. Assigned team members can submit for <strong>IN REVIEW</strong> when ready.</>
            )}
            {currentStatus.type === 'review' && (
              <>Awaiting verification: Only <strong>Workspace Owners</strong> and <strong>Admins</strong> can approve and mark <strong>COMPLETE</strong>.</>
            )}
            {currentStatus.type === 'done' && (
              <>Task approved and <strong>COMPLETED</strong>. Owners and Admins can reopen if revisions are needed.</>
            )}
          </span>
        </div>

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Your Role: <span className="text-teal-800 capitalize">{currentUser.role || 'Member'}</span>
        </div>
      </div>
    </div>
  );
}
