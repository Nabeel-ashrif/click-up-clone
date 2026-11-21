'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Inbox,
  FileText,
  Settings,
  Plus,
  ChevronRight,
  ChevronDown,
  Folder,
  List as ListIcon,
  Layers,
  Shield,
  Layout,
  Terminal,
  X,
  Check,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Search,
  Keyboard,
  UserPlus,
  LogOut,
  Lock,
  Unlock,
  Users,
  Archive,
  ArchiveRestore,
  RotateCcw,
  Building2,
  ChevronsUpDown,
  Edit2,
  Edit3,
  Palette,
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Avatar } from '../ui/Avatar';
import { PreferencesModal } from '../ui/PreferencesModal';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    updateWorkspaceName,
    updateSpaceName,
    updateListName,
    createSpace,
    createList,
    updateSpaceVisibility,
    toggleSpaceArchive,
    deleteSpace,
    currentUser,
    setCurrentUser,
    users,
    tasks,
    notifications,
    preferences,
    updatePreferences,
    setIsQuickAddOpen,
    setIsCommandPaletteOpen,
    setIsShortcutsOpen,
    setIsPreferencesModalOpen,
  } = useApp();

  const isDark = preferences?.sidebarTheme === 'dark';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSpaces, setExpandedSpaces] = useState<Record<string, boolean>>({
    'sp-core': true,
    'sp-product': true,
    'sp-ops': true,
    'sp-exec': true,
  });
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-infra': true,
  });

  // Multi-Company / Entity switcher & management state
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCreateCompanyModalOpen, setIsCreateCompanyModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isRenameCompanyModalOpen, setIsRenameCompanyModalOpen] = useState(false);
  const [editCompanyName, setEditCompanyName] = useState('');

  // List / Project renaming state
  const [editingList, setEditingList] = useState<{ id: string; name: string } | null>(null);
  const [editListName, setEditListName] = useState('');

  // Space Visibility & Rename Settings Modal state
  const [visibilityModalSpace, setVisibilityModalSpace] = useState<any | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<any | null>(null);
  const [tempSpaceName, setTempSpaceName] = useState<string>('');
  const [tempSpaceColor, setTempSpaceColor] = useState<string>('#7b68ee');
  const [tempIsPrivate, setTempIsPrivate] = useState<boolean>(false);
  const [tempAllowedMemberIds, setTempAllowedMemberIds] = useState<string[]>([]);

  const openVisibilityModal = (space: any) => {
    setVisibilityModalSpace(space);
    setTempSpaceName(space.name);
    setTempSpaceColor(space.color || '#7b68ee');
    setTempIsPrivate(space.isPrivate || false);
    setTempAllowedMemberIds(space.allowedMemberIds || []);
  };

  const handleSaveVisibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visibilityModalSpace) return;
    if (tempSpaceName.trim()) {
      updateSpaceName(visibilityModalSpace.id, tempSpaceName.trim(), tempSpaceColor);
    }
    updateSpaceVisibility(visibilityModalSpace.id, tempIsPrivate, tempAllowedMemberIds);
    setVisibilityModalSpace(null);
  };

  const toggleMemberPermission = (userId: string) => {
    setTempAllowedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const created = createWorkspace(newCompanyName.trim());
    setNewCompanyName('');
    setIsCreateCompanyModalOpen(false);
    setIsWorkspaceMenuOpen(false);
    router.push(`/w/${created.slug}/home`);
  };

  const handleRenameCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompanyName.trim()) return;
    updateWorkspaceName(workspace.id, editCompanyName.trim());
    setIsRenameCompanyModalOpen(false);
  };

  const handleRenameList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingList || !editListName.trim()) return;
    updateListName(editingList.id, editListName.trim());
    setEditingList(null);
  };

  // Filter visible spaces based on user permissions
  const visibleSpaces = workspace.spaces.filter((space) => {
    if (!space.isPrivate) return true;
    if (currentUser.role === 'owner') return true;
    return (
      space.allowedMemberIds?.includes(currentUser.id) ||
      space.allowedMemberIds?.includes(currentUser.username || '')
    );
  });

  // Separate active spaces from inactive/archived spaces to prevent clutter
  const activeSpaces = visibleSpaces.filter((space) => !space.isArchived);
  const inactiveSpaces = visibleSpaces.filter((space) => space.isArchived);
  const [isInactiveSpacesOpen, setIsInactiveSpacesOpen] = useState(false);

  // Modals for creating new space / list
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('#7b68ee');

  const [newListSpaceId, setNewListSpaceId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');

  const toggleSpace = (id: string) => {
    setExpandedSpaces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    const created = createSpace(newSpaceName.trim(), newSpaceColor);
    setExpandedSpaces((prev) => ({ ...prev, [created.id]: true }));
    setNewSpaceName('');
    setIsNewSpaceModalOpen(false);
  };

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListSpaceId || !newListName.trim()) return;
    createList(newListSpaceId, newListName.trim());
    setNewListName('');
    setNewListSpaceId(null);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } ${
        isDark
          ? 'bg-[#18191b] text-slate-300 border-[#27292d]'
          : 'bg-[#faf9f6] text-slate-700 border-[#e8e6df] shadow-2xs'
      } flex flex-col h-screen flex-shrink-0 select-none border-r transition-all duration-200 z-30`}
    >
      {/* Workspace Header & Collapse Toggle */}
      <div
        className={`h-14 px-3 border-b flex items-center justify-between transition-colors ${
          isDark ? 'border-[#27292d] bg-[#18191b]' : 'border-[#e8e6df] bg-[#faf9f6]'
        }`}
      >
        {!isCollapsed && (
          <div className="relative flex-1 mr-1">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-left transition-colors group ${
                isDark ? 'hover:bg-[#27292d]' : 'hover:bg-[#f0ede6]'
              }`}
              title="Click to Switch Company or Manage Entities"
            >
              <div
                className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 shadow-xs border p-0.5 ${
                  isDark ? 'border-slate-700 bg-white' : 'border-slate-200 bg-white'
                }`}
              >
                <img src="/app-icon.jpg" alt="Logo" className="w-full h-full object-cover rounded-md" />
              </div>
              <div className="overflow-hidden flex-1">
                <div
                  className={`font-semibold text-xs truncate tracking-tight flex items-center justify-between transition-colors ${
                    isDark
                      ? 'text-white group-hover:text-teal-300'
                      : 'text-slate-900 group-hover:text-teal-800'
                  }`}
                >
                  <span className="truncate">{workspace.name}</span>
                  <ChevronsUpDown
                    className={`w-3.5 h-3.5 flex-shrink-0 ml-1 ${
                      isDark
                        ? 'text-slate-500 group-hover:text-slate-300'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                </div>
                <div
                  className={`text-[10px] flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500 font-medium'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Company Entity</span>
                </div>
              </div>
            </button>

            {/* Company / Entity Switcher Popover */}
            {isWorkspaceMenuOpen && (
              <div
                className={`absolute top-12 left-0 w-64 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 border ${
                  isDark
                    ? 'bg-[#1e2024] text-slate-200 border-[#2d3036]'
                    : 'bg-white text-slate-800 border-slate-200 shadow-xl'
                }`}
              >
                <div
                  className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b mb-1.5 flex items-center justify-between ${
                    isDark ? 'text-slate-400 border-[#2d3036]' : 'text-slate-500 border-slate-100'
                  }`}
                >
                  <span>Switch Entity / Company</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded ${
                      isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600 font-mono'
                    }`}
                  >
                    {workspaces.length} active
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-1">
                  {workspaces.map((ws) => {
                    const isCurrent = ws.id === workspace.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          switchWorkspace(ws.id);
                          setIsWorkspaceMenuOpen(false);
                          router.push(`/w/${ws.slug}/home`);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                          isCurrent
                            ? isDark
                              ? 'bg-teal-900/40 text-teal-200 border border-teal-700/60 font-bold'
                              : 'bg-teal-50 text-teal-900 border border-teal-200 font-bold'
                            : isDark
                              ? 'text-slate-300 hover:bg-[#282a2f] hover:text-white'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isDark ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          />
                          <div className="truncate">
                            <div className="truncate leading-snug">{ws.name}</div>
                            <div
                              className={`text-[10px] font-normal font-mono ${
                                isDark ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            >
                              {ws.spaces.length} spaces &bull; {ws.members.length} members
                            </div>
                          </div>
                        </div>
                        {isCurrent && (
                          <Check
                            className={`w-3.5 h-3.5 flex-shrink-0 ${
                              isDark ? 'text-teal-400' : 'text-teal-700'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Company Actions for Workspace Owner */}
                <div
                  className={`pt-2 mt-2 border-t space-y-1 ${
                    isDark ? 'border-[#2d3036]' : 'border-slate-100'
                  }`}
                >
                  {currentUser.role === 'owner' && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditCompanyName(workspace.name);
                        setIsRenameCompanyModalOpen(true);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs transition-colors ${
                        isDark
                          ? 'text-slate-300 hover:text-white hover:bg-[#282a2f]'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rename &quot;{workspace.name}&quot;</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setNewCompanyName('');
                      setIsCreateCompanyModalOpen(true);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isDark
                        ? 'text-teal-400 hover:text-teal-300 hover:bg-teal-950/40'
                        : 'text-teal-800 hover:text-teal-900 hover:bg-teal-50'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Company / Entity</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#27292d]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-[#eeebe3]'
          } ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Quick Action Icon Toolbar (Always visible & accessible) */}
      <div
        className={`p-2 border-b flex items-center justify-around gap-1 transition-colors ${
          isDark ? 'bg-[#141517] border-[#27292d]' : 'bg-[#f4f2ec] border-[#e8e6df]'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          className="p-2 rounded-lg bg-teal-800 text-white hover:bg-teal-900 shadow-xs transition-all hover:scale-105"
          title="Create New Task (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#27292d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#e8e5dc]'
          }`}
          title="Search / Command Palette (Ctrl+K)"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* 1-Click Instant Sidebar Theme Switcher (Light vs Dark) */}
        <button
          type="button"
          onClick={() => updatePreferences({ sidebarTheme: isDark ? 'light' : 'dark' })}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-amber-400 hover:text-amber-300 hover:bg-[#27292d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#e8e5dc]'
          }`}
          title={isDark ? 'Switch to Clean Light Sidebar' : 'Switch to Obsidian Dark Sidebar'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => setIsPreferencesModalOpen(true)}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#27292d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#e8e5dc]'
          }`}
          title="Personal Display & Theme Preferences"
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setIsShortcutsOpen(true)}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#27292d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#e8e5dc]'
          }`}
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => router.push(`/w/${workspace.slug}/settings/members`)}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#27292d]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-[#e8e5dc]'
          }`}
          title="Invite / Team Roles"
        >
          <UserPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Prominent "+ Create" Action Button (Directly matches ClickUp reference design) */}
      {!isCollapsed && (
        <div className="px-2.5 pt-2.5">
          <button
            type="button"
            onClick={() => setIsQuickAddOpen(true)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-98 ${
              isDark
                ? 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-950/40'
                : 'bg-teal-800 hover:bg-teal-900 text-white shadow-teal-900/10'
            }`}
            title="Create New Task (Ctrl+T)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        </div>
      )}

      {/* Main Core Links */}
      <div
        className={`p-2 space-y-1 border-b transition-colors ${
          isDark ? 'border-[#27292d]' : 'border-[#e8e6df]'
        }`}
      >
        <Link
          href={`/w/${workspace.slug}/home`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
            pathname?.includes('/home')
              ? isDark
                ? 'bg-accent/20 text-accent font-semibold border border-accent/30'
                : 'bg-[#dedad0] text-slate-950 font-bold shadow-2xs'
              : isDark
                ? 'text-slate-300 hover:bg-[#222428] hover:text-white'
                : 'text-slate-700 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
          }`}
          title="Home / My Work"
        >
          <Home
            className={`w-4 h-4 flex-shrink-0 ${
              pathname?.includes('/home')
                ? isDark
                  ? 'text-accent'
                  : 'text-teal-800'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}
          />
          {!isCollapsed && <span>Home / My Work</span>}
        </Link>

        <Link
          href={`/w/${workspace.slug}/inbox`}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
            pathname?.includes('/inbox')
              ? isDark
                ? 'bg-accent/20 text-accent font-semibold border border-accent/30'
                : 'bg-[#dedad0] text-slate-950 font-bold shadow-2xs'
              : isDark
                ? 'text-slate-300 hover:bg-[#222428] hover:text-white'
                : 'text-slate-700 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
          }`}
          title="Inbox & Notifications"
        >
          <div className="flex items-center gap-3">
            <Inbox
              className={`w-4 h-4 flex-shrink-0 ${
                pathname?.includes('/inbox')
                  ? isDark
                    ? 'text-accent'
                    : 'text-teal-800'
                  : isDark
                    ? 'text-slate-400'
                    : 'text-slate-500'
              }`}
            />
            {!isCollapsed && <span>Inbox</span>}
          </div>
          {unreadCount > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                isDark ? 'bg-accent text-white' : 'bg-teal-800 text-white'
              }`}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          href={`/w/${workspace.slug}/docs`}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
            pathname?.includes('/docs')
              ? isDark
                ? 'bg-accent/20 text-accent font-semibold border border-accent/30'
                : 'bg-[#dedad0] text-slate-950 font-bold shadow-2xs'
              : isDark
                ? 'text-slate-300 hover:bg-[#222428] hover:text-white'
                : 'text-slate-700 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
          }`}
          title="Workspace Docs & Wiki"
        >
          <FileText
            className={`w-4 h-4 flex-shrink-0 ${
              pathname?.includes('/docs')
                ? isDark
                  ? 'text-accent'
                  : 'text-teal-800'
                : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
            }`}
          />
          {!isCollapsed && <span>Docs</span>}
        </Link>
      </div>

      {/* Spaces Hierarchy Tree */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-2">
        {!isCollapsed && (
          <div
            className={`flex items-center justify-between px-2 text-[11px] font-bold tracking-wider uppercase ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span>Spaces</span>
            <button
              type="button"
              onClick={() => setIsNewSpaceModalOpen(true)}
              className={`p-1 rounded-md transition-colors ${
                isDark
                  ? 'hover:bg-[#27292d] text-slate-400 hover:text-white'
                  : 'hover:bg-[#eeebe3] text-slate-500 hover:text-slate-900'
              }`}
              title="Create Space"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="space-y-1">
          {activeSpaces.map((space) => {
            const isExpanded = !!expandedSpaces[space.id];

            if (isCollapsed) {
              return (
                <div key={space.id} className="flex justify-center py-1">
                  <button
                    type="button"
                    onClick={() => router.push(`/w/${workspace.slug}/v/l/${space.lists[0]?.id || 'l-sprint-14'}`)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform hover:scale-110 shadow-xs relative"
                    style={{ backgroundColor: space.color || '#7b68ee' }}
                    title={space.name}
                  >
                    <span className="text-white font-bold text-xs">
                      {space.name.slice(0, 1)}
                    </span>
                    {space.isPrivate && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <Lock className="w-2 h-2 text-amber-400" />
                      </span>
                    )}
                  </button>
                </div>
              );
            }

            return (
              <div key={space.id} className="space-y-0.5">
                {/* Space Header */}
                <div
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                    isDark ? 'hover:bg-[#222428]' : 'hover:bg-[#eeebe3]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSpace(space.id)}
                    className="flex items-center gap-2 overflow-hidden flex-1 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      />
                    ) : (
                      <ChevronRight
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      />
                    )}
                    <div
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0 shadow-2xs flex items-center justify-center text-[9px] font-black text-white"
                      style={{ backgroundColor: space.color || '#7b68ee' }}
                    >
                      {space.name.slice(0, 1).toUpperCase()}
                    </div>
                    <span
                      className={`font-semibold truncate ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {space.name}
                    </span>
                    {space.isPrivate && (
                      <span title="Restricted / Private Group" className="flex-shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-500" />
                      </span>
                    )}
                  </button>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                    {/* Edit Space Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openVisibilityModal(space);
                      }}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-[#2e3136] text-slate-400 hover:text-teal-300'
                          : 'hover:bg-[#dedad0] text-slate-500 hover:text-teal-800'
                      }`}
                      title="Edit Space & Settings"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewListSpaceId(space.id)}
                      className={`p-1 rounded transition-colors ${
                        isDark
                          ? 'hover:bg-[#2e3136] text-slate-400 hover:text-white'
                          : 'hover:bg-[#dedad0] text-slate-500 hover:text-slate-900'
                      }`}
                      title="Add List to Space"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Sub-items (Folders and Lists) */}
                {isExpanded && (
                  <div
                    className={`pl-3 space-y-0.5 border-l ml-3 ${
                      isDark ? 'border-[#2e3136]' : 'border-[#dedad0]'
                    }`}
                  >
                    {/* Folders */}
                    {space.folders.map((folder) => {
                      const isFolderOpen = !!expandedFolders[folder.id];

                      return (
                        <div key={folder.id} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleFolder(folder.id)}
                            className={`w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] transition-colors ${
                              isDark
                                ? 'text-slate-400 hover:bg-[#222428] hover:text-white'
                                : 'text-slate-600 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
                            }`}
                          >
                            {isFolderOpen ? (
                              <ChevronDown className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 flex-shrink-0" />
                            )}
                            <Folder className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            <span className="truncate font-medium">{folder.name}</span>
                          </button>

                          {isFolderOpen && (
                            <div
                              className={`pl-3 space-y-0.5 border-l ml-2 ${
                                isDark ? 'border-[#2e3136]' : 'border-[#dedad0]'
                              }`}
                            >
                              {folder.lists.map((list) => {
                                const isActive =
                                  pathname?.includes(`/v/l/${list.id}`) ||
                                  pathname?.includes(`/v/b/${list.id}`) ||
                                  pathname?.includes(`/v/c/${list.id}`) ||
                                  pathname?.includes(`/v/g/${list.id}`);

                                const listTasksCount = tasks.filter(
                                  (t) => t.listId === list.id && t.statusId !== 'st-closed'
                                ).length;

                                return (
                                  <div
                                    key={list.id}
                                    className="group/list flex items-center justify-between rounded-md"
                                  >
                                    <Link
                                      href={`/w/${workspace.slug}/v/l/${list.id}`}
                                      className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                                        isActive
                                          ? isDark
                                            ? 'bg-accent text-white font-semibold shadow-xs'
                                            : 'bg-[#dedad0] text-slate-950 font-bold shadow-2xs'
                                          : isDark
                                            ? 'text-slate-300 hover:bg-[#27292d] hover:text-white'
                                            : 'text-slate-600 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate">
                                        <ListIcon
                                          className={`w-3.5 h-3.5 flex-shrink-0 ${
                                            isActive
                                              ? isDark
                                                ? 'text-white'
                                                : 'text-teal-800'
                                              : 'opacity-70'
                                          }`}
                                        />
                                        <span className="truncate">{list.name}</span>
                                      </div>
                                      {listTasksCount > 0 && (
                                        <span
                                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold flex-shrink-0 ml-1.5 ${
                                            isActive
                                              ? isDark
                                                ? 'bg-black/30 text-white'
                                                : 'bg-[#c8c4b8] text-slate-950 font-bold'
                                              : isDark
                                                ? 'bg-[#27292d] text-slate-400'
                                                : 'bg-[#e8e5dc] text-slate-600'
                                          }`}
                                        >
                                          {listTasksCount}
                                        </span>
                                      )}
                                    </Link>
                                    {currentUser.role === 'owner' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingList({ id: list.id, name: list.name });
                                          setEditListName(list.name);
                                        }}
                                        className={`opacity-0 group-hover/list:opacity-100 p-1 rounded transition-opacity ${
                                          isDark
                                            ? 'hover:bg-[#27292d] text-slate-400 hover:text-white'
                                            : 'hover:bg-[#dedad0] text-slate-500 hover:text-slate-900'
                                        }`}
                                        title="Rename Project / List"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Direct Space Lists */}
                    {space.lists.map((list) => {
                      const isActive =
                        pathname?.includes(`/v/l/${list.id}`) ||
                        pathname?.includes(`/v/b/${list.id}`) ||
                        pathname?.includes(`/v/c/${list.id}`) ||
                        pathname?.includes(`/v/g/${list.id}`);

                      const listTasksCount = tasks.filter(
                        (t) => t.listId === list.id && t.statusId !== 'st-closed'
                      ).length;

                      return (
                        <div
                          key={list.id}
                          className="group/list flex items-center justify-between rounded-md"
                        >
                          <Link
                            href={`/w/${workspace.slug}/v/l/${list.id}`}
                            className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                              isActive
                                ? isDark
                                  ? 'bg-accent text-white font-semibold shadow-xs'
                                  : 'bg-[#dedad0] text-slate-950 font-bold shadow-2xs'
                                : isDark
                                  ? 'text-slate-300 hover:bg-[#27292d] hover:text-white'
                                  : 'text-slate-600 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <ListIcon
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isActive
                                    ? isDark
                                      ? 'text-white'
                                      : 'text-teal-800'
                                    : 'opacity-70'
                                }`}
                              />
                              <span className="truncate">{list.name}</span>
                            </div>
                            {listTasksCount > 0 && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold flex-shrink-0 ml-1.5 ${
                                  isActive
                                    ? isDark
                                      ? 'bg-black/30 text-white'
                                      : 'bg-[#c8c4b8] text-slate-950 font-bold'
                                    : isDark
                                      ? 'bg-[#27292d] text-slate-400'
                                      : 'bg-[#e8e5dc] text-slate-600'
                                }`}
                              >
                                {listTasksCount}
                              </span>
                            )}
                          </Link>
                          {currentUser.role === 'owner' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingList({ id: list.id, name: list.name });
                                setEditListName(list.name);
                              }}
                              className={`opacity-0 group-hover/list:opacity-100 p-1 rounded transition-opacity ${
                                isDark
                                  ? 'hover:bg-[#27292d] text-slate-400 hover:text-white'
                                  : 'hover:bg-[#dedad0] text-slate-500 hover:text-slate-900'
                              }`}
                              title="Rename Project / List"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Inactive / Archived Spaces Section (Prevents clutter) */}
          {inactiveSpaces.length > 0 && !isCollapsed && (
            <div
              className={`pt-2 mt-2 border-t ${
                isDark ? 'border-[#27292d]' : 'border-[#dedad0]'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsInactiveSpacesOpen(!isInactiveSpacesOpen)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-[#222428]'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-[#eeebe3]'
                }`}
                title="Toggle Inactive Spaces"
              >
                <span className="flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-amber-500" />
                  <span>Inactive Spaces ({inactiveSpaces.length})</span>
                </span>
                {isInactiveSpacesOpen ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>

              {isInactiveSpacesOpen && (
                <div className="space-y-1 mt-1 pl-1">
                  {inactiveSpaces.map((space) => (
                    <div
                      key={space.id}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs border ${
                        isDark
                          ? 'bg-[#202226] text-slate-400 border-[#2c2f35]'
                          : 'bg-[#f4f2ec] text-slate-600 border-[#e5e2da]'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden truncate">
                        <div
                          className="w-2 h-2 rounded-xs opacity-50 flex-shrink-0"
                          style={{ backgroundColor: space.color || '#7b68ee' }}
                        />
                        <span className="truncate opacity-75 text-[11px]">{space.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openVisibilityModal(space)}
                          className="px-2 py-0.5 rounded hover:bg-slate-200/60 text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[10px] font-bold transition-colors"
                          title="Edit Inactive Space Settings"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleSpaceArchive(space.id)}
                          className="px-2 py-0.5 rounded hover:bg-teal-50 text-teal-700 hover:text-teal-800 flex items-center gap-1 text-[10px] font-bold transition-colors"
                          title="Restore space to active"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                        {currentUser.role === 'owner' && (
                          <button
                            type="button"
                            onClick={() => setSpaceToDelete(space)}
                            className="px-2 py-0.5 rounded hover:bg-rose-50 text-rose-600 hover:text-rose-700 flex items-center gap-1 text-[10px] font-bold transition-colors"
                            title="Permanently Delete Inactive Space (Owner Only)"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Nav & User Profile Card */}
      <div
        className={`p-2 border-t space-y-1 transition-colors ${
          isDark ? 'border-[#27292d] bg-[#141517]' : 'border-[#e8e6df] bg-[#f4f2ec]'
        }`}
      >
        <Link
          href={`/w/${workspace.slug}/settings/members`}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
            pathname?.includes('/settings')
              ? isDark
                ? 'bg-[#27292d] text-white font-medium'
                : 'bg-[#dedad0] text-slate-900 font-bold shadow-2xs'
              : isDark
                ? 'text-slate-400 hover:bg-[#222428] hover:text-white'
                : 'text-slate-600 hover:bg-[#eeebe3] hover:text-slate-950 font-medium'
          }`}
          title="Team Roles & Workspace Settings"
        >
          <Settings className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          {!isCollapsed && <span>Team Settings</span>}
        </Link>

        {!isCollapsed ? (
          <div className="relative">
            <div
              className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-[#1f2124] border-[#2d3035] text-white'
                  : 'bg-white border-[#dedad0] text-slate-900 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 overflow-hidden flex-1 text-left group"
                title="Click to Switch Active Role / Account"
              >
                <Avatar user={currentUser} size="sm" showTooltip={false} />
                <div className="truncate">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {currentUser.fullName}
                  </div>
                  <div className="text-[10px] text-teal-700 font-bold flex items-center gap-1 capitalize">
                    <Shield className="w-2.5 h-2.5" />
                    <span>{currentUser.role || 'Member'}</span>
                    <ChevronsUpDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-600 ml-0.5" />
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  router.push('/login');
                }}
                className={`p-1.5 rounded-md transition-colors ${
                  isDark
                    ? 'hover:bg-[#2e3136] text-slate-400 hover:text-red-400'
                    : 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                }`}
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Role / User Switcher Popover for Testing Stages */}
            {isUserMenuOpen && (
              <div
                className={`absolute bottom-full left-0 mb-2 w-64 rounded-xl shadow-2xl p-2 z-50 border animate-in fade-in zoom-in-95 duration-100 ${
                  isDark
                    ? 'bg-[#1e2024] text-slate-200 border-[#2d3036]'
                    : 'bg-white text-slate-800 border-slate-200 shadow-xl'
                }`}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>Switch Role / User</span>
                  <span className="text-[9px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-bold">Testing</span>
                </div>
                <div className="space-y-1">
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setCurrentUser(u);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                          isSelected
                            ? 'bg-teal-50/70 border border-teal-200/80 font-bold text-teal-900'
                            : isDark
                              ? 'hover:bg-[#27292d] text-slate-300'
                              : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden truncate">
                          <Avatar user={u} size="xs" showTooltip={false} />
                          <div className="truncate">
                            <div className="font-semibold truncate">{u.fullName}</div>
                            <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                              <Shield className="w-2.5 h-2.5" />
                              <span>{u.role || 'Member'}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-teal-800 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-1">
            <Avatar user={currentUser} size="sm" />
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className={`p-1 rounded ${
                isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-400 hover:text-rose-600'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Create Space Modal */}
      {isNewSpaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSpace}
            className="w-full max-w-sm bg-white text-text rounded-xl shadow-modal border border-slate-200 p-5 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Create New Space</h3>
              <button
                type="button"
                onClick={() => setIsNewSpaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Space Name</label>
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g. Mobile Apps, DevOps, Marketing"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color Theme</label>
                <div className="flex items-center gap-2">
                  {['#7b68ee', '#2563eb', '#16a34a', '#ea580c', '#ec4899', '#06b6d4'].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewSpaceColor(col)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                        newSpaceColor === col ? 'scale-110 ring-2 ring-offset-2 ring-accent' : ''
                      }`}
                      style={{ backgroundColor: col }}
                    >
                      {newSpaceColor === col && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewSpaceModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newSpaceName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs bg-accent hover:bg-accent-hover text-white font-semibold shadow-xs disabled:opacity-50"
              >
                Create Space
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create List Modal */}
      {newListSpaceId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateList}
            className="w-full max-w-sm bg-white text-text rounded-xl shadow-modal border border-slate-200 p-5 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Add New List</h3>
              <button
                type="button"
                onClick={() => setNewListSpaceId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Sprint 15, Bug Triage"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-accent/40 outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewListSpaceId(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newListName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs bg-accent hover:bg-accent-hover text-white font-semibold shadow-xs disabled:opacity-50"
              >
                Add List
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Space Access & Member Visibility Permissions Modal */}
      {visibilityModalSpace && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVisibility}
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded-sm"
                  style={{ backgroundColor: visibilityModalSpace.color || '#0f766e' }}
                />
                <h3 className="font-bold text-sm text-slate-900">
                  Edit Space: {visibilityModalSpace.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVisibilityModalSpace(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Space Name & Style (Workspace Owner Authority) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-teal-800" />
                    <span>Space Name & Style</span>
                  </label>
                  {currentUser.role === 'owner' && (
                    <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded font-bold">
                      Owner Authorized
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tempSpaceColor}
                    onChange={(e) => setTempSpaceColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 bg-white p-0.5 shadow-2xs"
                    title="Change Space Color"
                  />
                  <input
                    type="text"
                    value={tempSpaceName}
                    onChange={(e) => setTempSpaceName(e.target.value)}
                    placeholder="Space Name"
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-700/40 shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* Privacy Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Visibility Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTempIsPrivate(false)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      !tempIsPrivate
                        ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Unlock className="w-3.5 h-3.5 text-teal-800" />
                      <span>Public</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Visible to all members in {workspace.name}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTempIsPrivate(true)}
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      tempIsPrivate
                        ? 'border-teal-700 bg-teal-50/50 ring-1 ring-teal-700'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Private / Restricted</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Only permitted members can view & contribute
                    </span>
                  </button>
                </div>
              </div>

              {/* Per-member access list (shown when Private) */}
              {tempIsPrivate && (
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-800" />
                      <span>Permitted Members ({tempAllowedMemberIds.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Owner always has access
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 bg-white rounded-lg border border-slate-200 p-2">
                    {users.map((u) => {
                      const isAllowed = tempAllowedMemberIds.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar user={u} size="xs" showTooltip={false} />
                            <div>
                              <div className="font-semibold text-slate-800">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">@{u.username || u.id}</div>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={isAllowed}
                            onChange={() => toggleMemberPermission(u.id)}
                            className="w-4 h-4 rounded text-teal-800 border-slate-300 focus:ring-teal-700"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* Space Status & Clutter Control (Active vs Inactive) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Archive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Space Status</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {visibilityModalSpace.isArchived
                      ? 'Currently Inactive (hidden from active spaces)'
                      : 'Active space (visible in main navigation)'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    toggleSpaceArchive(visibilityModalSpace.id);
                    setVisibilityModalSpace(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs ${
                    visibilityModalSpace.isArchived
                      ? 'bg-teal-700 hover:bg-teal-800 text-white'
                      : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {visibilityModalSpace.isArchived ? 'Reactivate Space' : 'Mark as Inactive'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-6 pt-3 border-t border-slate-100">
              {visibilityModalSpace.isArchived && currentUser.role === 'owner' ? (
                <button
                  type="button"
                  onClick={() => {
                    const sp = visibilityModalSpace;
                    setVisibilityModalSpace(null);
                    setSpaceToDelete(sp);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Space</span>
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibilityModalSpace(null)}
                  className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
      {/* Create New Company / Entity Modal */}
      {isCreateCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCompany}
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold text-sm text-slate-900">Create New Company / Entity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateCompanyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="e.g. Apex Dynamics, Vertex Logistics"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Each entity operates with its own isolated spaces, member roles, and task workflows.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateCompanyModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newCompanyName.trim()}
                className="px-4 py-1.5 rounded-xl text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-xs disabled:opacity-50"
              >
                Create Company
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Current Company Modal (Workspace Owner Authority) */}
      {isRenameCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameCompany}
            className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Rename Company / Entity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRenameCompanyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>Workspace Owner Privilege:</strong> You have authority to rename this company entity. Changes reflect immediately across all team members and navigation links.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Company Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={editCompanyName}
                  onChange={(e) => setEditCompanyName(e.target.value)}
                  placeholder="Enter new company name..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRenameCompanyModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editCompanyName.trim()}
                className="px-4 py-1.5 rounded-xl text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold shadow-xs disabled:opacity-50"
              >
                Save Name
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Project / List Modal */}
      {editingList && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameList}
            className="w-full max-w-sm bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5 text-teal-800" />
                <span>Rename Project / List</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingList(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                List / Project Name
              </label>
              <input
                type="text"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingList(null)}
                className="px-3 py-1.5 rounded-lg text-xs border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!editListName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Permanent Space Deletion Confirmation Modal (Owner Only) */}
      {spaceToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Delete Inactive Space</h3>
                <span className="text-[10px] text-slate-400 font-medium">Workspace Owner Action</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Are you sure you want to permanently delete <strong>&quot;{spaceToDelete.name}&quot;</strong>?
            </p>

            <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-xl mb-5 leading-normal">
              <strong>Warning:</strong> This space, its lists, and all associated tasks will be permanently removed from this workspace.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSpaceToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSpace(spaceToDelete.id);
                  setSpaceToDelete(null);
                  if (visibilityModalSpace?.id === spaceToDelete.id) {
                    setVisibilityModalSpace(null);
                  }
                }}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Per-User Personalization & Display Preferences Modal */}
      <PreferencesModal />
    </aside>
  );
}
