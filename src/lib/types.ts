export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer';

export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low' | 'none';

export type StatusType = 'open' | 'in_progress' | 'review' | 'done' | 'closed';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type ColorTheme = 'executive' | 'dark' | 'navy' | 'crimson' | 'emerald';
export type SidebarTheme = 'light' | 'dark';
export type ZoomLevel = '90' | '100' | '110' | '120';
export type FontFamily = 'inter' | 'jakarta' | 'mono' | 'serif';

export interface UserPreferences {
  theme: ColorTheme;
  sidebarTheme?: SidebarTheme;
  zoom: ZoomLevel;
  font: FontFamily;
}

export interface User {
  id: string;
  username?: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  initials: string;
  color: string;
  role?: string;
  isFrozen?: boolean;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  user: User;
}

export interface Status {
  id: string;
  spaceId?: string;
  listId?: string;
  name: string;
  color: string;
  type: StatusType;
  orderIndex: number;
}

export interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskChecklist {
  id: string;
  title: string;
  items: TaskChecklistItem[];
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  user: User;
  actionText: string;
  createdAt: string;
}

export interface Task {
  id: string;
  listId: string;
  parentTaskId?: string;
  title: string;
  description: string;
  statusId: string;
  priority: TaskPriority;
  creatorId: string;
  assigneeIds: string[];
  startDate?: string;
  dueDate?: string;
  recurrence?: RecurrenceType;
  reminderMinutesBefore?: number; // 0 = at due time, 60 = 1h before, 1440 = 1 day before
  timeEstimateMinutes?: number;
  timeSpentMinutes?: number;
  orderIndex: number;
  tags: string[];
  checklists: TaskChecklist[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  spaceId: string;
  folderId?: string;
  name: string;
  description?: string;
  color?: string;
  orderIndex: number;
}

export interface Folder {
  id: string;
  spaceId: string;
  name: string;
  orderIndex: number;
  lists: List[];
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  icon: string;
  color: string;
  isPrivate: boolean;
  isArchived?: boolean; // When true, space is inactive and hidden from active sidebar view
  allowedMemberIds?: string[]; // IDs of users permitted to see this space if private
  orderIndex: number;
  folders: Folder[];
  lists: List[];
  statuses: Status[];
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: WorkspaceMember[];
  spaces: Space[];
}

export interface Doc {
  id: string;
  workspaceId: string;
  spaceId?: string;
  title: string;
  content: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}
