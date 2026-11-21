'use client';

import React, { useState } from 'react';
import {
  Plus,
  CornerDownRight,
  CheckSquare,
  MessageSquare,
  Calendar,
  X,
  GripVertical,
  Repeat,
  Bell,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { PriorityBadge } from '../ui/PriorityBadge';
import { AvatarGroup } from '../ui/Avatar';
import { Task, User } from '@/lib/types';
import { format, isPast, isToday, parseISO } from 'date-fns';

export function BoardView({ listId }: { listId: string }) {
  const {
    tasks,
    users,
    workspace,
    getListById,
    getSpaceById,
    updateTask,
    addTask,
    setSelectedTaskId,
    searchFilter,
    selectedPriorityFilter,
    selectedStatusFilter,
  } = useApp();

  const currentList = getListById(listId);
  const currentSpace = currentList ? getSpaceById(currentList.spaceId) : null;
  const statuses = currentSpace?.statuses || workspace.spaces[0]?.statuses || [];

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
  const [inlineCardCol, setInlineCardCol] = useState<string | null>(null);
  const [inlineCardTitle, setInlineCardTitle] = useState('');

  // Filter tasks belonging to this list (exclude subtasks from top cards)
  const listTasks = tasks.filter((t) => {
    const matchesList = t.listId === listId && !t.parentTaskId;
    if (!matchesList) return false;

    // Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchesTitle && !matchesTags) return false;
    }

    // Priority filter
    if (selectedPriorityFilter !== 'all' && t.priority !== selectedPriorityFilter) {
      return false;
    }

    // Status filter
    if (selectedStatusFilter !== 'all' && t.statusId !== selectedStatusFilter) {
      return false;
    }

    return true;
  });

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (dragOverColumnId !== statusId) {
      setDragOverColumnId(statusId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, statusId: string) => {
    if (dragOverColumnId === statusId) {
      setDragOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatusId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTask(taskId, { statusId: targetStatusId });
    }
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  };

  const handleAddCard = (statusId: string) => {
    if (!inlineCardTitle.trim()) return;
    addTask({
      title: inlineCardTitle.trim(),
      listId,
      statusId,
      priority: 'none',
    });
    setInlineCardTitle('');
    setInlineCardCol(null);
  };

  return (
    <div className="flex-1 overflow-x-auto p-5 flex gap-5 items-start select-none bg-slate-50/40">
      {statuses.map((status) => {
        const colTasks = listTasks.filter((t) => t.statusId === status.id);
        const isDragTarget = dragOverColumnId === status.id;

        return (
          <div
            key={status.id}
            onDragOver={(e) => handleDragOver(e, status.id)}
            onDragLeave={(e) => handleDragLeave(e, status.id)}
            onDrop={(e) => handleDrop(e, status.id)}
            className={`w-80 flex-shrink-0 bg-slate-100/70 border rounded-xl flex flex-col max-h-[calc(100vh-140px)] transition-all ${
              isDragTarget
                ? 'border-accent bg-accent/5 ring-2 ring-accent/30 shadow-md'
                : 'border-slate-200/90 shadow-2xs'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 bg-white rounded-t-xl shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-xs"
                  style={{ backgroundColor: status.color }}
                />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  {status.name}
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shadow-2xs">
                  {colTasks.length}
                </span>
              </div>

              {/* Add Task Icon Button */}
              <button
                type="button"
                onClick={() => setInlineCardCol(status.id)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                title="Add Card to this column"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
              {colTasks.map((task) => {
                const assignedUsers = task.assigneeIds
                  .map((id) => users.find((u) => u.id === id))
                  .filter((u): u is User => !!u);

                const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
                const isBeingDragged = draggedTaskId === task.id;

                let formattedDate: string | null = null;
                let isOverdue = false;
                if (task.dueDate) {
                  try {
                    const parsed = parseISO(task.dueDate);
                    formattedDate = format(parsed, 'MMM d');
                    isOverdue = isPast(parsed) && !isToday(parsed);
                  } catch {
                    formattedDate = task.dueDate;
                  }
                }

                // Checklists progress
                const allChecklistItems = task.checklists.flatMap((c) => c.items);
                const completedItems = allChecklistItems.filter((i) => i.isCompleted).length;
                const totalItems = allChecklistItems.length;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-3.5 bg-white border rounded-xl shadow-xs hover:shadow-card hover:border-accent/60 cursor-pointer transition-all group ${
                      isBeingDragged
                        ? 'opacity-40 border-dashed border-accent rotate-1'
                        : 'border-slate-200/90'
                    }`}
                  >
                    {/* Tags */}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.map((tg) => (
                          <span
                            key={tg}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                          >
                            #{tg}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Task Title */}
                    <div className="font-semibold text-xs text-slate-900 leading-snug mb-3 group-hover:text-accent transition-colors">
                      {task.title}
                    </div>

                    {/* Mini Checklist Progress Bar */}
                    {totalItems > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="w-3 h-3 text-emerald-600" />
                            <span>Checklist</span>
                          </span>
                          <span>
                            {completedItems}/{totalItems}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${(completedItems / totalItems) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer indicators */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* Priority */}
                        <PriorityBadge priority={task.priority} readOnly />

                        {/* Recurrence badge */}
                        {task.recurrence && task.recurrence !== 'none' && (
                          <span
                            title={`Repeats: ${task.recurrence}`}
                            className="p-1 rounded bg-teal-50 text-teal-800 border border-teal-200"
                          >
                            <Repeat className="w-3 h-3 text-teal-700" />
                          </span>
                        )}

                        {/* Reminder badge */}
                        {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore >= 0 && (
                          <span
                            title="Reminder armed"
                            className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            <Bell className="w-3 h-3 text-amber-600" />
                          </span>
                        )}

                        {/* Due Date */}
                        {formattedDate && (
                          <span
                            className={`flex items-center gap-1 text-[11px] font-semibold ${
                              isOverdue ? 'text-red-600' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                          </span>
                        )}

                        {/* Subtasks counter */}
                        {subtasks.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-500 font-mono">
                            <CornerDownRight className="w-3 h-3" />
                            {subtasks.filter((s) => s.statusId === 'st-done').length}/{subtasks.length}
                          </span>
                        )}

                        {/* Comments */}
                        {task.commentsCount > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <MessageSquare className="w-3 h-3" />
                            {task.commentsCount}
                          </span>
                        )}
                      </div>

                      {/* Assignees */}
                      <AvatarGroup users={assignedUsers} size="xs" max={2} />
                    </div>
                  </div>
                );
              })}

              {/* Inline card addition */}
              {inlineCardCol === status.id ? (
                <div className="p-3 bg-white border border-accent rounded-xl shadow-md">
                  <textarea
                    value={inlineCardTitle}
                    onChange={(e) => setInlineCardTitle(e.target.value)}
                    placeholder="What needs to be done? (Enter to save)"
                    rows={2}
                    className="w-full text-xs p-1 outline-none resize-none text-slate-900"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddCard(status.id);
                      }
                      if (e.key === 'Escape') setInlineCardCol(null);
                    }}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleAddCard(status.id)}
                      className="px-3 py-1 text-xs bg-accent text-white rounded-md font-semibold hover:bg-accent-hover shadow-xs"
                    >
                      Save Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineCardCol(null)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setInlineCardCol(status.id)}
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-accent hover:bg-white rounded-xl flex items-center justify-center gap-1.5 transition-all border border-dashed border-slate-200 hover:border-accent hover:shadow-2xs font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
