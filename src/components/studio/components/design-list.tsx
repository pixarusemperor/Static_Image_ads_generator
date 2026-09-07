'use client';

import React, { useState } from 'react';
import { Trash2, Edit3, Plus } from 'lucide-react';
import { useEditor } from '../context';

export function DesignList() {
  const { designs, activeDesign, createDesign, loadDesign, deleteDesign, renameDesign, navigate } =
    useEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const finishRename = () => {
    if (editingId && editName.trim()) renameDesign(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
        onClick={createDesign}
      >
        <Plus size={14} />
        New Design
      </button>

      {designs.length === 0 && (
        <p className="text-zinc-400 text-[11px] text-center py-4">No saved designs yet</p>
      )}

      {designs.map((d) => (
        <div
          key={d.id}
          className={`flex items-center px-2.5 py-2 rounded-lg border transition-all group cursor-pointer ${
            activeDesign?.id === d.id
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-zinc-200 bg-white hover:border-zinc-400'
          }`}
          onClick={() => {
            navigate(`/design/${d.id}`);
            loadDesign(d.id);
          }}
        >
          {editingId === d.id ? (
            <input
              className="flex-1 bg-zinc-100 border border-indigo-500 rounded text-zinc-700 text-xs px-1.5 py-0.5 outline-none"
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
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-zinc-800 truncate block">{d.name}</span>
              <span className="text-[10px] text-zinc-400">
                {d.width}x{d.height} &middot;{' '}
                {new Date(d.updated_at).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button
              type="button"
              className="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-zinc-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                startRename(d.id, d.name);
              }}
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
      ))}
    </div>
  );
}
