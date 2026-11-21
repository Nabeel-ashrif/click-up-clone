'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  CheckSquare,
  CornerDownRight,
  MessageSquare,
  Check,
  Trash2,
  Calendar,
  Flag,
  UserPlus,
  Maximize2,
  ExternalLink,
  Repeat,
  Bell,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge, priorityConfig } from '../ui/PriorityBadge';
import { AssigneePicker } from '../ui/AssigneePicker';
import { DatePickerPopover } from '../ui/DatePickerPopover';
import { Task, TaskPriority } from '@/lib/types';

export function ListView({ listId }: { listId: string }) {
  const {
    tasks,
    workspace,
    getListById,
    getSpaceById,
    updateTask,
    deleteTask,
    addTask,
    setSelectedTaskId,
    searchFilter,
    selectedPriorityFilter,
    selectedStatusFilter,
    activeGroupBy,
  } = useApp();

  const currentList = getListById(listId);
  const currentSpace = currentList ? getSpaceById(currentList.spaceId) : null;
  const statuses = currentSpace?.statuses || workspace.spaces[0]?.statuses || [];

  // Collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // Expanded subtasks map
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});
  // Quick inline task input per group
  const [inlineTaskInput, setInlineTaskInput] = useState<{ groupId: string; title: string } | null>(
    null
  );

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleSubtaskExpand = (taskId: string) => {
    setExpandedSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleCreateInlineTask = (groupId: string) => {
    if (!inlineTaskInput?.title.trim()) return;

    if (activeGroupBy === 'status') {
      addTask({
        title: inlineTaskInput.title.trim(),
        listId,
        statusId: groupId,
        priority: 'none',
      });
    } else {
      addTask({
        title: inlineTaskInput.title.trim(),
        listId,
        statusId: 'st-todo',
        priority: groupId as TaskPriority,
      });
    }

    setInlineTaskInput(null);
  };

  // Filter tasks belonging to this list (exclude subtasks from top-level list rows)
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

  // Determine groups based on activeGroupBy ('status' or 'priority')
  const groups =
    activeGroupBy === 'status'
      ? statuses.map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          tasks: listTasks.filter((t) => t.statusId === s.id),
        }))
      : (['urgent', 'high', 'normal', 'low', 'none'] as TaskPriority[]).map((p) => ({
          id: p,
          name: priorityConfig[p].label.toUpperCase(),
          color: priorityConfig[p].iconColor,
          tasks: listTasks.filter((t) => t.priority === p),
        }));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {groups.map((group) => {
        const isCollapsed = !!collapsedGroups[group.id];

        return (
          <div
            key={group.id}
            className="border border-slate-200/90 rounded-xl bg-white overflow-hidden shadow-xs transition-shadow hover:shadow-card"
          >
            {/* Status / Priority Group Header */}
            <div
              className="h-11 px-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between cursor-pointer select-none"
              onClick={() => toggleGroup(group.id)}
            >
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <span
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider text-white shadow-2xs"
                  style={{ backgroundColor: group.color }}
                >
                  {group.name}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Add Task Icon Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInlineTaskInput({ groupId: group.id, title: '' });
                }}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-accent font-semibold px-2.5 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
                title="Add task to this group"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Tasks Table */}
            {!isCollapsed && (
              <div className="divide-y divide-slate-100">
                {/* Column Headers */}
                <div className="grid grid-cols-12 px-4 py-2 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <div className="col-span-6">Task Name</div>
                  <div className="col-span-2">Assignees</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Priority</div>
                </div>

                {group.tasks.map((task) => {
                  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
                  const isExpanded = !!expandedSubtasks[task.id];

                  return (
                    <React.Fragment key={task.id}>
                      {/* Main Task Row */}
                      <div className="grid grid-cols-12 items-center px-4 py-2.5 hover:bg-slate-50/80 text-xs transition-colors group">
                        {/* Name + Subtasks trigger + Checkbox + Quick Actions */}
                        <div className="col-span-6 flex items-center gap-2.5 overflow-hidden pr-3">
                          {subtasks.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleSubtaskExpand(task.id)}
                              className="p-1 rounded-md hover:bg-slate-200 text-slate-400 transition-colors"
                              title="Toggle Subtasks"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <div className="w-5" />
                          )}

                          {/* Quick Completion Checkbox Button */}
                          <button
                            type="button"
                            onClick={() =>
                              updateTask(task.id, {
                                statusId: task.statusId === 'st-done' ? 'st-todo' : 'st-done',
                              })
                            }
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                              task.statusId === 'st-done'
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                : 'border-slate-300 hover:border-accent hover:bg-accent/5'
                            }`}
                            title="Mark complete"
                          >
                            {task.statusId === 'st-done' && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          {/* Task Title (Opens Inspector) */}
                          <button
                            type="button"
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`font-semibold text-left truncate hover:text-accent transition-colors ${
                              task.statusId === 'st-done'
                                ? 'line-through text-slate-400 font-normal'
                                : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </button>

                          {/* Recurrence Badge */}
                          {task.recurrence && task.recurrence !== 'none' && (
                            <span
                              title={`Recurring task: ${task.recurrence}`}
                              className="inline-flex items-center gap-0.5 text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold flex-shrink-0"
                            >
                              <Repeat className="w-3 h-3 text-teal-700" />
                              <span className="capitalize">{task.recurrence}</span>
                            </span>
                          )}

                          {/* Reminder Badge */}
                          {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore >= 0 && (
                            <span
                              title="Reminder set"
                              className="inline-flex items-center text-[10px] text-amber-700 bg-amber-50 p-1 rounded border border-amber-200 flex-shrink-0"
                            >
                              <Bell className="w-3 h-3 text-amber-600" />
                            </span>
                          )}

                          {/* Subtasks Count Badge */}
                          {subtasks.length > 0 && (
                            <span className="flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-mono font-semibold flex-shrink-0">
                              <CornerDownRight className="w-3 h-3 text-accent" />
                              {subtasks.filter((s) => s.statusId === 'st-done').length}/{subtasks.length}
                            </span>
                          )}

                          {/* Comments Count Badge */}
                          {task.commentsCount > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0">
                              <MessageSquare className="w-3 h-3" />
                              {task.commentsCount}
                            </span>
                          )}

                          {/* Row Hover Icon Action Buttons */}
                          <div className="hidden group-hover:flex items-center gap-1 ml-auto">
                            <button
                              type="button"
                              onClick={() => setSelectedTaskId(task.id)}
                              className="p-1 rounded text-slate-400 hover:text-accent hover:bg-slate-200/60"
                              title="Inspect Task Details"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Assignees */}
                        <div className="col-span-2">
                          <AssigneePicker
                            assigneeIds={task.assigneeIds}
                            onChange={(assigneeIds) => updateTask(task.id, { assigneeIds })}
                          />
                        </div>

                        {/* Due Date */}
                        <div className="col-span-2">
                          <DatePickerPopover
                            date={task.dueDate}
                            onChange={(dueDate) => updateTask(task.id, { dueDate })}
                          />
                        </div>

                        {/* Priority */}
                        <div className="col-span-2 flex items-center justify-between">
                          <PriorityBadge
                            priority={task.priority}
                            onChange={(priority) => updateTask(task.id, { priority })}
                            showLabel
                          />
                        </div>
                      </div>

                      {/* Subtasks nested rows */}
                      {isExpanded &&
                        subtasks.map((st) => (
                          <div
                            key={st.id}
                            className="grid grid-cols-12 items-center px-4 py-2 bg-slate-50/50 pl-11 hover:bg-slate-100/60 text-xs border-t border-slate-100/80 transition-colors"
                          >
                            <div className="col-span-6 flex items-center gap-2 overflow-hidden pr-2">
                              <CornerDownRight className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <button
                                type="button"
                                onClick={() => setSelectedTaskId(st.id)}
                                className="font-medium text-slate-700 hover:text-accent truncate text-left"
                              >
                                {st.title}
                              </button>
                            </div>
                            <div className="col-span-2">
                              <AssigneePicker
                                assigneeIds={st.assigneeIds}
                                onChange={(assigneeIds) => updateTask(st.id, { assigneeIds })}
                              />
                            </div>
                            <div className="col-span-2">
                              <DatePickerPopover
                                date={st.dueDate}
                                onChange={(dueDate) => updateTask(st.id, { dueDate })}
                              />
                            </div>
                            <div className="col-span-2">
                              <PriorityBadge
                                priority={st.priority}
                                onChange={(priority) => updateTask(st.id, { priority })}
                                showLabel
                              />
                            </div>
                          </div>
                        ))}
                    </React.Fragment>
                  );
                })}

                {/* Inline Add Task Row */}
                {inlineTaskInput?.groupId === group.id ? (
                  <div className="p-3 bg-slate-50 flex items-center gap-2.5">
                    <input
                      type="text"
                      value={inlineTaskInput.title}
                      onChange={(e) =>
                        setInlineTaskInput({ ...inlineTaskInput, title: e.target.value })
                      }
                      placeholder="Task name... (Press Enter to save, Esc to cancel)"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent shadow-xs"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateInlineTask(group.id);
                        if (e.key === 'Escape') setInlineTaskInput(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCreateInlineTask(group.id)}
                      className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover shadow-xs"
                    >
                      Save Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setInlineTaskInput(null)}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setInlineTaskInput({ groupId: group.id, title: '' })}
                    className="w-full text-left px-5 py-2.5 text-xs text-slate-500 hover:text-accent hover:bg-slate-50 flex items-center gap-2 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ New Task</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
