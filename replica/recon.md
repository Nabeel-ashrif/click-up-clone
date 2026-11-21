# Recon map: ClickUp (Web)

Scope: Team project management core — Hierarchy (Workspaces, Spaces, Folders, Lists), Tasks & Subtasks, Custom Statuses & Fields, Multi-View (List, Kanban Board, Calendar, Gantt), Team Roles & RBAC, Comments & Activity, and Docs.
For: Internal team use (self-hosted / company internal deployment, no subscription paywalls, full role-based access).
Date: 2026-11-14

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | Help Center: Hierarchy Overview | https://help.clickup.com/hc/en-us/articles/6309112836247-Hierarchy-overview | Workspace -> Space -> Folder -> List -> Task hierarchy |
| 2 | Public API v2 Reference | https://clickup.com/api | Canonical data entities, endpoints, relationships & payload structures |
| 3 | Help Center: User Roles & Permissions | https://help.clickup.com/hc/en-us/articles/6310022323991-User-roles-overview | Owner, Admin, Member, Guest/Viewer role matrices |
| 4 | Help Center: Views Overview | https://help.clickup.com/hc/en-us/articles/6310249479831-Views-overview | Core mechanics for List, Board, Calendar, Gantt, and Doc views |
| 5 | Marketing & Product Walkthroughs | https://clickup.com/features | Visual layouts, interactions, filtering, grouping, and modal drawers |

## Core loop

Teams organize projects in a flexible hierarchy (Workspace > Space > Folder > List), create and prioritize tasks with custom statuses and metadata, collaborate through assignments and real-time comments, and track progress across interactive List, Board, Calendar, and Gantt views.

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign In & Invite Acceptance | `/login`, `/invite/:token` | Authenticate team members into the private workspace | Email/password form, invite code banner, validation alerts | empty, loading, error, success |
| S02 | Workspace Setup Wizard | `/onboarding` | Initial workspace configuration (name, team size, default spaces) | Step wizard, name input, preset selector, color picker | step 1-3, submitting |
| S03 | Global App Shell & Navigation | `/w/:workspaceSlug/*` | Persistent hierarchy navigation, search, and quick-add actions | Sidebar tree (Spaces/Folders/Lists), Breadcrumbs, Quick Add Task button, Profile menu | expanded, collapsed, mobile drawer |
| S04 | Home & My Work | `/w/:workspaceSlug/home` | Personal agenda, assigned tasks, and pending action items | "My Work" list, "Trending/Recents", Due Soon timeline, quick-complete checkboxes | empty, filled, loading |
| S05 | List View | `/w/:workspaceSlug/v/l/:listId` | Dense tabular view of tasks grouped by status, assignee, or priority | Group headers, inline editable task rows, column manager, quick add row | empty, populated, filtering, bulk selected |
| S06 | Board View (Kanban) | `/w/:workspaceSlug/v/b/:listId` | Visual Kanban board columns representing workflow stages | Draggable columns, task cards, drag-and-drop ghost preview, quick-card creator | empty column, populated, dragging |
| S07 | Calendar View | `/w/:workspaceSlug/v/c/:listId` | Time-based scheduling view across Month, Week, and Day | Calendar grid, task event chips, unscheduled tasks sidebar, drag-to-schedule | empty day, populated, scheduling |
| S08 | Gantt / Timeline View | `/w/:workspaceSlug/v/g/:listId` | Dependency and duration schedule mapping over calendar time | Timeline chart, horizontal duration bars, milestone markers, zoom controls | empty, populated, dependency link |
| S09 | Task Detail Modal / Drawer | `/w/:workspaceSlug/task/:taskId` (modal or slide-over) | Comprehensive task inspection, status updates, metadata, subtasks, and discussion | Status dropdown, assignee selector, priority badge, rich markdown description, subtask tree, checklist, comments stream | loading, populated, editing, error |
| S10 | Workspace Docs & Editor | `/w/:workspaceSlug/docs/:docId` | Knowledge base, SOPs, and project documentation | Rich text document editor, slash commands, doc outline tree, linked tasks | empty doc, editing, read-only |
| S11 | Notifications & Inbox | `/w/:workspaceSlug/inbox` | Activity stream for task assignments, mentions, and status updates | Notification list, "Mark all read" toggle, direct filter (Mentions vs Assigned) | empty inbox, unread items, read items |
| S12 | Workspace Settings & Roles | `/w/:workspaceSlug/settings/members` | Manage team members, invite links, and role permissions (Owner, Admin, Member, Viewer) | Member data table, invite modal, role selector, revoke button | loading, populated, invite modal open |
| S13 | Space & Custom Status Settings | `/w/:workspaceSlug/settings/spaces/:spaceId` | Configure custom statuses, enabled features, and custom fields | Status sequence editor, color swatch picker, custom field manager | editing, saved, validation error |
| S14 | Command Palette & Quick Search | Trigger via `Cmd+K` / `Ctrl+K` or top search bar | Rapid navigation to any task, space, list, or doc | Search input, fuzzy filter results list, keyboard navigation (`↑`/`↓`/`Enter`) | empty query, matching results, no results |

