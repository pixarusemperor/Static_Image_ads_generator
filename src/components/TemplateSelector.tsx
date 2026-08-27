'use client';

import React, { useState } from 'react';
import { TemplateId } from '@/components/templates';
import { 
  TEMPLATES_REGISTRY, 
  TEMPLATE_CATEGORIES, 
  TemplateCategory, 
  TemplateMetadata 
} from '@/components/templates/template-registry';
import { 
  Check, 
  Eye, 
  Layers, 
  X
} from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [previewModalTemplate, setPreviewModalTemplate] = useState<TemplateMetadata | null>(null);

  const filteredTemplates = TEMPLATES_REGISTRY.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        {TEMPLATE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Visual Template Card Grid */}
      <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`group relative flex flex-col rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer text-left bg-zinc-900/60 hover:bg-zinc-800/70 ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full bg-zinc-950/80 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  onError={(e) => {
                    // Fallback to PNG if webp has issue
                    const target = e.currentTarget;
                    if (!target.src.endsWith('.png')) {
                      target.src = `/templates/thumbnails/${template.id}.png`;
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Gradient shade on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Badge (Top-Left) */}
                <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-zinc-300 border border-white/10 uppercase tracking-wider">
                  {template.id.toUpperCase()}
                </span>

                {/* Category / CTA Badge (Top-Right) */}
                <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 border border-indigo-500/30">
                  {template.badge}
                </span>

                {/* Active Checkmark (Center / Top) */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-indigo-950/40 backdrop-blur-[1px]">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 border border-indigo-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                )}

                {/* Quick Zoom Preview Icon Button */}
                <button
                  title="Preview Template"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalTemplate(template);
                  }}
                  className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/60 hover:bg-black/90 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Footer Info */}
              <div className="p-2 flex flex-col gap-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-200 truncate group-hover:text-indigo-300 transition-colors">
                    {template.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                  <span className="truncate">{template.categoryLabel}</span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-500 flex items-center gap-0.5">
                    <Layers className="w-2.5 h-2.5" />
                    {template.elementCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-size Image Preview Modal */}
      {previewModalTemplate && (
        <div 
          onClick={() => setPreviewModalTemplate(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-xs font-bold uppercase">
                  {previewModalTemplate.id}
                </div>
                <h3 className="text-sm font-bold text-zinc-200">
                  {previewModalTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalTemplate(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative aspect-square w-full bg-zinc-950 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalTemplate.thumbnailUrl}
                alt={previewModalTemplate.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.endsWith('.png')) {
                    target.src = `/templates/thumbnails/${previewModalTemplate.id}.png`;
                  }
                }}
                className="w-full h-full object-contain rounded-lg shadow-xl"
              />
            </div>

            {/* Modal Description & Action */}
            <div className="p-4 bg-zinc-900/90 flex flex-col gap-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                {previewModalTemplate.description}
              </p>
              
              <div className="flex flex-wrap gap-1.5">
                {previewModalTemplate.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setPreviewModalTemplate(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onSelectTemplate(previewModalTemplate.id);
                    setPreviewModalTemplate(null);
                  }}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
