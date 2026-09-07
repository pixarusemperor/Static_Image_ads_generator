'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Type,
  Square,
  Circle,
  Triangle,
  Minus,
  Upload,
  Palette,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { useEditor } from '../context';
import { TemplateCard } from './template-card';
import { DesignList } from './design-list';

type Section = 'templates' | 'text' | 'shapes' | 'images' | 'background' | 'designs';

const SECTIONS: { key: Section; icon: any; label: string }[] = [
  { key: 'templates', icon: Sparkles, label: 'Templates' },
  { key: 'shapes', icon: Square, label: 'Elements' },
  { key: 'text', icon: Type, label: 'Text' },
  { key: 'images', icon: Upload, label: 'Uploads' },
  { key: 'background', icon: Palette, label: 'Bg' },
  { key: 'designs', icon: LayoutGrid, label: 'Designs' },
];

const SECTION_TITLES: Record<Section, string> = {
  templates: 'Templates',
  shapes: 'Elements',
  text: 'Text',
  images: 'Uploads',
  background: 'Background',
  designs: 'Designs',
};

const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

const BG_COLORS = [
  '#1a1a2e', '#0f172a', '#18181b', '#1e1b4b',
  '#ffffff', '#f8fafc', '#fafaf9', '#fef3c7',
  '#2563eb', '#7c3aed', '#dc2626', '#059669',
  '#0891b2', '#d97706', '#e11d48', '#4f46e5',
];

