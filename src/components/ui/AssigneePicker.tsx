'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Check, Search, X } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Avatar, AvatarGroup } from './Avatar';
import { User } from '@/lib/types';

interface AssigneePickerProps {
  assigneeIds: string[];
  onChange?: (newAssigneeIds: string[]) => void;
  readOnly?: boolean;
  dropUp?: boolean;
}

export function AssigneePicker({ assigneeIds, onChange, readOnly = false, dropUp = false }: AssigneePickerProps) {
  const { users, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const assignedUsers = assigneeIds
    .map((id) => users.find((u) => u.id === id))
    .filter((u): u is User => !!u);

  const filteredUsers = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    if (!onChange) return;
    if (assigneeIds.includes(userId)) {
      onChange(assigneeIds.filter((id) => id !== userId));
    } else {
      onChange([...assigneeIds, userId]);
    }
  };

  if (readOnly || !onChange) {
    if (assignedUsers.length === 0) {
      return <span className="text-xs text-text-muted italic">Unassigned</span>;
    }
    return <AvatarGroup users={assignedUsers} size="sm" />;
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 p-1 rounded hover:bg-surface transition-colors"
        title="Assign team members"
      >
        {assignedUsers.length > 0 ? (
          <AvatarGroup users={assignedUsers} size="sm" />
        ) : (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded border border-dashed border-border text-xs text-text-muted hover:text-text hover:border-text-muted transition-colors">
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Assign</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className={`absolute left-0 w-56 bg-white rounded-md shadow-dropdown border border-border p-2 z-[9999] animate-in fade-in zoom-in-95 duration-100 ${dropUp ? 'bottom-full mb-1' : 'top-full mt-1'}`}>
          <div className="flex items-center justify-between pb-1.5 border-b border-border mb-1.5">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Assignees
            </span>
            <button
              type="button"
              onClick={() => {
                if (assigneeIds.includes(currentUser.id)) {
                  onChange(assigneeIds.filter((id) => id !== currentUser.id));
                } else {
                  onChange([...assigneeIds, currentUser.id]);
                }
              }}
              className="text-[11px] text-accent hover:underline font-medium"
            >
              {assigneeIds.includes(currentUser.id) ? 'Remove me' : 'Assign to me'}
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search team members..."
              className="w-full pl-7 pr-2 py-1 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-0.5">
            {filteredUsers.map((user) => {
              const isAssigned = assigneeIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded hover:bg-surface-hover transition-colors ${
                    isAssigned ? 'bg-surface' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden text-left">
                    <Avatar user={user} size="xs" showTooltip={false} />
                    <div className="truncate">
                      <div className="font-medium text-text truncate">{user.fullName}</div>
                      <div className="text-[10px] text-text-muted truncate">{user.email}</div>
                    </div>
                  </div>
                  {isAssigned && <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
