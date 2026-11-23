import { Task, Status, User, WorkspaceRole } from './types';

export interface TransitionCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: string;
}

/**
 * Determines whether a user is authorized to view a task.
 *
 * Rules:
 * 1. Space Owner (role === 'owner'): Can see ALL tasks across all spaces and lists.
 * 2. All other accounts (admin, member, viewer):
 *    Can ONLY see tasks that:
 *    a) They created/assigned themselves (task.creatorId === user.id or username)
 *    b) Are assigned to them by others (task.assigneeIds includes user.id, username, or email)
 */
export function canUserViewTask(task: Task, user: User): boolean {
  if (!task || !user) return false;
  if (user.role === 'owner') {
    return true;
  }

  const isCreator =
    task.creatorId === user.id ||
    Boolean(user.username && task.creatorId === user.username) ||
    Boolean(user.email && task.creatorId === user.email);

  const isAssignee =
    task.assigneeIds.includes(user.id) ||
    Boolean(user.username && task.assigneeIds.includes(user.username)) ||
    Boolean(user.email && task.assigneeIds.includes(user.email));

  return Boolean(isCreator || isAssignee);
}

/**
 * Validates whether the current user is authorized to transition a task to targetStatus.
 *
 * Rules:
 * 1. Viewers: Read-only, cannot transition any status.
 * 2. Moving to 'done' / 'closed' (Complete):
 *    - ONLY SPACE OWNER OR ADMIN has the right to mark a task as complete.
 * 3. Moving to 'review': Allowed for assigned members or admins/owners.
 * 4. Moving to 'in_progress': Allowed for assigned members or admins/owners.
 * 5. Moving back to 'open' (To Do): Allowed for assignees or admins/owners.
 */
export function canTransitionTaskStatus(
  task: Task | undefined,
  targetStatus: Status,
  currentUser: User
): TransitionCheck {
  if (!task) {
    return { allowed: true };
  }

  // Already in this status
  if (task.statusId === targetStatus.id) {
    return { allowed: true };
  }

  const role = (currentUser.role || 'member') as WorkspaceRole;

  // 1. Viewer check
  if (role === 'viewer') {
    return {
      allowed: false,
      reason: 'Viewers have read-only access and cannot alter task phases.',
      requiredRole: 'Member or Admin',
    };
  }

  // 2. Stage: COMPLETE / DONE / CLOSED — STRICT: ONLY SPACE OWNER OR ADMIN
  if (targetStatus.type === 'done' || targetStatus.type === 'closed' || targetStatus.id === 'st-done') {
    if (role === 'owner' || role === 'admin') {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Permission Denied: ONLY Space Owner or Admin has the right to mark a task as complete.',
      requiredRole: 'Owner or Admin',
    };
  }

  // 3. Owner & Admin have universal approval/transition authority for all other stages
  if (role === 'owner' || role === 'admin') {
    return { allowed: true };
  }

  const isAssignee = task.assigneeIds.includes(currentUser.id);
  const isCreator = task.creatorId === currentUser.id;

  // 4. Stage: IN REVIEW
  if (targetStatus.type === 'review') {
    if (isAssignee || isCreator) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Only assigned team members working on this task can submit it for Review.',
      requiredRole: 'Task Assignee',
    };
  }

  // 5. Stage: IN PROGRESS
  if (targetStatus.type === 'in_progress') {
    if (isAssignee || isCreator) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Only assigned team members can start work and move this task to In Progress.',
      requiredRole: 'Task Assignee',
    };
  }

  // 6. Stage: TO DO / OPEN
  if (targetStatus.type === 'open') {
    if (isAssignee || isCreator) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Only task assignees or leaders can reset this task to To Do.',
      requiredRole: 'Task Assignee or Admin',
    };
  }

  return { allowed: true };
}
