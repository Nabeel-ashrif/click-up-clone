'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  List as ListIcon,
  Kanban,
  Calendar,
  Clock,
  Bell,
  ChevronRight,
  Filter,
  Layers,
  Keyboard,
  Settings,
  X,
  Check,
  SlidersHorizontal,
  Edit3,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { TaskPriority } from '@/lib/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspace,
    currentUser,
    getListById,
    getSpaceById,
    updateListName,
    setIsQuickAddOpen,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    searchFilter,
    setSearchFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    activeGroupBy,
    setActiveGroupBy,
    notifications,
  } = useApp();

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [tempListName, setTempListName] = useState('');

  // Extract listId if we are on a list view
  const match = pathname?.match(/\/v\/[lbcg]\/([^/]+)/);
  const currentListId = match ? match[1] : null;
  const currentList = currentListId ? getListById(currentListId) : null;
  const currentSpace = currentList ? getSpaceById(currentList.spaceId) : null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const hasActiveFilters = selectedPriorityFilter !== 'all' || selectedStatusFilter !== 'all' || searchFilter.trim() !== '';

  const views = [
    { key: 'l', name: 'List', icon: ListIcon, href: (id: string) => `/w/${workspace.slug}/v/l/${id}` },
    { key: 'b', name: 'Board', icon: Kanban, href: (id: string) => `/w/${workspace.slug}/v/b/${id}` },
    { key: 'c', name: 'Calendar', icon: Calendar, href: (id: string) => `/w/${workspace.slug}/v/c/${id}` },
    { key: 'g', name: 'Timeline', icon: Clock, href: (id: string) => `/w/${workspace.slug}/v/g/${id}` },
  ];

  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-4 flex items-center justify-between flex-shrink-0 z-20 shadow-xs">
      {/* Left Hierarchy Breadcrumbs & Segmented View Switcher */}
      <div className="flex items-center gap-3 overflow-hidden">
        {currentList && currentSpace ? (
          <div className="flex items-center gap-2 text-xs">
            {/* Space Pill */}
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200 shadow-2xs">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentSpace.color }}
              />
              {currentSpace.name}
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

            {/* List Pill & Rename Option */}
            {isEditingListName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (tempListName.trim()) {
                    updateListName(currentList.id, tempListName.trim());
                    setIsEditingListName(false);
                  }
                }}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={tempListName}
                  onChange={(e) => setTempListName(e.target.value)}
                  className="px-2 py-0.5 text-xs font-semibold border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2 py-0.5 bg-teal-800 text-white rounded text-[11px] font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingListName(false)}
                  className="px-1 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1 group">
                <span className="font-semibold text-slate-800 px-2 py-1 rounded-md">
                  {currentList.name}
                </span>
                {currentUser.role === 'owner' && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempListName(currentList.name);
                      setIsEditingListName(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-teal-800 transition-opacity"
                    title="Rename Project / List"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Segmented View Switcher (Icon-based Buttons) */}
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-200 gap-1 bg-slate-100/70 p-1 rounded-lg border border-slate-200/60">
              {views.map((v) => {
                const isActive = pathname?.includes(`/v/${v.key}/`);

                return (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => router.push(v.href(currentList.id))}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-white text-accent shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                    title={`${v.name} View`}
                  >
                    <v.icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-slate-500'}`} />
                    <span>{v.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm text-slate-900">
              {pathname?.includes('/home')
                ? 'Personal Dashboard & Agenda'
                : pathname?.includes('/inbox')
                ? 'Notifications & Feed'
                : pathname?.includes('/docs')
                ? 'Knowledge Base & SOPs'
                : pathname?.includes('/settings')
                ? 'Team Roles & RBAC Settings'
                : workspace.name}
            </h1>
          </div>
        )}
      </div>

      {/* Right Tools & Global Actions (Icon-based accessible buttons) */}
      <div className="flex items-center gap-2">
        {/* Quick Search Trigger */}
        <div className="relative hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search tasks..."
            className="w-36 lg:w-52 pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Filter Popover Icon Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              hasActiveFilters
                ? 'bg-accent/10 border-accent/40 text-accent shadow-2xs'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
            title="Filter by priority or status"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            )}
          </button>

          {isFilterMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Filter View</span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPriorityFilter('all');
                      setSelectedStatusFilter('all');
                      setSearchFilter('');
                    }}
                    className="text-[11px] text-accent hover:underline font-medium"
                  >
                    Reset all
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Priority
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {(['all', 'urgent', 'high', 'normal', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPriorityFilter(p)}
                      className={`px-2 py-1 rounded text-left capitalize font-medium transition-colors ${
                        selectedPriorityFilter === p
                          ? 'bg-accent text-white'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsFilterMenuOpen(false)}
                  className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Group By Toggle Icon Button */}
        <button
          type="button"
          onClick={() => setActiveGroupBy(activeGroupBy === 'status' ? 'priority' : 'status')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title={`Currently grouped by ${activeGroupBy}. Click to switch.`}
        >
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden lg:inline capitalize">Group: {activeGroupBy}</span>
        </button>

        {/* Command Palette Button */}
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Search or Command Palette (Cmd+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Keyboard Shortcuts (?) Button */}
        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Notifications Icon Button */}
        <Link
          href={`/w/${workspace.slug}/inbox`}
          className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent ring-2 ring-white" />
          )}
        </Link>

        {/* Primary "+ Task" Action Button */}
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
          title="Create New Task (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
}