## Flows

```
F01 Team Lead sets up hierarchy
    S02 onboarding or S03 shell -> Create Space -> (Optional) Create Folder -> Create List
    happy path clicks: 4 clicks
    edge: duplicate space name, private space access restrictions

F02 Admin invites and assigns team roles
    S03 shell -> S12 settings -> Click "Invite Member" -> Enter email + select Role (Admin, Member, Viewer) -> Send Invite
    happy path clicks: 4 clicks
    edge: invite already pending, invalid email format, seat limit not applicable (internal unlimited)

F03 User creates and configures a task
    S03 (Quick Add) or S05 (Inline Add) -> Enter title -> S09 Task Detail -> Set status, assignee, priority, due date -> Add subtask
    happy path clicks: 5 clicks
    edge: missing required title, date in the past, unassigned task

F04 User manages workflow on Board
    S06 Board view -> Drag task card from "In Progress" column to "Review" column -> Drop
    happy path clicks: 1 drag-and-drop action
    edge: column has WIP limit (optional), permissions restrict moving to "Done"

F05 Team collaborates via task discussion
    S09 Task Detail -> Scroll to Activity / Comments -> Type comment with @mention -> Click Post
    happy path clicks: 2 clicks
    edge: network latency, attached file exceeds limit, mentioned user receives S11 notification

F06 User schedules tasks in Calendar / Gantt
    S07 Calendar view -> Open unscheduled tasks drawer -> Drag task onto date cell
    happy path clicks: 2 clicks
    edge: task lacks duration, rescheduling conflicting dependencies

F07 Team creates knowledge doc
    S03 shell -> Click "+ Doc" -> S10 Doc Editor -> Title doc -> Write rich text with headings and task links -> Auto-save
    happy path clicks: 2 clicks
    edge: concurrent edit conflict, doc linked to specific Space or List

F08 Team member triages notifications in Inbox
    S03 shell -> Click Inbox icon -> S11 Inbox -> Click notification -> Opens S09 Task Detail -> Take action
    happy path clicks: 2 clicks
    edge: task deleted after notification was issued
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger, icon-only | default, hover, focus, disabled, loading | all screens |
| TextInput / TextArea | standard, borderless, monospace | default, focus, error, disabled | S01, S02, S09, S10, S12, S13 |
| Avatar & AvatarGroup | xs (20px), sm (24px), md (32px), lg (40px) | default, fallback initials, presence dot | S03, S05, S06, S09, S11, S12 |
| StatusBadge & Picker | pill, text-only, circle icon | open, in_progress, review, done, closed (custom colors) | S05, S06, S07, S08, S09 |
| PriorityPicker | Urgent (red), High (yellow), Normal (blue), Low (gray), Clear | default, active, dropdown open | S05, S06, S08, S09 |
| DatePicker | date, date-time, range | default, open, selected, overdue (red text) | S05, S06, S07, S08, S09 |
| AssigneePicker | single, multi-select with search | default, open, selected chips, empty | S05, S06, S09 |
| HierarchyTree | workspace, space, folder, list items | collapsed, expanded, active, dragging | S03 |
| TaskRow | compact, normal | default, hover, selected, editing | S05 |
| KanbanCard | compact, full | default, hover, dragging, dropped | S06 |
| KanbanColumn | status-based column | default, drag-over, collapsed | S06 |
| CalendarGrid | month, week, day views | default, today highlighted, drop-target | S07 |
| GanttBar | task span bar with progress fill | default, hover, resizing, dragging | S08 |
| RichTextEditor | markdown / block-based editor | default, typing, slash menu open, focused | S09, S10 |
| Modal & SlideOver | center dialog, right drawer | opening, open, closing | S09, S12, S13, S14 |
| FilterSortBar | view filters, group-by, search filter | default, active filter pills, menu open | S05, S06, S07, S08 |
| CommandPalette | global fuzzy search dialog | open, searching, empty results, item selected | S14 |

## Inferred data model

```
User
  id: uuid (PK)
  email: string (unique)
  password_hash: string
  full_name: string
  avatar_url: string (nullable)
  created_at: timestamp
  evidence: S01 authentication, S12 member list
  confidence: high