export function LeftSidebar() {
  const { addText, addShape, addImage, setBackground, templates, loadTemplate } = useEditor();
  const [activeSection, setActiveSection] = useState<Section | null>('templates');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  const handleSectionClick = (key: Section) => {
    setActiveSection((prev) => (prev === key ? null : key));
  };

  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        for (const file of Array.from(files)) {
          const form = new FormData();
          form.append('file', file);
          const resp = await fetch('/api/studio/uploads', { method: 'POST', body: form });
          const data = await resp.json();
          if (data.url) addImage(data.url);
        }
      } catch (e) {
        console.error('Upload failed:', e);
      } finally {
        setUploading(false);
      }
    },
    [addImage]
  );

  const handleBgUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const form = new FormData();
      form.append('file', files[0]);
      try {
        const resp = await fetch('/api/studio/uploads', { method: 'POST', body: form });
        const data = await resp.json();
        if (data.url) setBackground('image', data.url);
      } catch (e) {
        console.error('Bg upload failed:', e);
      }
    },
    [setBackground]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleImageUpload(e.dataTransfer?.files ?? null);
    },
    [handleImageUpload]
  );

  const isOpen = activeSection !== null;

  return (
    <aside className="flex flex-row shrink-0 select-none">
      {/* Icon Rail */}
      <div className="w-[70px] bg-white border-r border-zinc-200 flex flex-col items-center pt-2 gap-1 shrink-0 z-10">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              type="button"
              className={`flex flex-col items-center justify-center gap-1 w-[56px] h-[56px] rounded-lg bg-transparent border-none cursor-pointer transition-all ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100'
              }`}
              onClick={() => handleSectionClick(s.key)}
              title={s.label}
            >
              <Icon size={20} />
              <span className="text-[10px] leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expandable Content Panel */}
      <div
        className="bg-white border-r border-zinc-200 overflow-hidden transition-all duration-200 ease-in-out"
        style={{ width: isOpen ? '240px' : '0px' }}
      >
        <div className="w-[240px] h-full flex flex-col">
          {activeSection && (
            <>
              <div className="px-4 pt-4 pb-2 shrink-0 border-b border-zinc-100">
                <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider m-0">
                  {SECTION_TITLES[activeSection]}
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {activeSection === 'templates' && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-3">Click a template to load</p>
                    <div className="grid grid-cols-2 gap-2">
                      {templates.map((t) => (
                        <TemplateCard key={t.id} template={t} onClick={() => loadTemplate(t)} />
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'text' && (
                  <div className="flex flex-col gap-2">
                    <p className="text-zinc-400 text-[11px] mb-1">Click to add text</p>
                    <button
                      type="button"
                      className="w-full text-left p-3 rounded-lg bg-white border border-zinc-200 cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50/40 group"
                      onClick={() => addText('heading')}
                    >
                      <span className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors block">
                        Add a heading
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Montserrat Bold, 48px
                      </span>
                    </button>
                    <button
                      type="button"
                      className="w-full text-left p-3 rounded-lg bg-white border border-zinc-200 cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50/40 group"
                      onClick={() => addText('subheading')}
                    >
                      <span className="text-sm font-medium text-zinc-900 group-hover:text-indigo-600 transition-colors block">
                        Add a subheading
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Inter Medium, 32px
                      </span>
                    </button>
                    <button
                      type="button"
                      className="w-full text-left p-3 rounded-lg bg-white border border-zinc-200 cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50/40 group"
                      onClick={() => addText('body')}
                    >
                      <span className="text-xs text-zinc-900 group-hover:text-indigo-600 transition-colors block">
                        Add body text
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        Inter Regular, 18px
                      </span>
                    </button>
                  </div>
                )}

                {activeSection === 'shapes' && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-2">Click to add a shape</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'rect' as const, icon: Square, label: 'Rectangle' },
                        { type: 'circle' as const, icon: Circle, label: 'Circle' },
                        { type: 'triangle' as const, icon: Triangle, label: 'Triangle' },
                        { type: 'line' as const, icon: Minus, label: 'Line' },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <button
                            key={s.type}
                            type="button"
                            className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white border border-zinc-200 cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50/50"
                            onClick={() => addShape(s.type)}
                          >
                            <Icon size={24} className="text-zinc-600" />
                            <span className="text-[11px] text-zinc-600 font-medium">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeSection === 'images' && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-2">Upload images to canvas</p>
                    <div
                      className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center cursor-pointer transition-all hover:border-indigo-500 hover:bg-indigo-50/30"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <Upload size={24} className="text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs text-zinc-600 font-medium">
                        {uploading ? 'Uploading...' : 'Click or drag images here'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG, SVG, WebP</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </div>
                )}

                {activeSection === 'background' && (
                  <div>
                    <p className="text-zinc-400 text-[11px] mb-2 font-medium">Solid colors</p>
                    <div className="grid grid-cols-4 gap-1.5 mb-4">
                      {BG_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className="w-full aspect-square rounded-md border border-zinc-300 cursor-pointer transition-all hover:scale-110 hover:border-indigo-500 shadow-sm"
                          style={{ background: c }}
                          onClick={() => setBackground('color', c)}
                        />
                      ))}
                    </div>

                    <p className="text-zinc-400 text-[11px] mb-2 font-medium">Custom color</p>
                    <input
                      type="color"
                      className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer bg-transparent mb-4"
                      onChange={(e) => setBackground('color', e.target.value)}
                    />

                    <p className="text-zinc-400 text-[11px] mb-2 font-medium">Gradient presets</p>
                    <div className="grid grid-cols-3 gap-1.5 mb-4">
                      {GRADIENT_PRESETS.map((g, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full aspect-square rounded-md border border-zinc-300 cursor-pointer transition-all hover:scale-110 hover:border-indigo-500 shadow-sm"
                          style={{ background: g }}
                          onClick={() => {
                            const match = g.match(/#[0-9a-f]{6}/gi);
                            if (match) setBackground('color', match[0]);
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-zinc-400 text-[11px] mb-2 font-medium">Background image</p>
                    <button
                      type="button"
                      className="w-full p-2.5 rounded-lg bg-white border border-zinc-200 cursor-pointer text-xs text-zinc-600 font-medium hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
                      onClick={() => bgFileRef.current?.click()}
                    >
                      <Upload size={14} className="inline mr-1.5" />
                      Upload background image
                    </button>
                    <input
                      ref={bgFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleBgUpload(e.target.files)}
                    />
                  </div>
                )}

                {activeSection === 'designs' && <DesignList />}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
