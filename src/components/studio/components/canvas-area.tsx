'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { useEditor } from '../context';
import { PageCanvas } from './page-canvas';

export function CanvasArea() {
  const {
    pages,
    activePageId,
    setActiveCanvas,
    canvasWidth,
    canvasHeight,
    zoom,
    setZoomRaw,
    setFitScale,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
  } = useEditor();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  // Calculate fit scale on mount & resize
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const padding = 120;
    const availW = wrapper.clientWidth - padding;
    const fit = Math.min(availW / canvasWidth, 1);
    setFitScale(fit);
    setZoomRaw(Math.max(fit * 0.9, 0.4));
  }, [canvasWidth, canvasHeight, setFitScale, setZoomRaw]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const obs = new ResizeObserver(() => {
      const padding = 120;
      const availW = wrapper.clientWidth - padding;
      const fit = Math.min(availW / canvasWidth, 1);
      setFitScale(fit);
    });
    obs.observe(wrapper);
    return () => obs.disconnect();
  }, [canvasWidth, canvasHeight, setFitScale]);

  // Cmd+wheel zoom towards mouse position
  const zoomRef = useRef(zoom);
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handler = (e: WheelEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      e.preventDefault();
      const prevZoom = zoomRef.current;
      const factor = e.deltaY > 0 ? 0.95 : 1.05;
      const newZoom = Math.min(Math.max(prevZoom * factor, 0.05), 3);

      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + wrapper.scrollLeft;
      const mouseY = e.clientY - rect.top + wrapper.scrollTop;

      const scale = newZoom / prevZoom;
      wrapper.scrollLeft = mouseX * scale - (e.clientX - rect.left);
      wrapper.scrollTop = mouseY * scale - (e.clientY - rect.top);

      setZoomRaw(newZoom);
    };
    wrapper.addEventListener('wheel', handler, { passive: false });
    return () => wrapper.removeEventListener('wheel', handler);
  }, [setZoomRaw]);

  // Auto-activate first page if none active
  useEffect(() => {
    if (!activePageId && pages.length > 0) {
      setActiveCanvas(pages[0].id);
    }
  }, [pages, activePageId, setActiveCanvas]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const startRename = (pageId: string, currentTitle: string) => {
    setRenamingId(pageId);
    setRenameValue(currentTitle);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      renamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const inverseScale = 1 / zoom;

  return (
    <div
      ref={wrapperRef}
      className="flex-1 overflow-auto"
      style={{ background: '#E8EAEF' }}
    >
      <div
        style={{
          width: Math.max((canvasWidth + 80) * zoom, wrapperRef.current?.clientWidth ?? 0),
          minHeight: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          className="flex flex-col items-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center top',
            padding: '40px 40px 80px',
          }}
        >
          {pages.map((page) => (
            <div
              key={page.id}
              className="mb-10"
              data-page-id={page.id}
              ref={(el) => {
                if (el) pageRefs.current.set(page.id, el);
              }}
            >
              {/* Page header */}
              <div
                style={{
                  height: 32 * inverseScale,
                  marginBottom: 4 * inverseScale,
                }}
              >
                <div
                  className="group/header flex items-center justify-between py-1.5"
                  style={{
                    transform: `scale(${inverseScale})`,
                    transformOrigin: 'left top',
                    width: canvasWidth * zoom,
                    height: 32,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    {renamingId === page.id ? (
                      <input
                        ref={renameRef}
                        className="text-[11px] text-zinc-700 bg-white border border-indigo-500 rounded px-1.5 py-0.5 outline-none font-medium"
                        style={{ width: 140 }}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={finishRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishRename();
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                      />
                    ) : (
                      <span
                        className="text-[11px] text-zinc-500 font-medium cursor-pointer hover:text-zinc-700 transition-colors"
                        onClick={() => startRename(page.id, page.title)}
                      >
                        {page.title}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      className="p-1 rounded bg-transparent border-none cursor-pointer text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      onClick={() => addPage(page.id)}
                      title="Add page below"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded bg-transparent border-none cursor-pointer text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      onClick={() => duplicatePage(page.id)}
                      title="Duplicate page"
                    >
                      <Copy size={14} />
                    </button>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        className="p-1 rounded bg-transparent border-none cursor-pointer text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        onClick={() => deletePage(page.id)}
                        title="Delete page"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Canvas element */}
              <PageCanvas
                page={page}
                isActive={page.id === activePageId}
                width={canvasWidth}
                height={canvasHeight}
                onActivate={() => setActiveCanvas(page.id)}
              />
            </div>
          ))}

          {/* Add page button */}
          <div style={{ height: 40 * inverseScale }}>
            <div
              style={{
                transform: `scale(${inverseScale})`,
                transformOrigin: 'center top',
                height: 40,
              }}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-dashed border-zinc-300 bg-white/70 hover:bg-white cursor-pointer text-xs text-zinc-600 font-medium transition-all hover:border-indigo-500 hover:text-indigo-600 shadow-sm"
                onClick={() => addPage()}
              >
                <Plus size={14} />
                Add page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
