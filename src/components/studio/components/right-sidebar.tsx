'use client';

import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FlipHorizontal,
  FlipVertical,
  Trash2,
  Copy,
} from 'lucide-react';
import * as fabric from 'fabric';
import { useEditor } from '../context';

const FONT_FAMILIES = [
  'Inter',
  'Playfair Display',
  'Montserrat',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Lora',
  'Raleway',
  'Source Sans Pro',
  'Merriweather',
];

export function RightSidebar() {
  const {
    selectedObject,
    updateSelectedObject,
    deleteSelected,
    canvas,
    setBackground,
    canvasWidth,
    canvasHeight,
  } = useEditor();

  const isText = selectedObject instanceof fabric.Textbox || selectedObject instanceof fabric.IText;
  const isImage = selectedObject instanceof fabric.FabricImage;
  const isShape = selectedObject && !isText && !isImage;

  if (!selectedObject) {
    return (
      <aside className="w-[280px] bg-white border-l border-zinc-200 flex flex-col shrink-0 select-none">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Canvas</h2>
        </div>
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">Dimensions</span>
            <span className="text-[11px] text-zinc-600 font-mono font-semibold">
              {canvasWidth} &times; {canvasHeight}
            </span>
          </div>
          <label className="text-[11px] text-zinc-400 font-medium">Background color</label>
          <input
            type="color"
            className="w-full h-8 rounded-md border border-zinc-300 cursor-pointer bg-transparent"
            onChange={(e) => setBackground('color', e.target.value)}
          />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] bg-white border-l border-zinc-200 flex flex-col shrink-0 overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
        <h2 className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
          {isText ? 'Text Properties' : isImage ? 'Image Properties' : 'Shape Properties'}
        </h2>
        <div className="flex gap-1">
          <button
            type="button"
            className="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-zinc-800 hover:bg-zinc-100 transition-all"
            onClick={async () => {
              if (!canvas || !selectedObject) return;
              const clone = await selectedObject.clone();
              clone.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
              });
              canvas.add(clone);
              canvas.setActiveObject(clone);
              canvas.requestRenderAll();
            }}
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            type="button"
            className="p-1 rounded text-zinc-400 bg-transparent border-none cursor-pointer hover:text-red-500 hover:bg-red-50 transition-all"
            onClick={deleteSelected}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* ── Text properties ───────────────────────────────────────── */}
        {isText && (
          <>
            {/* Font family */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Font family</label>
              <select
                className="w-full bg-white border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none cursor-pointer focus:border-indigo-500"
                value={(selectedObject as any).fontFamily || 'Inter'}
                onChange={(e) => updateSelectedObject({ fontFamily: e.target.value })}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f} style={{ fontFamily: f }}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Font size</label>
              <input
                type="number"
                className="w-full bg-white border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-indigo-500"
                value={(selectedObject as any).fontSize || 18}
                onChange={(e) =>
                  updateSelectedObject({
                    fontSize: parseInt(e.target.value, 10) || 18,
                  })
                }
              />
            </div>

            {/* Bold / Italic / Underline */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Style</label>
              <div className="flex gap-1">
                <button
                  type="button"
                  className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                    (selectedObject as any).fontWeight === '700' ||
                    (selectedObject as any).fontWeight === 'bold'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                  }`}
                  onClick={() =>
                    updateSelectedObject({
                      fontWeight:
                        (selectedObject as any).fontWeight === '700' ||
                        (selectedObject as any).fontWeight === 'bold'
                          ? '400'
                          : '700',
                    })
                  }
                >
                  <Bold size={14} />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                    (selectedObject as any).fontStyle === 'italic'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                  }`}
                  onClick={() =>
                    updateSelectedObject({
                      fontStyle:
                        (selectedObject as any).fontStyle === 'italic' ? 'normal' : 'italic',
                    })
                  }
                >
                  <Italic size={14} />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                    (selectedObject as any).underline
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                  }`}
                  onClick={() =>
                    updateSelectedObject({ underline: !(selectedObject as any).underline })
                  }
                >
                  <Underline size={14} />
                </button>
              </div>
            </div>

            {/* Text alignment */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Alignment</label>
              <div className="flex gap-1">
                {[
                  { align: 'left', icon: AlignLeft },
                  { align: 'center', icon: AlignCenter },
                  { align: 'right', icon: AlignRight },
                ].map(({ align, icon: Icon }) => (
                  <button
                    key={align}
                    type="button"
                    className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                      (selectedObject as any).textAlign === align
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                    }`}
                    onClick={() => updateSelectedObject({ textAlign: align })}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>

            {/* Text color */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={((selectedObject as any).fill as string) || '#ffffff'}
                  onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 bg-white border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-indigo-500 font-mono"
                  value={((selectedObject as any).fill as string) || '#ffffff'}
                  onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                />
              </div>
            </div>

            {/* Line height */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 flex justify-between font-medium">
                Line height
                <span className="text-zinc-600 font-mono">
                  {((selectedObject as any).lineHeight || 1.2).toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.1"
                className="w-full accent-indigo-600"
                value={(selectedObject as any).lineHeight || 1.2}
                onChange={(e) =>
                  updateSelectedObject({
                    lineHeight: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            {/* Letter spacing */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 flex justify-between font-medium">
                Letter spacing
                <span className="text-zinc-600 font-mono">
                  {(selectedObject as any).charSpacing || 0}
                </span>
              </label>
              <input
                type="range"
                min="-200"
                max="800"
                step="10"
                className="w-full accent-indigo-600"
                value={(selectedObject as any).charSpacing || 0}
                onChange={(e) =>
                  updateSelectedObject({
                    charSpacing: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
          </>
        )}

        {/* ── Shape properties ──────────────────────────────────────── */}
        {isShape && (
          <>
            {/* Fill color */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Fill color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={(selectedObject.fill as string) || '#6366f1'}
                  onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                />
                <input
                  type="text"
                  className="flex-1 bg-white border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-indigo-500 font-mono"
                  value={(selectedObject.fill as string) || '#6366f1'}
                  onChange={(e) => updateSelectedObject({ fill: e.target.value })}
                />
              </div>
            </div>

            {/* Stroke */}
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Stroke</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-8 h-8 rounded border border-zinc-300 cursor-pointer bg-transparent shrink-0"
                  value={(selectedObject.stroke as string) || '#000000'}
                  onChange={(e) => updateSelectedObject({ stroke: e.target.value })}
                />
                <input
                  type="number"
                  className="w-20 bg-white border border-zinc-300 rounded-md text-xs text-zinc-700 px-2 py-1.5 outline-none focus:border-indigo-500"
                  value={selectedObject.strokeWidth || 0}
                  min={0}
                  placeholder="Width"
                  onChange={(e) =>
                    updateSelectedObject({
                      strokeWidth: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Border radius (for rect) */}
            {selectedObject instanceof fabric.Rect && (
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 flex justify-between font-medium">
                  Border radius
                  <span className="text-zinc-600 font-mono">
                    {(selectedObject as any).rx || 0}px
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-indigo-600"
                  value={(selectedObject as any).rx || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    updateSelectedObject({ rx: val, ry: val });
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* ── Image properties ──────────────────────────────────────── */}
        {isImage && (
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block font-medium">Flip</label>
            <div className="flex gap-1">
              <button
                type="button"
                className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                  selectedObject.flipX
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                }`}
                onClick={() => updateSelectedObject({ flipX: !selectedObject.flipX })}
                title="Flip Horizontal"
              >
                <FlipHorizontal size={14} />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                  selectedObject.flipY
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-transparent border-zinc-300 text-zinc-400 hover:text-zinc-800'
                }`}
                onClick={() => updateSelectedObject({ flipY: !selectedObject.flipY })}
                title="Flip Vertical"
              >
                <FlipVertical size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Common: Opacity ───────────────────────────────────────── */}
        <div>
          <label className="text-[11px] text-zinc-400 mb-1 flex justify-between font-medium">
            Opacity
            <span className="text-zinc-600 font-mono">
              {Math.round((selectedObject.opacity ?? 1) * 100)}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            className="w-full accent-indigo-600"
            value={selectedObject.opacity ?? 1}
            onChange={(e) =>
              updateSelectedObject({
                opacity: parseFloat(e.target.value),
              })
            }
          />
        </div>
      </div>
    </aside>
  );
}
