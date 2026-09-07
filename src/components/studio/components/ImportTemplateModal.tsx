'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, X, RefreshCw, Layers } from 'lucide-react';

interface ImportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  canvasJson: string;
  canvasWidth: number;
  canvasHeight: number;
  onSuccessNavigate?: (templateId: string) => void;
}

export function ImportTemplateModal({
  isOpen,
  onClose,
  designName,
  canvasJson,
  canvasWidth,
  canvasHeight,
  onSuccessNavigate,
}: ImportTemplateModalProps) {
  const [templateName, setTemplateName] = useState(designName || 'Custom Studio Template');
  const [category, setCategory] = useState<'direct-response' | 'publisher' | 'social' | 'recruitment' | 'typographic'>('direct-response');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const resp = await fetch('/api/studio/import-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName.trim(),
          canvasJson,
          category,
          width: canvasWidth,
          height: canvasHeight,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        throw new Error(data.error || 'Failed to import template');
      }

      setImportResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Import error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Import as SuperAds Template</h3>
              <p className="text-xs text-zinc-500">Converts canvas objects into an automated template contract</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importResult ? (
          <div className="py-6 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900">Template Imported Successfully!</h4>
              <p className="text-xs text-zinc-600 mt-1">
                Your design has been compiled into a formal SuperAds contract with {importResult.layerCount} layers.
              </p>
            </div>

            <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 text-left text-xs text-zinc-600 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="font-medium text-zinc-500">Template ID:</span>
                <span className="font-mono text-indigo-600 font-semibold">{importResult.templateId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-zinc-500">Category:</span>
                <span className="capitalize">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-zinc-500">Dimensions:</span>
                <span>{canvasWidth} &times; {canvasHeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-zinc-500">Dynamic Slots:</span>
                <span className="font-medium text-zinc-800">
                  {importResult.contract?.elements?.map((e: any) => e.label).join(', ') || 'Headline, Visuals'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Done
              </button>
              {onSuccessNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSuccessNavigate(importResult.templateId);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Open in Ad Generator</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Minimalist Tech Promo"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Niche / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer bg-white"
              >
                <option value="direct-response">Direct-Response Product (CTR)</option>
                <option value="publisher">Publisher / Tabloid News Card</option>
                <option value="social">Social Native / Testimonial</option>
                <option value="recruitment">Recruitment / Flyer</option>
                <option value="typographic">Typographic & Hook</option>
              </select>
            </div>

            <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-[11px] text-indigo-900 leading-relaxed">
                <strong>Lossless Satori Compilation:</strong> OpenDesign text layers, images, shapes, and positions will be automatically mapped to 3-Sigma Glyph Capacity bounds. You will be able to assemble dynamic variations through AI prompts, API, or external Symphony agents!
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={isSubmitting || !templateName.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Contract...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import as Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
