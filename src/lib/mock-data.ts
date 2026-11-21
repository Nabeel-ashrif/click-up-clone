import { User, Workspace, Task, Doc, NotificationItem, WorkspaceRole } from './types';

export const mockUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    username: 'nabeel',
    email: 'nabeel@workspace.internal',
    fullName: 'Nabeel',
    initials: 'NA',
    color: '#0f766e',
    role: 'owner',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    username: 'maham',
    email: 'maham@workspace.internal',
    fullName: 'Maham',
    initials: 'MA',
    color: '#1e3a5f',
    role: 'admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    username: 'farhan',
    email: 'farhan@workspace.internal',
    fullName: 'Farhan',
    initials: 'FA',
    color: '#2563eb',
    role: 'admin',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    username: 'anees',
    email: 'anees@workspace.internal',
    fullName: 'Anees',
    initials: 'AN',
    color: '#16a34a',
    role: 'member',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    username: 'areeba',
    email: 'areeba@workspace.internal',
    fullName: 'Areeba',
    initials: 'AR',
    color: '#ea580c',
    role: 'member',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    username: 'jawad',
    email: 'jawad@workspace.internal',
    fullName: 'Jawad',
    initials: 'JA',
    color: '#7b68ee',
    role: 'member',
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    username: 'fatima',
    email: 'fatima@workspace.internal',
    fullName: 'Fatima',
    initials: 'FA',
    color: '#ec4899',
    role: 'member',
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    username: 'umair',
    email: 'umair@workspace.internal',
    fullName: 'Umair',
    initials: 'UM',
    color: '#06b6d4',
    role: 'member',
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    username: 'waqas',
    email: 'waqas@workspace.internal',
    fullName: 'Waqas',
    initials: 'WA',
    color: '#64748b',
    role: 'viewer',
  },
];

export const defaultStatuses = [
  { id: 'st-todo', name: 'TO DO', color: '#87909e', type: 'open' as const, orderIndex: 0 },
  { id: 'st-progress', name: 'IN PROGRESS', color: '#2563eb', type: 'in_progress' as const, orderIndex: 1 },
  { id: 'st-review', name: 'IN REVIEW', color: '#ea580c', type: 'review' as const, orderIndex: 2 },
  { id: 'st-done', name: 'COMPLETE', color: '#16a34a', type: 'done' as const, orderIndex: 3 },
];

export const initialWorkspace: Workspace = {
  id: 'ws-1',
  name: 'Acme Engineering',
  slug: 'acme-eng',
  ownerId: '00000000-0000-0000-0000-000000000001',
  members: mockUsers.map((u, i) => ({
    id: `wm-${i + 1}`,
    userId: u.id,
    workspaceId: 'ws-1',
    role: (u.role as WorkspaceRole) || 'member',
    user: u,
  })),
  spaces: [
    {
      id: 'sp-daily',
      workspaceId: 'ws-1',
      name: 'Daily Tasks',
      icon: 'calendar',
      color: '#0f766e',
      isPrivate: false,
      orderIndex: 0,
      statuses: defaultStatuses,
      folders: [],
      lists: [
        { id: 'l-daily-tasks', spaceId: 'sp-daily', name: 'Daily Tasks', orderIndex: 0 },
      ],
    },
    {
      id: 'sp-monthly',
      workspaceId: 'ws-1',
      name: 'Monthly Tasks',
      icon: 'clock',
      color: '#1e3a5f',
      isPrivate: false,
      orderIndex: 1,
      statuses: defaultStatuses,
      folders: [],
      lists: [
        { id: 'l-monthly-tasks', spaceId: 'sp-monthly', name: 'Monthly Tasks', orderIndex: 0 },
      ],
    },
    {
      id: 'sp-yearly',
      workspaceId: 'ws-1',
      name: 'Yearly Tasks',
      icon: 'target',
      color: '#d97706',
      isPrivate: false,
      orderIndex: 2,
      statuses: defaultStatuses,
      folders: [],
      lists: [
        { id: 'l-yearly-tasks', spaceId: 'sp-yearly', name: 'Yearly Tasks', orderIndex: 0 },
      ],
    },
    {
      id: 'sp-onoff',
      workspaceId: 'ws-1',
      name: 'On-Off',
      icon: 'check-square',
      color: '#7b68ee',
      isPrivate: false,
      orderIndex: 3,
      statuses: defaultStatuses,
      folders: [],
      lists: [
        { id: 'l-onoff-tasks', spaceId: 'sp-onoff', name: 'On-Off Tasks', orderIndex: 0 },
      ],
    },
  ],
};

export const initialWorkspaces: Workspace[] = [initialWorkspace];

