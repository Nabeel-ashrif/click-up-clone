# Architecture: ClickUp Team Clone (Self-Hosted Internal Workspaces)

A clean-room rebuild of ClickUp's core team project management platform, tailored for private internal team collaboration with full role-based access control and no subscription paywalls.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web app | Next.js 14/15 (App Router) + TypeScript | React Server Components, server actions, standard ecosystem |
| styling & components | Tailwind CSS + Lucide Icons + Radix UI primitives | Fast styling, accessible dialogs, popovers, dropdowns |
| database | PostgreSQL (Supabase or self-hosted Docker PostgreSQL) | Relational integrity for hierarchical entities, JSONB for custom fields, RLS |
| ORM | Prisma / Drizzle ORM | Type-safe queries, automatic schema migrations, easy seeding |
| auth | NextAuth.js / Supabase Auth | Session cookies, local email/password + optional Google OAuth, role enforcement |
| drag and drop | `@hello-pangea/dnd` / `@dnd-kit` | Smooth 60fps card dragging across Kanban columns and list reordering |
| rich text | Tiptap (ProseMirror wrapper) | Lightweight block/markdown editing for task descriptions and workspace Docs |
| realtime updates | WebSockets / Server-Sent Events / Supabase Realtime | Live status transitions and new comments across team members |
| payments | **None** (Omitted by design) | Free self-hosted internal team usage without commercial billing gates |
| hosting | Docker Compose / Vercel / Railway / Self-hosted VM | Easy team deployment behind private VPN or domain |

## Schema

- **Tables**: 17 core tables (`users`, `workspaces`, `workspace_members`, `workspace_invites`, `spaces`, `space_members`, `folders`, `lists`, `statuses`, `tasks`, `task_assignees`, `tags`, `task_tags`, `custom_field_definitions`, `custom_field_values`, `task_checklists`, `task_checklist_items`, `task_comments`, `task_activity_logs`, `docs`, `notifications`).
- **Complete SQL**: Stored in `replica/schema.sql`.
- **Access Control**: Role-based access control (`owner`, `admin`, `member`, `viewer`). Enforced through unified authorization helpers in API routes/Server Actions and optional PostgreSQL Row-Level Security (RLS).

## API & Server Actions

| Method & Route | What it does | Who | Input | Output | Flow |
| --- | --- | --- | --- | --- | --- |
| `POST /api/auth/register` | Register initial admin / user | Public / Invite | email, password, name | session cookie | F01, F02 |
| `POST /api/workspaces` | Create workspace | Authenticated | `{ name, slug }` | `Workspace` | F01 |
| `GET /api/workspaces/:slug` | Fetch workspace hierarchy | Member+ | - | Spaces, Folders, Lists | F01, F03 |
| `POST /api/workspaces/:id/invites` | Invite team member with role | Owner/Admin | `{ email, role }` | `Invite` | F02 |
| `POST /api/invites/:token/accept` | Accept invite to workspace | Authenticated | `{ token }` | `{ success: true }` | F02 |
| `POST /api/spaces` | Create Space | Admin/Member | `{ name, color, icon, is_private }` | `Space` | F01 |
| `POST /api/lists` | Create List under Space/Folder | Admin/Member | `{ space_id, folder_id, name }` | `List` | F01 |
| `GET /api/lists/:id/tasks` | Get tasks with filters & sorting | Member+ | `query: { view, status, sort }` | `Task[]` with assignees & statuses | F03, F04 |
| `POST /api/tasks` | Create new task | Member+ | `{ list_id, title, status_id, priority, due_date }` | `Task` | F03 |
| `PATCH /api/tasks/:id` | Update task (status, date, priority, order) | Member+ | `{ status_id, order_index, ... }` | `Task` | F03, F04, F06 |
| `POST /api/tasks/:id/assignees` | Assign/unassign user | Member+ | `{ user_id }` | `TaskAssignee[]` | F03 |
| `POST /api/tasks/:id/comments` | Add comment to task | Member+ | `{ content }` | `TaskComment` | F05 |
| `GET /api/tasks/:id/activity` | Fetch task audit activity | Member+ | - | `TaskActivity[]` | F05 |
| `POST /api/docs` | Create workspace Doc | Member+ | `{ title, space_id }` | `Doc` | F07 |
| `PATCH /api/docs/:id` | Update Doc content | Member+ | `{ content, title }` | `Doc` | F07 |
| `GET /api/inbox` | Get unread notifications | Current User | - | `Notification[]` | F08 |
| `PATCH /api/notifications/:id/read` | Mark notification as read | Current User | - | `{ success: true }` | F08 |
| `GET /api/search` | Global command palette search | Member+ | `query: string` | Matches across tasks, lists, spaces | Global |

## The parts that bite

- **Order Indexing & Reordering (Drag and Drop)**: Tasks inside lists and board columns use floating point `order_index` (e.g. inserting between items assigns `(order_prev + order_next) / 2`). A rebalance routine normalizes indices when precision limits are reached.
- **Custom Status Progression**: Each space/list can define custom statuses. Statuses are categorized into fixed semantic buckets (`open`, `in_progress`, `review`, `done`, `closed`) so metrics and filters work consistently regardless of custom names.
- **Dynamic Custom Fields**: Handled via `custom_field_definitions` + `custom_field_values` with JSONB validation. Avoids dangerous runtime DDL schema alterations.
- **Time Zones & Schedules**: Due dates and start dates are always stored as ISO-8601 UTC `timestamptz`. The client translates dates to the browser's local time zone, highlighting overdue tasks in red.
- **Nested Subtasks**: Supported via a self-referencing foreign key (`parent_task_id -> tasks.id`). Querying supports recursive subtasks or two-level nesting for subtask trees in List View and Task Detail Modal.

## Build order

1. **Vertical Slice (Milestone 1)**:
   - Screens: S01 (Login), S03 (Shell), S05 (List View), S09 (Task Detail Modal).
   - Tables: `users`, `workspaces`, `workspace_members`, `spaces`, `lists`, `statuses`, `tasks`.
   - Flow: Sign in, view workspace sidebar, add a task in List view, open task modal, change status and priority.
2. **Multi-Views & Interactivity (Milestone 2)**:
   - Screens: S06 (Kanban Board View), S07 (Calendar View).
   - Mechanics: Drag-and-drop between columns, update due dates in calendar grid, filter by assignee.
3. **Collaboration & Subtasks (Milestone 3)**:
   - Screens: S09 enhancements (Subtasks, Checklists, Comments, Activity log), S11 (Inbox notifications).
   - Tables: `task_assignees`, `task_checklists`, `task_comments`, `task_activity_logs`, `notifications`.
4. **Team Roles & Customization (Milestone 4)**:
   - Screens: S12 (Member Roles & Invites), S13 (Custom Statuses & Custom Fields), S10 (Docs), S14 (Ctrl+K Command Palette).
   - Tables: `workspace_invites`, `custom_field_definitions`, `custom_field_values`, `docs`.
