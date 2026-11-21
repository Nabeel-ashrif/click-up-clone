import { Task, Status, User, WorkspaceRole } from './types';

export interface TransitionCheck {
  allowed: boolean;
  reason?: string;
  requiredRole?: string;
}

/**
 * Validates whether the current user is authorized to transition a task to targetStatus.
 *
 * Rules:
 * 1. Viewers: Read-only, cannot transition any status.
 * 2. Workspace Owners & Admins: Full administrative authority across all stages.
 * 3. Moving to 'in_progress': Allowed for assigned members, task creator, or admins/owners.
 * 4. Moving to 'review': Allowed for assigned members (submitting work for review), creator, or admins/owners.
 * 5. Moving to 'done' / 'closed' (Complete):
 *    - Restricted to Workspace Owner, Workspace Admin, or Task Creator reviewing another's work.
 *    - Assignees cannot self-approve and mark completed without authorization.
 * 6. Moving back to 'open' (To Do): Allowed for assignees, creator, or admins/owners.
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

  // 2. Owner & Admin have universal approval/transition authority
  if (role === 'owner' || role === 'admin') {
    return { allowed: true };
  }

  const isAssignee = task.assigneeIds.includes(currentUser.id);
  const isCreator = task.creatorId === currentUser.id;

  // 3. Stage: COMPLETE / DONE / CLOSED
  if (targetStatus.type === 'done' || targetStatus.type === 'closed') {
    // Only creator (if reviewing others) or Owner/Admin
    if (isCreator && !isAssignee) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Approval Required: Only Workspace Owners, Admins, or authorized Reviewers can approve and mark a task as Complete.',
      requiredRole: 'Owner or Admin',
    };
  }

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