Workspace
  id: uuid (PK)
  name: string
  slug: string (unique)
  owner_id: uuid (FK -> User.id)
  created_at: timestamp
  evidence: S02 onboarding, S03 shell, S12 settings
  confidence: high

WorkspaceMember
  id: uuid (PK)
  workspace_id: uuid (FK -> Workspace.id)
  user_id: uuid (FK -> User.id)
  role: enum ('owner', 'admin', 'member', 'viewer')
  joined_at: timestamp
  evidence: S12 member list, ClickUp user roles docs
  confidence: high

Space
  id: uuid (PK)
  workspace_id: uuid (FK -> Workspace.id)
  name: string
  icon: string (nullable)
  color: string (nullable)
  is_private: boolean (default false)
  order_index: integer
  created_at: timestamp
  evidence: S03 hierarchy, S13 space settings, ClickUp API /space
  confidence: high

Folder
  id: uuid (PK)
  space_id: uuid (FK -> Space.id)
  name: string
  order_index: integer
  is_private: boolean (default false)
  created_at: timestamp
  evidence: S03 hierarchy, ClickUp API /folder
  confidence: high

List
  id: uuid (PK)
  space_id: uuid (FK -> Space.id)
  folder_id: uuid (FK -> Folder.id, nullable)
  name: string
  order_index: integer
  created_at: timestamp
  evidence: S03 hierarchy, S05 List view, ClickUp API /list
  confidence: high

Status
  id: uuid (PK)
  space_id: uuid (FK -> Space.id, nullable)
  list_id: uuid (FK -> List.id, nullable)
  name: string
  color: string
  type: enum ('open', 'in_progress', 'review', 'done', 'closed')
  order_index: integer
  evidence: S05 list grouping, S06 Kanban columns, S13 status settings
  confidence: high

Task
  id: uuid (PK)
  list_id: uuid (FK -> List.id)
  parent_task_id: uuid (FK -> Task.id, nullable for subtasks)
  title: string
  description: text (markdown/rich JSON)
  status_id: uuid (FK -> Status.id)
  priority: enum ('urgent', 'high', 'normal', 'low', 'none')
  creator_id: uuid (FK -> User.id)
  due_date: timestamp (nullable)
  start_date: timestamp (nullable)
  time_estimate_minutes: integer (nullable)
  time_spent_minutes: integer (default 0)
  order_index: float
  created_at: timestamp
  updated_at: timestamp
  evidence: S05, S06, S07, S08, S09 task modal, ClickUp API /task
  confidence: high

TaskAssignee
  task_id: uuid (FK -> Task.id, PK)
  user_id: uuid (FK -> User.id, PK)
  assigned_at: timestamp
  evidence: S09 assignee multi-select, S05 assignee column
  confidence: high

TaskTag
  id: uuid (PK)
  workspace_id: uuid (FK -> Workspace.id)
  name: string
  color: string
  evidence: S09 tags, S05 tags filter
  confidence: high

TaskTagLink
  task_id: uuid (FK -> Task.id, PK)
  tag_id: uuid (FK -> TaskTag.id, PK)
  evidence: ClickUp API /task/:id/tag
  confidence: high

CustomFieldDefinition
  id: uuid (PK)
  workspace_id: uuid (FK -> Workspace.id)
  space_id: uuid (FK -> Space.id, nullable)
  name: string
  type: enum ('text', 'number', 'date', 'select', 'checkbox')
  config_json: jsonb (options list, validation rules)
  evidence: S13 custom fields, S05 column manager
  confidence: high