export const initialTasks: Task[] = [
  {
    id: 'tsk-daily-1',
    listId: 'l-daily-tasks',
    title: 'Daily engineering standup & priority alignment',
    description: `### Daily Check-in\n- Review blockers across active sprints\n- Synchronize daily deliverables and milestones\n- Update task progress in Daily Tasks board`,
    statusId: 'st-progress',
    priority: 'high',
    creatorId: '00000000-0000-0000-0000-000000000001',
    assigneeIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004'],
    startDate: '2026-11-21T09:00:00Z',
    dueDate: '2026-11-21T18:00:00Z',
    recurrence: 'daily',
    reminderMinutesBefore: 60,
    timeEstimateMinutes: 60,
    timeSpentMinutes: 30,
    orderIndex: 1000,
    tags: ['daily', 'standup', 'operations'],
    checklists: [
      {
        id: 'chk-d1',
        title: 'Daily Checklist',
        items: [
          { id: 'cd-1', title: 'Review unassigned incoming items', isCompleted: true },
          { id: 'cd-2', title: 'Confirm daily deployment schedule', isCompleted: false },
        ],
      },
    ],
    commentsCount: 2,
    createdAt: '2026-11-21T08:00:00Z',
    updatedAt: '2026-11-21T09:30:00Z',
  },
  {
    id: 'tsk-daily-2',
    listId: 'l-daily-tasks',
    title: 'Code review and pull request merges',
    description: 'Review pending pull requests, test locally, and approve for staging deployment.',
    statusId: 'st-todo',
    priority: 'normal',
    creatorId: '00000000-0000-0000-0000-000000000002',
    assigneeIds: ['00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003'],
    dueDate: '2026-11-21T17:00:00Z',
    recurrence: 'daily',
    reminderMinutesBefore: 30,
    timeEstimateMinutes: 120,
    timeSpentMinutes: 0,
    orderIndex: 2000,
    tags: ['code-review', 'engineering'],
    checklists: [],
    commentsCount: 0,
    createdAt: '2026-11-21T08:30:00Z',
    updatedAt: '2026-11-21T08:30:00Z',
  },
  {
    id: 'tsk-monthly-1',
    listId: 'l-monthly-tasks',
    title: 'Monthly performance and infrastructure audit',
    description: 'Analyze cloud database throughput, API latency metrics, and server capacity for the upcoming cycle.',
    statusId: 'st-todo',
    priority: 'high',
    creatorId: '00000000-0000-0000-0000-000000000001',
    assigneeIds: ['00000000-0000-0000-0000-000000000003'],
    dueDate: '2026-11-30T18:00:00Z',
    recurrence: 'monthly',
    reminderMinutesBefore: 1440,
    timeEstimateMinutes: 240,
    timeSpentMinutes: 0,
    orderIndex: 1000,
    tags: ['monthly', 'infra', 'audit'],
    checklists: [],
    commentsCount: 1,
    createdAt: '2026-11-21T09:00:00Z',
    updatedAt: '2026-11-21T09:00:00Z',
  },
  {
    id: 'tsk-yearly-1',
    listId: 'l-yearly-tasks',
    title: 'Annual product roadmap & strategy review',
    description: 'Coordinate long-term goals, architecture upgrades, and yearly deliverables across the workspace.',
    statusId: 'st-todo',
    priority: 'normal',
    creatorId: '00000000-0000-0000-0000-000000000001',
    assigneeIds: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'],
    dueDate: '2026-12-31T18:00:00Z',
    recurrence: 'none',
    timeEstimateMinutes: 480,
    timeSpentMinutes: 0,
    orderIndex: 1000,
    tags: ['yearly', 'strategy', 'roadmap'],
    checklists: [],
    commentsCount: 0,
    createdAt: '2026-11-21T09:00:00Z',
    updatedAt: '2026-11-21T09:00:00Z',
  },
  {
    id: 'tsk-onoff-1',
    listId: 'l-onoff-tasks',
    title: 'Ad-hoc security review and token verification',
    description: 'Ad-hoc on-off check for system integrity and permission verification.',
    statusId: 'st-review',
    priority: 'normal',
    creatorId: '00000000-0000-0000-0000-000000000001',
    assigneeIds: ['00000000-0000-0000-0000-000000000004'],
    dueDate: '2026-11-23T18:00:00Z',
    recurrence: 'none',
    timeEstimateMinutes: 90,
    timeSpentMinutes: 60,
    orderIndex: 1000,
    tags: ['on-off', 'security'],
    checklists: [],
    commentsCount: 1,
    createdAt: '2026-11-21T09:00:00Z',
    updatedAt: '2026-11-21T09:00:00Z',
  },
];

export const initialDocs: Doc[] = [
  {
    id: 'doc-1',
    workspaceId: 'ws-1',
    spaceId: 'sp-daily',
    title: 'Workspace Operational Playbook & Guidelines',
    content: `# Workspace Operational Guidelines

Welcome to the unified workspace! This environment is pre-configured with:

## Configured Spaces
1. **Daily Tasks**: Daily operations, standups, and active engineering items.
2. **Monthly Tasks**: Monthly milestones, audits, and performance reviews.
3. **Yearly Tasks**: Long-term strategy, yearly objectives, and roadmap.
4. **On-Off**: Ad-hoc, one-time tasks and special operational items.

## Team Permissions & Progression
- **Owner**: Full workspace management, space edits & deletion, role assignments.
- **Admin**: Task approval, moving tasks between review and completed stages.
- **Member**: Create, execute, and move tasks through progression phases.
- **Viewer**: Read-only oversight across all spaces.
`,
    createdById: '00000000-0000-0000-0000-000000000001',
    createdAt: '2026-11-21T10:00:00Z',
    updatedAt: '2026-11-21T11:00:00Z',
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: '00000000-0000-0000-0000-000000000001',
    title: 'Welcome to your Workspace',
    message: 'Your workspace has been initialized with the 4 spaces: Daily Tasks, Monthly Tasks, Yearly Tasks, and On-Off.',
    isRead: false,
    createdAt: '2026-11-21T10:00:00Z',
  },
];
