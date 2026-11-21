'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Workspace,
  Task,
  User,
  Doc,
  NotificationItem,
  WorkspaceRole,
  TaskPriority,
  Status,
  Space,
  List,
  RecurrenceType,
  UserPreferences,
  ColorTheme,
  ZoomLevel,
  FontFamily,
} from './types';
import {
  initialWorkspace,
  initialWorkspaces,
  initialTasks,
  mockUsers,
  initialDocs,
  initialNotifications,
  defaultStatuses,
} from './mock-data';

interface AppContextType {
  workspace: Workspace;
  workspaces: Workspace[];
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, description?: string) => Workspace;
  updateWorkspaceName: (workspaceId: string, newName: string) => void;
  updateSpaceName: (spaceId: string, newName: string, color?: string, icon?: string) => void;
  updateListName: (listId: string, newName: string) => void;
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  isPreferencesModalOpen: boolean;
  setIsPreferencesModalOpen: (open: boolean) => void;
  tasks: Task[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  selectedTaskId: string | null;
  setSelectedTaskId: (id: string | null) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  searchFilter: string;
  setSearchFilter: (q: string) => void;
  selectedPriorityFilter: TaskPriority | 'all';
  setSelectedPriorityFilter: (p: TaskPriority | 'all') => void;
  selectedStatusFilter: string | 'all';
  setSelectedStatusFilter: (s: string | 'all') => void;
  activeGroupBy: 'status' | 'priority';
  setActiveGroupBy: (g: 'status' | 'priority') => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  // Task actions
  addTask: (data: {
    title: string;
    listId: string;
    parentTaskId?: string;
    statusId?: string;
    priority?: TaskPriority;
    assigneeIds?: string[];
    dueDate?: string;
    recurrence?: RecurrenceType;
    reminderMinutesBefore?: number;
  }) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, checklistId: string, itemId: string) => void;
  addChecklistItem: (taskId: string, checklistId: string, title: string) => void;
  addComment: (taskId: string, content: string) => void;
  // Hierarchy actions
  createSpace: (name: string, color?: string, icon?: string) => Space;
  createFolder: (spaceId: string, name: string) => void;
  createList: (spaceId: string, name: string, folderId?: string) => List;
  updateSpaceVisibility: (spaceId: string, isPrivate: boolean, allowedMemberIds?: string[]) => void;
  toggleSpaceArchive: (spaceId: string) => void;
  deleteSpace: (spaceId: string) => void;
  // Member actions
  inviteMember: (email: string, role: WorkspaceRole) => void;
  updateMemberRole: (memberId: string, role: WorkspaceRole) => void;
  removeMember: (memberId: string) => void;
  // Docs
  docs: Doc[];
  createDoc: (title: string, spaceId?: string) => Doc;
  updateDoc: (id: string, updates: Partial<Doc>) => void;
  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  // Helpers
  getStatusById: (statusId: string) => Status;
  getUserById: (userId: string) => User | undefined;
  getListById: (listId: string) => List | undefined;
  getSpaceById: (spaceId: string) => Space | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(initialWorkspaces[0].id);

  // Derive current workspace safely
  const workspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  const setWorkspace = (newWs: Workspace | ((prev: Workspace) => Workspace)) => {
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === (workspace?.id || currentWorkspaceId)) {
          return typeof newWs === 'function' ? newWs(w) : newWs;
        }
        return w;
      })
    );
  };

  const defaultPreferences: UserPreferences = {
    theme: 'executive',
    sidebarTheme: 'light',
    zoom: '100',
    font: 'inter',
  };

  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  const applyPreferences = (prefs: UserPreferences) => {
    if (typeof window === 'undefined') return;
    document.documentElement.setAttribute('data-theme', prefs.theme);
    document.documentElement.setAttribute('data-sidebar', prefs.sidebarTheme || 'light');
    document.documentElement.setAttribute('data-font', prefs.font);
    if (prefs.zoom) {
      (document.documentElement.style as any).zoom = `${prefs.zoom}%`;
    }
  };

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted workspaces and tasks from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedWs = localStorage.getItem('cu_workspaces_v2');
      if (savedWs) {
        const parsed = JSON.parse(savedWs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkspaces(parsed);
        }
      }
      const savedTasks = localStorage.getItem('cu_tasks_v2');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        if (Array.isArray(parsedTasks)) {
          setTasks(parsedTasks);
        }
      }
    } catch (e) {
      console.error('Error loading data from localStorage', e);
    }
    setIsHydrated(true);
  }, []);

  // Persist workspaces to localStorage
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem('cu_workspaces_v2', JSON.stringify(workspaces));
    } catch (e) {
      console.error('Error saving workspaces to localStorage', e);
    }
  }, [workspaces, isHydrated]);

  // Persist tasks to localStorage
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    try {
      localStorage.setItem('cu_tasks_v2', JSON.stringify(tasks));
    } catch (e) {
      console.error('Error saving tasks to localStorage', e);
    }
  }, [tasks, isHydrated]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(`cu_user_prefs_${currentUser.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
        applyPreferences(parsed);
      } else {
        applyPreferences(defaultPreferences);
      }
    } catch (e) {
      console.error('Error loading preferences', e);
    }
  }, [currentUser.id]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(`cu_user_prefs_${currentUser.id}`, JSON.stringify(next));
      } catch {}
      applyPreferences(next);
      return next;
    });
    showToast('Display preferences saved');
  };

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | 'all'>('all');
  const [activeGroupBy, setActiveGroupBy] = useState<'status' | 'priority'>('status');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Global keyboard shortcuts: Cmd+K, Cmd+T, Esc, ?
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setIsQuickAddOpen((prev) => !prev);
      }
      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setIsQuickAddOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getStatusById = (statusId: string): Status => {
    for (const space of workspace.spaces) {
      const match = space.statuses.find((s) => s.id === statusId);
      if (match) return match;
    }
    const def = defaultStatuses.find((s) => s.id === statusId);
    return def || defaultStatuses[0];
  };

  const getUserById = (userId: string) => users.find((u) => u.id === userId);

  const getListById = (listId: string): List | undefined => {
    for (const space of workspace.spaces) {
      const direct = space.lists.find((l) => l.id === listId);
      if (direct) return direct;
      for (const folder of space.folders) {
        const inFolder = folder.lists.find((l) => l.id === listId);
        if (inFolder) return inFolder;
      }
    }
    return undefined;
  };

  const getSpaceById = (spaceId: string): Space | undefined => {
    return workspace.spaces.find((s) => s.id === spaceId);
  };

  const addTask = (data: {
    title: string;
    listId: string;
    parentTaskId?: string;
    statusId?: string;
    priority?: TaskPriority;
    assigneeIds?: string[];
    dueDate?: string;
    recurrence?: RecurrenceType;
    reminderMinutesBefore?: number;
  }): Task => {
    const newTask: Task = {
      id: `tsk-${Date.now()}`,
      listId: data.listId,
      parentTaskId: data.parentTaskId,
      title: data.title,
      description: '',
      statusId: data.statusId || 'st-todo',
      priority: data.priority || 'none',
      creatorId: currentUser.id,
      assigneeIds: data.assigneeIds || [currentUser.id],
      dueDate: data.dueDate,
      recurrence: data.recurrence || 'none',
      reminderMinutesBefore: data.reminderMinutesBefore !== undefined ? data.reminderMinutesBefore : -1,
      orderIndex: tasks.length * 1000 + 1000,
      tags: [],
      checklists: [],
      commentsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);

    showToast(`Task "${data.title}" created successfully`);

    // In-app notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Task created',
      message: `You created "${data.title}"`,
      taskId: newTask.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    let triggeredRecurring = false;
    let nextScheduledDate = '';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };

          // Recurring Task Trigger: If marked complete and has recurrence set
          if (
            updates.statusId === 'st-done' &&
            t.statusId !== 'st-done' &&
            t.recurrence &&
            t.recurrence !== 'none'
          ) {
            triggeredRecurring = true;
            const baseDate = t.dueDate ? new Date(t.dueDate) : new Date();
            const nextDate = new Date(baseDate);
            if (t.recurrence === 'daily') nextDate.setDate(nextDate.getDate() + 1);
            else if (t.recurrence === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
            else if (t.recurrence === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
            else if (t.recurrence === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

            nextScheduledDate = nextDate.toISOString().split('T')[0];
          }

          return updated;
        }
        return t;
      })
    );

    // If recurring was triggered, schedule the next cycle
    if (triggeredRecurring) {
      const currentTask = tasks.find((t) => t.id === taskId);
      if (currentTask) {
        setTimeout(() => {
          const nextCycleTask: Task = {
            id: `tsk-rec-${Date.now()}`,
            listId: currentTask.listId,
            title: `${currentTask.title} (Recurring cycle)`,
            description: currentTask.description,
            statusId: 'st-todo',
            priority: currentTask.priority,
            creatorId: currentUser.id,
            assigneeIds: currentTask.assigneeIds,
            dueDate: nextScheduledDate,
            recurrence: currentTask.recurrence,
            reminderMinutesBefore: currentTask.reminderMinutesBefore,
            timeEstimateMinutes: currentTask.timeEstimateMinutes,
            timeSpentMinutes: 0,
            orderIndex: Date.now(),
            tags: currentTask.tags,
            checklists: currentTask.checklists.map((c) => ({
              ...c,
              id: `chk-${Date.now()}-${Math.random()}`,
              items: c.items.map((i) => ({ ...i, id: `ci-${Date.now()}-${Math.random()}`, isCompleted: false })),
            })),
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setTasks((prev) => [nextCycleTask, ...prev]);
          showToast(`Recurring: next task scheduled for ${nextScheduledDate}`);

          // Add in-app notification for the next recurrence
          setNotifications((prev) => [
            {
              id: `notif-${Date.now()}`,
              userId: currentUser.id,
              title: 'Recurring Task Scheduled',
              message: `Next cycle for "${currentTask.title}" scheduled for ${nextScheduledDate}`,
              taskId: nextCycleTask.id,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }, 300);
      }
    }

    // Reminder notification if reminderMinutesBefore is newly set
    if (updates.reminderMinutesBefore !== undefined && updates.reminderMinutesBefore > 0) {
      const label =
        updates.reminderMinutesBefore === 10
          ? '10 minutes before'
          : updates.reminderMinutesBefore === 60
          ? '1 hour before'
          : updates.reminderMinutesBefore === 1440
          ? '1 day before'
          : 'at due time';
      showToast(`Reminder armed: ${label}`);
    }
  };

  const deleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId && t.parentTaskId !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    showToast(`Task "${taskToDelete?.title || taskId}" deleted`);
  };

  const toggleChecklistItem = (taskId: string, checklistId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklists = t.checklists.map((chk) => {
          if (chk.id !== checklistId) return chk;
          return {
            ...chk,
            items: chk.items.map((item) =>
              item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
            ),
          };
        });
        return { ...t, checklists: updatedChecklists };
      })
    );
  };

  const addChecklistItem = (taskId: string, checklistId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedChecklists = t.checklists.map((chk) => {
          if (chk.id !== checklistId) return chk;
          return {
            ...chk,
            items: [
              ...chk.items,
              { id: `ci-${Date.now()}`, title, isCompleted: false },
            ],
          };
        });
        return { ...t, checklists: updatedChecklists };
      })
    );
  };

  const addComment = (taskId: string, content: string) => {
    updateTask(taskId, {
      commentsCount: (tasks.find((t) => t.id === taskId)?.commentsCount || 0) + 1,
    });
    showToast('Comment posted');
  };

  const createSpace = (name: string, color = '#7b68ee', icon = 'folder'): Space => {
    const newSpace: Space = {
      id: `sp-${Date.now()}`,
      workspaceId: workspace.id,
      name,
      color,
      icon,
      isPrivate: false,
      orderIndex: workspace.spaces.length,
      statuses: defaultStatuses,
      folders: [],
      lists: [{ id: `l-${Date.now()}`, spaceId: `sp-${Date.now()}`, name: 'General', orderIndex: 0 }],
    };
    newSpace.lists[0].spaceId = newSpace.id;

    setWorkspace((prev) => ({
      ...prev,
      spaces: [...prev.spaces, newSpace],
    }));
    showToast(`Space "${name}" created`);
    return newSpace;
  };

  const createFolder = (spaceId: string, name: string) => {
    const newFolder = {
      id: `f-${Date.now()}`,
      spaceId,
      name,
      orderIndex: 0,
      lists: [],
    };
    setWorkspace((prev) => ({
      ...prev,
      spaces: prev.spaces.map((sp) =>
        sp.id === spaceId ? { ...sp, folders: [...sp.folders, newFolder] } : sp
      ),
    }));
    showToast(`Folder "${name}" created`);
  };

  const createList = (spaceId: string, name: string, folderId?: string): List => {
    const newList: List = {
      id: `l-${Date.now()}`,
      spaceId,
      folderId,
      name,
      orderIndex: 0,
    };
    setWorkspace((prev) => ({
      ...prev,
      spaces: prev.spaces.map((sp) => {
        if (sp.id !== spaceId) return sp;
        if (folderId) {
          return {
            ...sp,
            folders: sp.folders.map((f) =>
              f.id === folderId ? { ...f, lists: [...f.lists, newList] } : f
            ),
          };
        }
        return { ...sp, lists: [...sp.lists, newList] };
      }),
    }));
    showToast(`List "${name}" created`);
    return newList;
  };

  const updateSpaceVisibility = (spaceId: string, isPrivate: boolean, allowedMemberIds: string[] = []) => {
    setWorkspace((prev) => ({
      ...prev,
      spaces: prev.spaces.map((sp) =>
        sp.id === spaceId ? { ...sp, isPrivate, allowedMemberIds } : sp
      ),
    }));
    showToast(`Space visibility permissions updated`);
  };

  const toggleSpaceArchive = (spaceId: string) => {
    let nextState = false;
    setWorkspace((prev) => ({
      ...prev,
      spaces: prev.spaces.map((sp) => {
        if (sp.id === spaceId) {
          nextState = !sp.isArchived;
          return { ...sp, isArchived: nextState };
        }
        return sp;
      }),
    }));
    showToast(nextState ? 'Space marked inactive (Archived)' : 'Space restored to active');
  };

  const deleteSpace = (spaceId: string) => {
    setWorkspace((prev) => {
      const spaceToDelete = prev.spaces.find((sp) => sp.id === spaceId);
      if (!spaceToDelete) return prev;
      const listIds = [
        ...spaceToDelete.lists.map((l) => l.id),
        ...spaceToDelete.folders.flatMap((f) => f.lists.map((l) => l.id)),
      ];
      setTasks((prevTasks) => prevTasks.filter((t) => !listIds.includes(t.listId)));
      return {
        ...prev,
        spaces: prev.spaces.filter((sp) => sp.id !== spaceId),
      };
    });
    showToast('Space permanently deleted');
  };

  const switchWorkspace = (workspaceId: string) => {
    const target = workspaces.find((w) => w.id === workspaceId || w.slug === workspaceId);
    if (!target) return;
    setCurrentWorkspaceId(target.id);
    showToast(`Switched company to "${target.name}"`);
  };

  const createWorkspace = (name: string, description?: string): Workspace => {
    const cleanName = name.trim();
    const slug =
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `ws-${Date.now()}`;

    const newWsId = `ws-${Date.now()}`;
    const newWs: Workspace = {
      id: newWsId,
      name: cleanName,
      slug,
      ownerId: currentUser.id,
      members: [
        {
          id: `wm-${Date.now()}-1`,
          userId: currentUser.id,
          workspaceId: newWsId,
          role: 'owner',
          user: currentUser,
        },
        ...mockUsers.slice(1).map((u, i) => ({
          id: `wm-${Date.now()}-${i + 2}`,
          userId: u.id,
          workspaceId: newWsId,
          role: 'member' as WorkspaceRole,
          user: u,
        })),
      ],
      spaces: [
        {
          id: `sp-${Date.now()}-1`,
          workspaceId: newWsId,
          name: 'General Operations',
          icon: 'terminal',
          color: '#0f766e',
          isPrivate: false,
          orderIndex: 0,
          statuses: defaultStatuses,
          folders: [],
          lists: [
            {
              id: `l-${Date.now()}-1`,
              spaceId: `sp-${Date.now()}-1`,
              name: 'Core Tasks & Deliverables',
              orderIndex: 0,
            },
          ],
        },
      ],
    };

    setWorkspaces((prev) => [...prev, newWs]);
    setCurrentWorkspaceId(newWs.id);
    showToast(`Company entity "${cleanName}" created and activated!`);
    return newWs;
  };

  const updateWorkspaceName = (workspaceId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;

    if (currentUser.role !== 'owner' && workspace.ownerId !== currentUser.id) {
      showToast('Only the Workspace Owner has authority to edit company name');
      return;
    }

    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          const newSlug =
            cleanName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '') || w.slug;
          return { ...w, name: cleanName, slug: newSlug };
        }
        return w;
      })
    );
    showToast(`Company name updated to "${cleanName}"`);
  };

  const updateSpaceName = (spaceId: string, newName: string, color?: string, icon?: string) => {
    const cleanName = newName.trim();
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== currentWorkspaceId) return w;
        return {
          ...w,
          spaces: w.spaces.map((s) => {
            if (s.id !== spaceId) return s;
            return {
              ...s,
              name: cleanName || s.name,
              color: color || s.color,
              icon: icon || s.icon,
            };
          }),
        };
      })
    );
    showToast(`Space updated successfully`);
  };

  const updateListName = (listId: string, newName: string) => {
    const cleanName = newName.trim();
    if (!cleanName) return;
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id !== currentWorkspaceId) return w;
        return {
          ...w,
          spaces: w.spaces.map((s) => ({
            ...s,
            lists: s.lists.map((l) => (l.id === listId ? { ...l, name: cleanName } : l)),
            folders: s.folders.map((f) => ({
              ...f,
              lists: f.lists.map((l) => (l.id === listId ? { ...l, name: cleanName } : l)),
            })),
          })),
        };
      })
    );
    showToast(`List renamed to "${cleanName}"`);
  };

  const inviteMember = (email: string, role: WorkspaceRole) => {
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser: User = {
      id: `u-${Date.now()}`,
      email,
      fullName: formattedName,
      initials: formattedName.slice(0, 2).toUpperCase(),
      color: '#7b68ee',
    };
    setUsers((prev) => [...prev, newUser]);
    setWorkspace((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          id: `wm-${Date.now()}`,
          userId: newUser.id,
          workspaceId: prev.id,
          role,
          user: newUser,
        },
      ],
    }));
    showToast(`Invited ${email} as ${role}`);
  };

  const updateMemberRole = (memberId: string, role: WorkspaceRole) => {
    setWorkspace((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
    showToast(`Updated role to ${role}`);
  };

  const removeMember = (memberId: string) => {
    setWorkspace((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== memberId),
    }));
    showToast('Member removed from workspace');
  };

  const createDoc = (title: string, spaceId?: string): Doc => {
    const newDoc: Doc = {
      id: `doc-${Date.now()}`,
      workspaceId: workspace.id,
      spaceId,
      title: title || 'Untitled Document',
      content: `# ${title || 'Untitled Document'}\n\nStart typing notes, meeting minutes, or specifications here...`,
      createdById: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocs((prev) => [newDoc, ...prev]);
    showToast(`Doc "${title}" created`);
    return newDoc;
  };

  const updateDoc = (id: string, updates: Partial<Doc>) => {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  return (
    <AppContext.Provider
      value={{
        workspace,
        workspaces,
        switchWorkspace,
        createWorkspace,
        updateWorkspaceName,
        updateSpaceName,
        updateListName,
        preferences,
        updatePreferences,
        isPreferencesModalOpen,
        setIsPreferencesModalOpen,
        tasks,
        users,
        currentUser,
        setCurrentUser,
        selectedTaskId,
        setSelectedTaskId,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        searchFilter,
        setSearchFilter,
        selectedPriorityFilter,
        setSelectedPriorityFilter,
        selectedStatusFilter,
        setSelectedStatusFilter,
        activeGroupBy,
        setActiveGroupBy,
        toastMessage,
        showToast,
        addTask,
        updateTask,
        deleteTask,
        toggleChecklistItem,
        addChecklistItem,
        addComment,
        createSpace,
        createFolder,
        createList,
        updateSpaceVisibility,
        toggleSpaceArchive,
        deleteSpace,
        inviteMember,
        updateMemberRole,
        removeMember,
        docs,
        createDoc,
        updateDoc,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        getStatusById,
        getUserById,
        getListById,
        getSpaceById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