CustomFieldValue
  id: uuid (PK)
  task_id: uuid (FK -> Task.id)
  field_id: uuid (FK -> CustomFieldDefinition.id)
  value_json: jsonb
  evidence: S09 task modal custom fields, S05 columns
  confidence: high

TaskChecklist
  id: uuid (PK)
  task_id: uuid (FK -> Task.id)
  title: string
  order_index: integer
  evidence: S09 checklist component
  confidence: high

TaskChecklistItem
  id: uuid (PK)
  checklist_id: uuid (FK -> TaskChecklist.id)
  title: string
  is_completed: boolean (default false)
  order_index: integer
  evidence: S09 checklist item checkboxes
  confidence: high

TaskComment
  id: uuid (PK)
  task_id: uuid (FK -> Task.id)
  user_id: uuid (FK -> User.id)
  content: text
  parent_comment_id: uuid (FK -> TaskComment.id, nullable)
  created_at: timestamp
  updated_at: timestamp
  evidence: S09 discussion stream
  confidence: high

TaskActivity
  id: uuid (PK)
  task_id: uuid (FK -> Task.id)
  user_id: uuid (FK -> User.id)
  action_type: string ('status_changed', 'assigned', 'due_date_set', 'comment_added', etc.)
  details_json: jsonb
  created_at: timestamp
  evidence: S09 activity log history
  confidence: high

Doc
  id: uuid (PK)
  workspace_id: uuid (FK -> Workspace.id)
  space_id: uuid (FK -> Space.id, nullable)
  title: string
  content: text (markdown/rich format)
  created_by: uuid (FK -> User.id)
  created_at: timestamp
  updated_at: timestamp
  evidence: S10 workspace docs, ClickUp Docs feature
  confidence: high

Notification
  id: uuid (PK)
  user_id: uuid (FK -> User.id)
  workspace_id: uuid (FK -> Workspace.id)
  entity_type: string ('task', 'comment', 'doc')
  entity_id: uuid
  action_text: string
  is_read: boolean (default false)
  created_at: timestamp
  evidence: S11 Inbox stream
  confidence: high
```

Relationships:
- Workspace (1-n) WorkspaceMember, Space, CustomFieldDefinition, TaskTag, Doc
- Space (1-n) Folder, List, Status
- Folder (1-n) List
- List (1-n) Task
- Task (1-n) Subtask (self-referential Task), TaskAssignee, CustomFieldValue, TaskChecklist, TaskComment, TaskActivity
- User (1-n) WorkspaceMember, TaskAssignee, TaskComment, Notification

## Feature matrix

See `replica/features.csv`.
- Must: 18 features (Auth, Workspaces, Hierarchy, Tasks, Subtasks, Custom Statuses, List View, Kanban Board, Calendar View, Assignees, Dates, Priorities, Comments, RBAC Roles, Search)
- Should: 8 features (Gantt View, Custom Fields, Checklists, Activity Log, Docs, Inbox Notifications, Time Tracking)
- Could: 4 features (Export to CSV/JSON, Keyboard shortcuts, Dark/Light mode theme toggle, Basic rule-based task automations)
- Skip: 4 features (Paid SaaS subscription billing, Proprietary ClickUp AI subscription, 100+ Commercial App Marketplace integrations, White-label enterprise branding)

## Out of scope (cannot or should not be cloned)

- Commercial SaaS billing & subscription tier walls (the clone is tailored for internal team use with all core capabilities unlocked).
- Proprietary ClickUp AI upsell service / paid AI tokens.
- Third-party SaaS app store / marketplace ecosystem (Slack, Zoom, GitHub oauth webhooks can be direct integrations, but full app store is skipped).
- Enterprise compliance audits & proprietary white-label re-seller portals.

## Size

- Screens: 14
- Flows: 8
- Entities: 17
- Hard parts:
  1. Hierarchical List view with inline editable cells, multi-grouping, and drag-to-reorder tasks.
  2. Interactive multi-view synchronization (updating status in Board or date in Calendar instantly reflects in List and Gantt).
  3. Flexible Custom Status and Custom Field schema per Space/List without database migrations per field.
- Size: **M** (A focused, modern, full-stack vertical slice built in Next.js / TypeScript / Tailwind CSS / Supabase or SQLite / PostgreSQL).
