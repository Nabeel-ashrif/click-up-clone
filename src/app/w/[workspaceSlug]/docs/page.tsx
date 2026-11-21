'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Calendar, User, ArrowRight } from 'lucide-react';
import { useApp } from '@/lib/store';
import { format, parseISO } from 'date-fns';

export default function DocsIndexPage() {
  const { docs, createDoc, workspace, getUserById } = useApp();
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    createDoc(newDocTitle.trim());
    setNewDocTitle('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            Workspace Docs & Wiki
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Documentation, architecture decisions, specifications, and SOPs for {workspace.name}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Doc</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="p-4 bg-white border border-accent rounded-lg shadow-sm">
          <label className="block text-xs font-semibold text-text mb-1">Document Title</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="e.g. System Architecture, API Contract..."
              className="flex-1 px-3 py-1.5 text-xs border border-border rounded focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-accent text-white text-xs font-semibold rounded hover:bg-accent-hover"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 border border-border text-xs text-text-muted hover:text-text rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => {
          const author = getUserById(doc.createdById);

          return (
            <Link
              key={doc.id}
              href={`/w/${workspace.slug}/docs/${doc.id}`}
              className="p-5 bg-white border border-border hover:border-accent rounded-lg shadow-xs hover:shadow-card transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-accent" />
                  <h3 className="font-bold text-sm text-text group-hover:text-accent transition-colors">
                    {doc.title}
                  </h3>
                </div>
                <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                  {doc.content.replace(/[#*`_]/g, '').slice(0, 160)}...
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted pt-4 border-t border-border/60 mt-4">
                <span>By {author ? author.fullName : 'Team Member'}</span>
                <span className="flex items-center gap-1">
                  Updated {format(parseISO(doc.updatedAt), 'MMM d, yyyy')}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
