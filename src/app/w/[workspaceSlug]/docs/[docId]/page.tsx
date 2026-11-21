'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Save, Trash2, Check } from 'lucide-react';
import { useApp } from '@/lib/store';
import Link from 'next/link';

export default function DocEditorPage({ params }: { params: { docId: string; workspaceSlug: string } }) {
  const { docs, updateDoc, workspace } = useApp();
  const router = useRouter();

  const doc = docs.find((d) => d.id === params.docId);

  const [title, setTitle] = useState(doc?.title || 'Untitled Doc');
  const [content, setContent] = useState(doc?.content || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!doc) {
    return (
      <div className="p-8 text-center text-xs text-text-muted">
        Document not found.{' '}
        <Link href={`/w/${params.workspaceSlug}/docs`} className="text-accent underline">
          Return to Docs
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    updateDoc(doc.id, { title, content });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Editor top toolbar */}
      <div className="h-12 px-6 border-b border-border flex items-center justify-between flex-shrink-0 bg-surface/50">
        <div className="flex items-center gap-3">
          <Link
            href={`/w/${workspace.slug}/docs`}
            className="p-1 rounded hover:bg-surface text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="text-xs text-text-muted">Docs &gt;</span>
          <span className="text-xs font-semibold text-text">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-4">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-text border-b border-transparent hover:border-border focus:border-accent outline-none pb-2 transition-colors"
          placeholder="Document Title"
        />

        {/* Content Markdown Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={24}
          placeholder="Start writing markdown content..."
          className="w-full text-sm leading-relaxed p-4 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent bg-surface/30 font-mono text-text resize-y"
        />
      </div>
    </div>
  );
}
