# Component Specifications: ClickUp Team Clone

All components are designed clean-room, strictly using design tokens, keyboard navigable, and WCAG AA compliant.

## Button
- **variants**: `primary` (purple accent), `secondary` (subtle gray surface), `ghost` (transparent, hover surface), `danger` (red text/surface)
- **sizes**: `sm` (28px height, 12px text), `md` (36px height, 14px text), `lg` (42px height, 15px text)
- **states**: `default`, `hover`, `active`, `focus-visible` (2px ring accent), `disabled`, `loading` (spinner with accessible aria-label)
- **tokens**: bg `--color-accent` / `--color-surface`, text `--color-on-accent` / `--color-text`, radius `--radius-sm`
- **a11y**: Native `<button>`, `aria-busy` when loading, visible 2px offset focus ring
- **used on**: S01, S02, S03, S05, S06, S09, S10, S12, S13

## TaskRow (List View)
- **variants**: `standard`, `subtask` (indented with corner connector line)
- **columns**: Checkbox, Title & Subtask Count, Status Dropdown, Assignees, Due Date, Priority Flag, Tags, Action Menu
- **states**: `default`, `hover` (shows quick actions), `selected` (subtle blue tint), `editing` (inline input active)
- **tokens**: border `--color-border-subtle`, hover bg `--color-surface-hover`
- **keyboard**: `Enter` opens task modal, `Space` toggles status/complete, `Tab` navigates cells
- **used on**: S05 (List View)

## KanbanCard (Board View)
- **variants**: `default` (full details), `compact` (title and tags only)
- **states**: `default`, `hover` (elevates shadow), `dragging` (elevated modal shadow, slight rotation, translucent ghost placeholder)
- **elements**: Status strip / tag, Title, Checklist progress bar `(2/5)`, Assignee avatar group, Due date badge (red if overdue)
- **tokens**: bg `--color-bg`, border `--color-border`, radius `--radius-md`, shadow `--shadow-card`
- **a11y**: Draggable with keyboard support (Space to pick up, Arrows to move, Space to drop)
- **used on**: S06 (Board View)

## KanbanColumn (Board View)
- **elements**: Header (Status name, color dot, task counter, quick add `+` button), Card container (droppable zone), Collapse button
- **states**: `default`, `drag-over` (accent outline / highlight), `collapsed`
- **tokens**: bg `--color-surface`, border `--color-border`
- **used on**: S06 (Board View)

## StatusBadge & StatusDropdown
- **variants**: Pill badge with circle dot, Compact status icon
- **semantic types**: `open` (slate), `in_progress` (blue), `review` (orange), `done` (emerald)
- **states**: `default`, `hover`, `dropdown-open`
- **interaction**: Click opens quick popover to switch status directly without opening task modal
- **used on**: S05, S06, S07, S08, S09

## PriorityBadge & Picker
- **variants**:
  - `Urgent`: Red flag (`--color-priority-urgent`)
  - `High`: Amber flag (`--color-priority-high`)
  - `Normal`: Blue flag (`--color-priority-normal`)
  - `Low`: Slate flag (`--color-priority-low`)
  - `None`: Outlined gray flag
- **interaction**: Quick popover selector with keyboard `1-4` shortcuts
- **used on**: S05, S06, S09

## AssigneePicker & Avatar
- **variants**: Single avatar, AvatarGroup (stacked overlaps with `+N` count), Unassigned placeholder button
- **popover**: Search input to filter team members, multi-select checkboxes, "Assign to me" quick button
- **used on**: S05, S06, S09

## TaskDetailModal / SlideOver
- **layout**: Split pane on wide screens:
  - Left (60%): Title, Description (rich text editor), Subtasks list, Checklists, Attachments
  - Right (40%): Metadata sidebar (Status, Assignees, Dates, Priority, Tags, Custom Fields), Activity stream & Comments thread
- **tokens**: bg `--color-bg`, border `--color-border`, shadow `--shadow-modal`
- **used on**: S09

## HierarchyTree (Sidebar)
- **levels**: Workspace switcher -> Home / Notifications / Docs -> Spaces (expandable) -> Folders (expandable) -> Lists
- **features**: Active route highlight, create `+` button on hover, drag to reorder lists
- **tokens**: bg `--color-sidebar`, text `--color-sidebar-text`, hover `--color-sidebar-surface`
- **used on**: S03 (App Shell)

## CommandPalette (Quick Search & Actions)
- **shortcut**: `Cmd+K` or `Ctrl+K`
- **sections**: Recent Tasks, Navigation (jump to Space/List), Quick Actions ("Create Task", "Invite Member")
- **tokens**: modal dialog with fuzzy filter and keyboard arrow highlight
- **used on**: Global overlay (S14)
