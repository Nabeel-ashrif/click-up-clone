import React from 'react';
import { User } from '@/lib/types';

interface AvatarProps {
  user?: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export function Avatar({ user, size = 'sm', className = '', showTooltip = true }: AvatarProps) {
  if (!user) {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-500 border border-border ${
          size === 'xs' ? 'w-5 h-5 text-[10px]' :
          size === 'sm' ? 'w-6 h-6 text-xs' :
          size === 'md' ? 'w-8 h-8 text-sm' :
          'w-10 h-10 text-base'
        } ${className}`}
        title="Unassigned"
      >
        ?
      </div>
    );
  }

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm font-medium',
    lg: 'w-10 h-10 text-base font-semibold',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-white font-medium select-none flex-shrink-0 shadow-sm ${sizeClasses} ${className}`}
      style={{ backgroundColor: user.color || '#7b68ee' }}
      title={showTooltip ? `${user.fullName} (${user.email})` : undefined}
    >
      {user.initials}
    </div>
  );
}

export function AvatarGroup({ users, max = 3, size = 'sm' }: { users: User[]; max?: number; size?: 'xs' | 'sm' | 'md' }) {
  const visible = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {visible.map((user) => (
        <Avatar key={user.id} user={user} size={size} className="ring-2 ring-white" />
      ))}
      {remaining > 0 && (
        <div
          className={`inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-semibold ring-2 ring-white text-[10px] ${
            size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8 text-xs'
          }`}
          title={`${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
