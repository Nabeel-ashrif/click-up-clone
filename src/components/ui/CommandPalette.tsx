'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckSquare, Folder, FileText, UserPlus, X, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    tasks,
    workspace,
    docs,
    setSelectedTaskId,
    setIsQuickAddOpen,
  } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const allLists = workspace.spaces.flatMap((s) => [
    ...s.lists.map((l) => ({ ...l, spaceName: s.name })),
    ...s.folders.flatMap((f) => f.lists.map((l) => ({ ...l, spaceName: `${s.name} / ${f.name}` }))),
  ]).filter((l) => l.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4);

  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const actions = [
    {
      id: 'act-new-task',
      label: 'Create new task (Ctrl+T)',
      icon: CheckSquare,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        setIsQuickAddOpen(true);
      },
    },
    {
      id: 'act-invite',
      label: 'Manage team & invite members',
      icon: UserPlus,
      onSelect: () => {
        setIsCommandPaletteOpen(false);
        router.push(`/w/${workspace.slug}/settings/members`);
      },
    },
  ];

  const totalItems = filteredTasks.length + allLists.length + filteredDocs.length + actions.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white rounded-lg shadow-modal border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-text-muted mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, lists, docs, or type a command..."
            className="w-full text-sm outline-none text-text placeholder-text-muted"
          />
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded hover:bg-surface text-text-muted hover:text-text"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-border">
          {/* Actions */}
          <div className="pb-2">
            <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
              Quick Actions
            </div>
            {actions.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={act.onSelect}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs rounded hover:bg-surface-hover text-left transition-colors"
              >
                <act.icon className="w-4 h-4 text-accent" />
                <span className="font-medium text-text">{act.label}</span>
              </button>
            ))}
          </div>

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div className="py-2">
              <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Tasks
              </div>
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-surface-hover text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <CheckSquare className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="font-medium text-text truncate">{task.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Lists */}
          {allLists.length > 0 && (
            <div className="py-2">
              <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Lists & Spaces
              </div>
              {allLists.map((list) => (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    router.push(`/w/${workspace.slug}/v/l/${list.id}`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-surface-hover text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Folder className="w-4 h-4 text-accent flex-shrink-0" />
                    <div>
                      <div className="font-medium text-text">{list.name}</div>
                      <div className="text-[10px] text-text-muted">{list.spaceName}</div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Docs */}
          {filteredDocs.length > 0 && (
            <div className="py-2">
              <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Docs
              </div>
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => {
                    setIsCommandPaletteOpen(false);
                    router.push(`/w/${workspace.slug}/docs/${doc.id}`);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded hover:bg-surface-hover text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="font-medium text-text truncate">{doc.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-2 bg-surface border-t border-border flex items-center justify-between text-[11px] text-text-muted">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white border border-border rounded text-[10px]">Esc</kbd>
            to close
          </span>
        </div>
      </div>
    </div>
  );
}
