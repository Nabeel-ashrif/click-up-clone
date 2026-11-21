# ClickUp Clone (Internal Team Edition)

A clean-room, full-featured clone of **ClickUp** designed specifically for **internal team collaboration**, featuring complete role-based project management with zero commercial subscription paywalls or seat limits.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons, and clean token-based UI primitives.

---

## ✨ Features Implemented

- **🏢 Multi-level Workspace Hierarchy**:
  - `Workspace` > `Spaces` > `Folders` > `Lists`
  - Collapsible navigation tree with customizable space icons & color themes
  - Create spaces and lists on the fly
- **📋 4 Interactive Views**:
  - **List View**: Dense tabular task view grouped by custom statuses, inline editable cells, subtask breakdown, and inline quick-add
  - **Board View (Kanban)**: Interactive columns per status, fluid drag-and-drop between workflow stages, priority flags, tag chips, and due dates
  - **Calendar View**: Monthly scheduling grid with date highlights and direct task scheduling
  - **Timeline / Gantt View**: Visual duration bars, milestone tracking, and schedule progression
- **✅ Comprehensive Task Inspector (Slide-Over Drawer)**:
  - Inline title editing & rich markdown descriptions
  - Subtasks hierarchy with completion progress
  - Checklists with interactive item toggles and additions
  - Assignee picker with fuzzy search & multiple team member support
  - Due date popover with overdue alerts
  - ClickUp priority flags (Urgent, High, Normal, Low, Clear)
  - Color-coded custom status picker
  - Comments & activity log stream
- **👥 Team Roles & Permissions (RBAC)**:
  - **Owner**: Full workspace administration & configuration
  - **Admin**: Space and list management, member invitations
  - **Member**: Create, update, and manage tasks and docs
  - **Viewer**: Read-only stakeholder access
  - Member invitation modal with instant role assignment
- **📖 Workspace Docs & Wiki**:
  - Centralized knowledge base for engineering SOPs, design specs, and meeting notes
  - Markdown editor with auto-save
- **🔔 Notifications & Inbox**:
  - In-app activity stream for task assignments, status changes, and mentions
  - Filter by unread, one-click "Mark all read", and jump to task
- **⚡ Power Tools & Navigation**:
  - **Command Palette (`Ctrl+K` / `Cmd+K`)**: Rapid global search across tasks, lists, spaces, and docs
  - **Quick Add Task (`Ctrl+T` / `Cmd+T`)**: Create tasks from anywhere in the app
  - Fast text filter on all views

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── replica/
│   ├── recon.md          # Reverse-engineered recon map (screens, flows, data model)
│   ├── features.csv      # Prioritized feature matrix (must, should, could, skip)
│   ├── architecture.md   # System architecture, API specification, and build order
│   ├── schema.sql        # Production PostgreSQL schema with RBAC and RLS
│   ├── build-log.md      # Screen implementation status log
│   └── design/
│       ├── tokens.json   # Design tokens (colors, type, spacing, radius, motion)
│       ├── tokens.css    # CSS custom property mapping
│       └── components.md # Primitive component specifications
└── src/
    ├── app/              # Next.js App Router (Layouts & Screen Routes)
    ├── components/
    │   ├── shell/        # Sidebar hierarchy, Topbar, View tabs
    │   ├── tasks/        # TaskDetailDrawer, QuickAddTaskModal
    │   ├── views/        # ListView, BoardView, CalendarView, GanttView
    │   └── ui/           # Avatar, StatusBadge, PriorityBadge, DatePicker, CommandPalette
    └── lib/
        ├── types.ts      # TypeScript data models
        ├── store.tsx     # Reactive state management context & CRUD actions
        └── mock-data.ts  # Realistic internal team seed data
```
