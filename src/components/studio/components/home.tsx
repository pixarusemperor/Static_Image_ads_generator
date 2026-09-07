'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import type { Design, Template } from '../types';
import { TemplateCard } from './template-card';

interface HomeProps {
  designs: Design[];
  templates: Template[];
  navigate: (to: string) => void;
  createDesign: () => Promise<string | undefined>;
  deleteDesign: (id: string) => Promise<void>;
  renameDesign: (id: string, name: string) => Promise<void>;
  createFromTemplate: (template: Template) => Promise<string | undefined>;
}

export function Home({
  designs,
  templates,
  navigate,
  createDesign,
  deleteDesign,
  renameDesign,
  createFromTemplate,
}: HomeProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = useCallback(async () => {
    const id = await createDesign();
    if (id) navigate(`/design/${id}`);
  }, [createDesign, navigate]);

  const handleTemplateClick = useCallback(
    async (t: Template) => {
      const id = await createFromTemplate(t);
      if (id) navigate(`/design/${id}`);
    },
    [createFromTemplate, navigate]
  );

  const startRename = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="min-h-full bg-[#F3F4F7] overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 m-0">OpenDesign Studio & Gallery</h1>
            <p className="text-xs text-zinc-500 mt-0.5 m-0">
              Create, customize, and export graphics or publish them into SuperAds
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md"
            onClick={handleCreate}
          >
            <Plus size={15} />
            New Design
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Templates section */}
        {templates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-zinc-800 m-0">Start from a template</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {templates.map((t) => (
                <TemplateCard key={t.id} template={t} onClick={() => handleTemplateClick(t)} />
              ))}
            </div>
          </div>
        )}

        {/* Designs grid */}
        {designs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-700 mb-1">No designs yet</p>
            <p className="text-xs text-zinc-400 mb-4">Create your first design or start from a template</p>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              onClick={handleCreate}
            >
              <Plus size={14} />
              Create Design
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-sm font-bold text-zinc-800 mb-3 m-0">Recent designs</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-xl border border-zinc-200 overflow-hidden cursor-pointer transition-all hover:border-indigo-500 hover:shadow-md group"
                  onClick={() => navigate(`/design/${d.id}`)}
                >
                  <div className="aspect-[4/3] bg-zinc-100 flex items-center justify-center">
                    {d.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.thumbnail_url} alt={d.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-zinc-400 text-xs font-mono font-medium">
                        {d.width} &times; {d.height}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    {editingId === d.id ? (
                      <input
                        className="w-full bg-zinc-100 border border-indigo-500 rounded text-zinc-800 text-xs px-2 py-1 outline-none"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-zinc-800 truncate m-0">{d.name}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 m-0">
                            {d.width} &times; {d.height} &middot;{' '}
                            {new Date(d.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                          <button
                            type="button"
                            className="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-zinc-700 transition-colors"
                            onClick={(e) => startRename(d.id, d.name, e)}
                            title="Rename"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            type="button"
                            className="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDesign(d.id);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
