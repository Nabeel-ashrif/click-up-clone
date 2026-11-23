'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckSquare,
  Calendar,
  Flag,
  UserPlus,
  Folder,
  Repeat,
  Bell,
  Layers,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { canUserViewTask } from '@/lib/permissions';
import { TaskPriority, RecurrenceType } from '@/lib/types';
import { PriorityBadge } from '../ui/PriorityBadge';
import { StatusBadge } from '../ui/StatusBadge';
import { AssigneePicker } from '../ui/AssigneePicker';
import { DatePickerPopover } from '../ui/DatePickerPopover';

export function QuickAddTaskModal() {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    workspace,
    tasks,
    currentUser,
    addTask,
  } = useApp();

  // 1. Filter ONLY assigned/permitted spaces that are active (not archived)
  const accessibleSpaces = workspace.spaces.filter((space) => {
    if (space.isArchived) return false;
    if (!space.isPrivate) return true;
    if (currentUser.role === 'owner') return true;
    return (
      space.allowedMemberIds?.includes(currentUser.id) ||
      space.allowedMemberIds?.includes(currentUser.username || '')
    );
  });

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(
    accessibleSpaces[0]?.id || ''
  );

  // Keep selectedSpaceId valid when accessibleSpaces updates
  useEffect(() => {
    if (
      (!selectedSpaceId || !accessibleSpaces.some((s) => s.id === selectedSpaceId)) &&
      accessibleSpaces.length > 0
    ) {
      setSelectedSpaceId(accessibleSpaces[0].id);
    }
  }, [accessibleSpaces, selectedSpaceId]);

  const currentSpace =
    accessibleSpaces.find((s) => s.id === selectedSpaceId) || accessibleSpaces[0];

  // Lists in the currently selected space
  const spaceLists = currentSpace
    ? [
        ...currentSpace.lists.map((l) => ({ ...l, folderName: '' })),
        ...currentSpace.folders.flatMap((f) =>
          f.lists.map((l) => ({ ...l, folderName: f.name }))
        ),
      ]
    : [];

  const spaceListIds = spaceLists.map((l) => l.id);

  // Available tasks in this space to optionally attach as a subtask
  const spaceTasks = tasks.filter(
    (t) => spaceListIds.includes(t.listId) && !t.parentTaskId && canUserViewTask(t, currentUser)
  );

  // Destination Choice: 'list:<listId>' (new top-level task) OR 'parent:<taskId>' (subtask)
  const defaultChoice = spaceLists[0] ? `list:${spaceLists[0].id}` : '';
  const [destinationChoice, setDestinationChoice] = useState<string>(defaultChoice);

  useEffect(() => {
    if (spaceLists[0]) {
      setDestinationChoice(`list:${spaceLists[0].id}`);
    }
  }, [selectedSpaceId]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [statusId, setStatusId] = useState('st-todo');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([currentUser.id]);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(-1);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destinationChoice) return;

    let targetListId = spaceLists[0]?.id || '';
    let parentTaskId: string | undefined = undefined;

    if (destinationChoice.startsWith('parent:')) {
      parentTaskId = destinationChoice.replace('parent:', '');
      const parent = tasks.find((t) => t.id === parentTaskId);
      if (parent) {
        targetListId = parent.listId;
      }
    } else if (destinationChoice.startsWith('list:')) {
      targetListId = destinationChoice.replace('list:', '');
    }

    const newTask = addTask({
      title: title.trim(),
      listId: targetListId,
      parentTaskId,
      priority,
      statusId,
      assigneeIds,
      dueDate,
      recurrence,
      reminderMinutesBefore: reminderMinutesBefore >= 0 ? reminderMinutesBefore : undefined,
    });

    // Reset and close — do NOT auto-open the detail drawer
    setTitle('');
    setDescription('');
    setRecurrence('none');
    setReminderMinutesBefore(-1);
    setIsQuickAddOpen(false);
    // Task is accessible via the list; user can click it to inspect
    void newTask;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs overflow-y-auto p-3 sm:p-4 flex justify-center items-start sm:items-center animate-in fade-in duration-100"
      onClick={() => setIsQuickAddOpen(false)}
    >
      <div
        className="w-full max-w-xl my-auto bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f8f7f4] border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">Create New Task</h3>
              <p className="text-[11px] text-slate-500">
                Organize, schedule, and assign tasks across your workspace
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Dual Hierarchy Dropdowns: Space & Destination / Parent Task */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            {/* Dropdown 1: Assigned / Permitted Space */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-800" />
                <span>Assigned Space</span>
              </label>
              <select
                value={selectedSpaceId}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 shadow-2xs"
              >
                {accessibleSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name} {space.isPrivate ? '(Restricted)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown 2: Choose Target List or Existing Task in that Space */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CornerDownRight className="w-3.5 h-3.5 text-teal-800" />
                <span>Task Location / Parent</span>
              </label>
              <select
                value={destinationChoice}
                onChange={(e) => setDestinationChoice(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 shadow-2xs"
              >
                {/* Option Group 1: New Tasks in Lists */}
                <optgroup label="── Create New Task in List ──">
                  {spaceLists.map((list) => (
                    <option key={`list:${list.id}`} value={`list:${list.id}`}>
                      {list.folderName ? `${list.folderName} > ` : ''}
                      {list.name}
                    </option>
                  ))}
                </optgroup>

                {/* Option Group 2: Attach as Subtask under existing tasks in this space */}
                {spaceTasks.length > 0 && (
                  <optgroup label="── Attach as Subtask under ──">
                    {spaceTasks.map((t) => (
                      <option key={`parent:${t.id}`} value={`parent:${t.id}`}>
                        ↳ Subtask: &quot;{t.title.length > 32 ? t.title.slice(0, 32) + '...' : t.title}&quot;
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Task Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement user authentication endpoint..."
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-700/40 focus:border-teal-700 shadow-2xs font-medium"
              autoFocus
              required
            />
          </div>

          {/* Recurrence & Reminder Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-amber-50/40 border border-amber-200/80 rounded-xl">
            {/* Recurring Schedule Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-teal-800" />
                <span>Recurring Schedule</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily (Every day)</option>
                <option value="weekly">Weekly (Every 7 days)</option>
                <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                <option value="monthly">Monthly (Every month)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Auto-schedules next cycle when marked complete.
              </span>
            </div>

            {/* Reminder Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>Reminder</span>
              </label>
              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(parseInt(e.target.value, 10))}
                className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="-1">No reminder</option>
                <option value="0">At time of due date</option>
                <option value="10">10 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Triggers in-app alerts prior to deadline.
              </span>
            </div>
          </div>

          {/* Metadata Controls Bar: Status, Priority, Due Date, Assignees */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Status:</span>
                <StatusBadge statusId={statusId} onChange={setStatusId} dropUp />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Priority:</span>
                <PriorityBadge priority={priority} onChange={setPriority} showLabel dropUp />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Due:</span>
                <DatePickerPopover date={dueDate} onChange={setDueDate} dropUp />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Assign:</span>
              <AssigneePicker assigneeIds={assigneeIds} onChange={setAssigneeIds} dropUp align="right" />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white shadow-sm disabled:opacity-50 transition-all hover:scale-101 active:scale-98"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
