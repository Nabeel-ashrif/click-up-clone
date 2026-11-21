'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  CheckSquare,
  MessageSquare,
  Send,
  Clock,
  Tag,
  CornerDownRight,
  ChevronRight,
  Copy,
  Check,
  Play,
  Pause,
  Paperclip,
  Share2,
  FileText,
  AlertCircle,
  Bold,
  Code,
  List,
  Repeat,
  Bell,
  Edit3,
  Save,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { StatusBadge } from '../ui/StatusBadge';
import { PriorityBadge } from '../ui/PriorityBadge';
import { AssigneePicker } from '../ui/AssigneePicker';
import { DatePickerPopover } from '../ui/DatePickerPopover';
import { Avatar } from '../ui/Avatar';
import { Task } from '@/lib/types';

export function TaskDetailDrawer() {
  const {
    selectedTaskId,
    setSelectedTaskId,
    tasks,
    updateTask,
    deleteTask,
    addTask,
    toggleChecklistItem,
    addChecklistItem,
    addComment,
    currentUser,
    getListById,
    getSpaceById,
    showToast,
  } = useApp();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');

  if (!selectedTaskId) return null;

  const task = tasks.find((t) => t.id === selectedTaskId);
  if (!task) return null;

  useEffect(() => {
    if (task) {
      setTitleDraft(task.title);
      setDescriptionDraft(task.description);
    }
  }, [task?.id, task?.title, task?.description]);

  const handleSaveTask = () => {
    const cleanTitle = titleDraft.trim() || task.title;
    updateTask(task.id, {
      title: cleanTitle,
      description: descriptionDraft,
    });
    setIsSaved(true);
    showToast('Task saved successfully');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const list = getListById(task.listId);
  const space = list ? getSpaceById(list.spaceId) : null;

  // Subtasks
  const subtasks = tasks.filter((t) => t.parentTaskId === task.id);
  const completedSubtasks = subtasks.filter((s) => s.statusId === 'st-done').length;
  const subtasksPercent = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

  // Checklists
  const allChecklistItems = task.checklists.flatMap((c) => c.items);
  const completedItems = allChecklistItems.filter((i) => i.isCompleted).length;
  const checklistPercent =
    allChecklistItems.length > 0 ? (completedItems / allChecklistItems.length) * 100 : 0;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addTask({
      title: newSubtaskTitle.trim(),
      listId: task.listId,
      parentTaskId: task.id,
      priority: 'none',
      statusId: 'st-todo',
      assigneeIds: task.assigneeIds,
    });
    setNewSubtaskTitle('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment(task.id, newComment.trim());
    setNewComment('');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    if (!task.tags.includes(tag)) {
      updateTask(task.id, { tags: [...task.tags, tag] });
      showToast(`Tag #${tag} added`);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const removeTag = (tagToRemove: string) => {
    updateTask(task.id, { tags: task.tags.filter((t) => t !== tagToRemove) });
  };

  const copyTaskLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('Task link copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      updateTask(task.id, {
        timeSpentMinutes: (task.timeSpentMinutes || 0) + 15,
      });
      showToast('15m recorded on task');
    } else {
      setIsTimerRunning(true);
      showToast('Timer started');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-100"
      onClick={() => setSelectedTaskId(null)}
    >
      <div
        className="w-full max-w-4xl h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar with Icon Buttons */}
        <div className="h-14 px-6 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 bg-slate-50/70">
          {/* Breadcrumb pills */}
          <div className="flex items-center gap-2 text-xs">
            {space && (
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: space.color }} />
                {space.name}
              </span>
            )}
            {list && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700">{list.name}</span>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[11px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold">
              {task.id}
            </span>
          </div>

          {/* Action Icon Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => setIsEditingTitle(!isEditingTitle)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isEditingTitle
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Toggle Edit Mode"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEditingTitle ? 'Editing' : 'Edit'}</span>
            </button>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveTask}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                isSaved ? 'bg-emerald-600' : 'bg-teal-800 hover:bg-teal-900 active:scale-95'
              }`}
              title="Save Task Changes"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved!' : 'Save'}</span>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={copyTaskLink}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
              title="Copy Task Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Title, Description, Subtasks, Checklists, Comments */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Task Title Input */}
            <div className="relative group">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTask}
                className="w-full text-xl font-bold text-slate-900 border border-transparent hover:border-slate-300 focus:border-teal-700 focus:bg-white rounded-lg px-3 py-1.5 outline-none transition-all"
                placeholder="Task title..."
              />
            </div>

            {/* Description Section with Formatting Hint Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Description
                </label>
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    Markdown supported
                  </span>
                </div>
              </div>
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                onBlur={handleSaveTask}
                placeholder="Add specifications, acceptance criteria, or technical details..."
                rows={6}
                className="w-full p-3.5 text-xs leading-relaxed border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-slate-50/40 text-slate-800 font-sans resize-y transition-all"
              />
            </div>

            {/* Subtasks Section with Progress Bar */}
            <div className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CornerDownRight className="w-4 h-4 text-accent" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Subtasks ({completedSubtasks}/{subtasks.length})
                  </h4>
                </div>
                {subtasks.length > 0 && (
                  <span className="text-xs font-semibold text-slate-500">
                    {Math.round(subtasksPercent)}% done
                  </span>
                )}
              </div>

              {subtasks.length > 0 && (
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${subtasksPercent}%` }}
                  />
                </div>
              )}

              {/* Subtasks list */}
              <div className="space-y-1.5">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-accent/40 text-xs shadow-2xs transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                      <StatusBadge
                        statusId={st.statusId}
                        onChange={(statusId) => updateTask(st.id, { statusId })}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedTaskId(st.id)}
                        className="font-medium text-slate-800 hover:text-accent truncate text-left"
                      >
                        {st.title}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge
                        priority={st.priority}
                        onChange={(priority) => updateTask(st.id, { priority })}
                      />
                      <AssigneePicker
                        assigneeIds={st.assigneeIds}
                        onChange={(assigneeIds) => updateTask(st.id, { assigneeIds })}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="+ Add a subtask (Press Enter)..."
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-3 py-1.5 text-xs bg-accent text-white rounded-lg font-semibold hover:bg-accent-hover disabled:opacity-50 shadow-2xs"
                >
                  Add Subtask
                </button>
              </form>
            </div>

            {/* Checklists Section with Progress Bar */}
            {task.checklists.length > 0 && (
              <div className="border border-slate-200/90 rounded-xl p-4 bg-slate-50/30 space-y-3">
                {task.checklists.map((chk) => (
                  <div key={chk.id} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {chk.title} ({completedItems}/{allChecklistItems.length})
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {Math.round(checklistPercent)}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${checklistPercent}%` }}
                      />
                    </div>

                    <div className="space-y-1">
                      {chk.items.map((item) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer text-xs transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => toggleChecklistItem(task.id, chk.id, item.id)}
                            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent"
                          />
                          <span
                            className={
                              item.isCompleted
                                ? 'line-through text-slate-400'
                                : 'text-slate-800 font-medium'
                            }
                          >
                            {item.title}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newChecklistText}
                        onChange={(e) => setNewChecklistText(e.target.value)}
                        placeholder="+ Add checklist item..."
                        className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newChecklistText.trim()) {
                            e.preventDefault();
                            addChecklistItem(task.id, chk.id, newChecklistText.trim());
                            setNewChecklistText('');
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newChecklistText.trim()) {
                            addChecklistItem(task.id, chk.id, newChecklistText.trim());
                            setNewChecklistText('');
                          }
                        }}
                        className="px-3 py-1.5 text-xs bg-white border border-slate-200 hover:bg-slate-50 rounded-lg font-semibold text-slate-700 shadow-2xs"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comments & Activity Stream */}
            <div className="border-t border-slate-200 pt-5 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Discussion & Activity ({task.commentsCount})
                </h4>
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} className="flex gap-2.5">
                <Avatar user={currentUser} size="sm" showTooltip={false} />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment or mention @teammate..."
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 bg-slate-50/50"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:opacity-50 shadow-2xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Metadata Inspector Cards */}
          <div className="w-72 border-l border-slate-200 bg-slate-50/60 p-5 overflow-y-auto space-y-4 flex-shrink-0">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Task Properties
            </h4>

            {/* Status */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">Status</span>
              <StatusBadge
                statusId={task.statusId}
                onChange={(statusId) => updateTask(task.id, { statusId })}
                size="md"
              />
            </div>

            {/* Priority */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">Priority</span>
              <PriorityBadge
                priority={task.priority}
                onChange={(priority) => updateTask(task.id, { priority })}
                showLabel
              />
            </div>

            {/* Assignees */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">Assignees</span>
              <AssigneePicker
                assigneeIds={task.assigneeIds}
                onChange={(assigneeIds) => updateTask(task.id, { assigneeIds })}
              />
            </div>

            {/* Dates */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5">Due Date</span>
              <DatePickerPopover
                date={task.dueDate}
                onChange={(dueDate) => updateTask(task.id, { dueDate })}
              />
            </div>

            {/* Recurring Schedule */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Repeat className="w-3.5 h-3.5 text-teal-800" />
                  Recurring Schedule
                </span>
                {task.recurrence && task.recurrence !== 'none' && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-teal-50 text-teal-800 rounded font-bold uppercase">
                    Active
                  </span>
                )}
              </div>
              <select
                value={task.recurrence || 'none'}
                onChange={(e) => updateTask(task.id, { recurrence: e.target.value as any })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="none">Does not repeat</option>
                <option value="daily">Daily (Every day)</option>
                <option value="weekly">Weekly (Every 7 days)</option>
                <option value="biweekly">Bi-weekly (Every 2 weeks)</option>
                <option value="monthly">Monthly (Every month)</option>
              </select>
              {task.recurrence && task.recurrence !== 'none' && (
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                  Auto-schedules next occurrence when marked complete.
                </p>
              )}
            </div>

            {/* Task Reminder */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  Reminder
                </span>
                {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-50 text-amber-800 rounded font-bold uppercase">
                    Armed
                  </span>
                )}
              </div>
              <select
                value={task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : -1}
                onChange={(e) =>
                  updateTask(task.id, {
                    reminderMinutesBefore: parseInt(e.target.value, 10),
                  })
                }
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-teal-700"
              >
                <option value="-1">No reminder</option>
                <option value="0">At time of due date</option>
                <option value="10">10 minutes before</option>
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
              </select>
            </div>

            {/* Time Tracking with Interactive Stopwatch Icon Button */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Time Tracking</span>
                <button
                  type="button"
                  onClick={toggleTimer}
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                    isTimerRunning
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title={isTimerRunning ? 'Stop timer' : 'Start tracking'}
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isTimerRunning ? 'Recording' : 'Track'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-700">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="font-semibold">
                  {task.timeEstimateMinutes
                    ? `${task.timeEstimateMinutes / 60}h estimated`
                    : 'No estimate'}
                </span>
                {task.timeSpentMinutes !== undefined && task.timeSpentMinutes > 0 && (
                  <span className="text-slate-500">({task.timeSpentMinutes / 60}h spent)</span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500">Tags</span>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="text-[11px] text-accent hover:underline font-semibold"
                >
                  + Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {task.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-semibold"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="text-slate-400 hover:text-red-500 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {task.tags.length === 0 && !isAddingTag && (
                  <span className="text-xs text-slate-400 italic">No tags set</span>
                )}
              </div>

              {isAddingTag && (
                <form onSubmit={handleAddTag} className="mt-2 flex gap-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="tag name..."
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded-md bg-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-accent text-white rounded-md text-xs font-semibold"
                  >
                    Save
                  </button>
                </form>
              )}
            </div>

            {/* Audit Info */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[10px] text-slate-400 space-y-1 shadow-2xs">
              <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
              <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Sticky Drawer Footer with Explicit Save, Delete, Close Actions */}
        <div className="h-16 px-6 border-t border-slate-200/90 bg-slate-50/80 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition-colors shadow-2xs"
            title="Delete this task permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Task</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedTaskId(null)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveTask}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
                isSaved
                  ? 'bg-emerald-600'
                  : 'bg-teal-800 hover:bg-teal-900 active:scale-95 hover:shadow-md'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaved ? 'Saved ✓' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Task Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 text-rose-600 mb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Delete Task</h3>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">{task.id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                Are you sure you want to delete <strong>&quot;{task.title}&quot;</strong>?
              </p>

              <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl mb-5 leading-normal">
                This will permanently delete this task along with all associated subtasks and checklist items.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteTask(task.id);
                    setShowDeleteConfirm(false);
                    setSelectedTaskId(null);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
