'use client';

import React, { useState } from 'react';
import { Inbox, CheckCircle2, Bell, CheckSquare, Clock } from 'lucide-react';
import { useApp } from '@/lib/store';
import { format, parseISO } from 'date-fns';

export default function InboxPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setSelectedTaskId,
    currentUser,
  } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Show only notifications for the current user
  const myNotifications = notifications.filter(
    (n) => !n.userId || n.userId === currentUser.id
  );
  const filtered = filter === 'unread' ? myNotifications.filter((n) => !n.isRead) : myNotifications;
  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <Inbox className="w-5 h-5 text-accent" />
            Inbox & Activity
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Stay up to date with task assignments, status progressions, and team comments.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border hover:bg-surface text-xs font-semibold rounded-md text-text transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-accent/10 text-accent font-semibold'
              : 'text-text-muted hover:text-text'
          }`}
        >
          All Notifications ({myNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-accent/10 text-accent font-semibold'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-border border border-border rounded-lg bg-white overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-muted">
            {filter === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications yet.'}
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markNotificationRead(item.id);
                if (item.taskId) setSelectedTaskId(item.taskId);
              }}
              className={`p-4 flex items-start justify-between gap-4 hover:bg-surface-hover cursor-pointer transition-colors ${
                !item.isRead ? 'bg-accent/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-full mt-0.5 ${
                    !item.isRead ? 'bg-accent text-white' : 'bg-gray-100 text-text-muted'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text">{item.title}</span>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-accent" title="Unread" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{item.message}</p>
                  <div className="text-[10px] text-text-muted mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(item.createdAt), 'MMM d, h:mm a')}
                  </div>
                </div>
              </div>

              {!item.isRead && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(item.id);
                  }}
                  className="text-[11px] text-accent hover:underline flex-shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
