'use client';

import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Save,
  ChevronDown,
  Home,
  Sparkles,
} from 'lucide-react';
import { useEditor, CANVAS_SIZES } from '../context';
import { ImportTemplateModal } from './ImportTemplateModal';

export function Toolbar() {
  const {
    canvasWidth,
    canvasHeight,
    setCanvasSize,
    undo,
    redo,
    canUndo,
    canRedo,
    zoom,
    fitScale,
    zoomToFit,
    zoomIn,
    zoomOut,
    exportPNG,
    saveDesign,
    saving,
    activeDesign,
    renameDesign,
    navigate,
    getCanvasJSON,
    onImportToSuperAds,
  } = useEditor();

  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const currentSize = CANVAS_SIZES.find(
    (s) => s.width === canvasWidth && s.height === canvasHeight
  );
  const sizeLabel = currentSize ? currentSize.label : `${canvasWidth} x ${canvasHeight}`;

  const startRename = () => {
    if (!activeDesign) return;
    setNameValue(activeDesign.name);
    setEditingName(true);
  };

  const finishRename = () => {
    if (activeDesign && nameValue.trim()) {
      renameDesign(activeDesign.id, nameValue.trim());
    }
    setEditingName(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-200 shrink-0 select-none">
        {/* Left: Home + Design name + Canvas size */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-1.5 rounded-lg text-zinc-500 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900"
            onClick={() => navigate('/')}
            title="Back to designs gallery"
          >
            <Home size={16} />
          </button>

          {activeDesign && (
            editingName ? (
              <input
                className="bg-zinc-100 border border-indigo-500 rounded px-2 py-0.5 text-xs text-zinc-900 outline-none w-44"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename();
                  if (e.key === 'Escape') setEditingName(false);
                }}
                autoFocus
              />
            ) : (
              <span
                className="text-xs font-semibold text-zinc-700 cursor-pointer hover:text-zinc-900 transition-colors"
                onDoubleClick={startRename}
                title="Double click to rename"
              >
                {activeDesign.name}
              </span>
            )
          )}

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200 cursor-pointer hover:text-zinc-900 hover:border-zinc-400 transition-all"
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
            >
              {sizeLabel}
              <ChevronDown size={12} />
            </button>
            {showSizeDropdown && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowSizeDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-30 min-w-[210px] py-1">
                  {CANVAS_SIZES.map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className={`w-full text-left px-3 py-1.5 text-xs cursor-pointer border-none transition-colors ${
                        s.width === canvasWidth && s.height === canvasHeight
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-zinc-600 bg-transparent hover:bg-zinc-50'
                      }`}
                      onClick={() => {
                        setCanvasSize(s.width, s.height);
                        setShowSizeDropdown(false);
                      }}
                    >
                      <span className="font-medium">{s.label}</span>
                      <span className="text-zinc-400 ml-2">
                        {s.width} &times; {s.height}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="p-1.5 rounded-md text-zinc-500 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            className="p-1.5 rounded-md text-zinc-500 bg-transparent border-none cursor-pointer transition-all hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Right: Zoom + Import as Template + Export + Save */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-50 rounded-lg p-0.5 border border-zinc-200">
            <button
              type="button"
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 bg-transparent border-none cursor-pointer"
              onClick={zoomOut}
              title="Zoom out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] text-zinc-500 font-mono w-9 text-center">
              {Math.round((zoom / (fitScale || 1)) * 100)}%
            </span>
            <button
              type="button"
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 bg-transparent border-none cursor-pointer"
              onClick={zoomIn}
              title="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              className="p-1 rounded text-zinc-500 hover:text-zinc-900 bg-transparent border-none cursor-pointer"
              onClick={zoomToFit}
              title="Fit to screen"
            >
              <Maximize size={14} />
            </button>
          </div>

          <div className="w-px h-5 bg-zinc-200 mx-0.5" />

          {/* Import to SuperAds Template Button */}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-all cursor-pointer shadow-sm"
            onClick={() => setIsImportModalOpen(true)}
            title="Export this design as an automated SuperAds template contract"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Import as Template</span>
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-all cursor-pointer shadow-sm"
            onClick={exportPNG}
            title="Export as high-res PNG (2x)"
          >
            <Download size={13} />
            Export PNG
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
            onClick={saveDesign}
            disabled={saving || !activeDesign}
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        designName={activeDesign?.name || 'My Studio Template'}
        canvasJson={getCanvasJSON()}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        onSuccessNavigate={onImportToSuperAds}
      />
    </>
  );
}
