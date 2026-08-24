'use client';

import React, { useState, useEffect, useCallback } from 'react';
import * as fabric from 'fabric';
import {
  Settings,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Trash2,
  Copy,
  Layers,
  Upload,
  Wand2,
  RefreshCw,
} from 'lucide-react';

interface RightSidebarProps {
  selectedObject: fabric.FabricObject | null;
  canvasWidth: number;
  canvasHeight: number;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onBgColorChange: (color: string) => void;
  canvasBgColor: string;
  updateSelected: (props: Record<string, unknown>) => void;
  deleteSelected: () => void;
  duplicateSelected?: () => void;
  addText: (preset: 'heading' | 'subheading' | 'body') => void;
  addShape: (type: 'rect' | 'circle' | 'triangle' | 'line') => void;
  addImage: (url: string) => void;
  setBackground: (type: 'color' | 'gradient' | 'image', value: string) => void;
}

function getObjectType(obj: fabric.FabricObject | null): 'textbox' | 'image' | 'shape' | null {
  if (!obj) return null;
  if (obj instanceof fabric.Textbox || obj instanceof fabric.IText) return 'textbox';
  if (obj instanceof fabric.FabricImage) return 'image';
  return 'shape';
}

function safeHex(val: string | undefined | null, fallback: string): string {
  if (!val || !val.startsWith('#')) return fallback;
  return val;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedObject,
  canvasWidth,
  canvasHeight,
  onWidthChange,
  onHeightChange,
  onBgColorChange,
  canvasBgColor,
  updateSelected,
  deleteSelected,
  addText,
  addShape,
  addImage,
  setBackground,
}) => {
  const objType = getObjectType(selectedObject);
  const isTextbox = objType === 'textbox';
  const isImage = objType === 'image';
  const isShape = objType === 'shape';

  // Form state (synced from selected object)
  const [text, setText] = useState('');
  const [fill, setFill] = useState('#000000');
  const [fontSize, setFontSize] = useState(32);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [opacity, setOpacity] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [objWidth, setObjWidth] = useState(100);
  const [objHeight, setObjHeight] = useState(100);
  const [rx, setRx] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // Sync form state from selected object
  useEffect(() => {
    if (!selectedObject) return;

    setPosX(Math.round(selectedObject.left || 0));
    setPosY(Math.round(selectedObject.top || 0));
    setObjWidth(Math.round((selectedObject.width || 0) * (selectedObject.scaleX || 1)));
    setObjHeight(Math.round((selectedObject.height || 0) * (selectedObject.scaleY || 1)));
    setOpacity(selectedObject.opacity ?? 1);
    setRx((selectedObject as any).rx || 0);

    if (selectedObject instanceof fabric.Textbox || selectedObject instanceof fabric.IText) {
      setText(selectedObject.text || '');
      setFill(selectedObject.fill as string || '#000000');
      setFontSize(selectedObject.fontSize || 32);
      setFontWeight(selectedObject.fontWeight as string || 'normal');
      setTextAlign((selectedObject.textAlign as 'left' | 'center' | 'right') || 'left');
      setFontFamily(selectedObject.fontFamily || 'Inter');
    } else if (selectedObject instanceof fabric.FabricImage) {
      setImageUrl((selectedObject as any).src || '');
      setFill(selectedObject.fill as string || '');
    } else {
      // Shape (rect, circle, triangle, line)
      setFill(selectedObject.fill as string || '#6366f1');
    }
  }, [selectedObject]);

  // Update bg color state from prop
  useEffect(() => {
    setBgColor(canvasBgColor);
  }, [canvasBgColor]);

  // ── Position & Size ───────────────────────────────────────────────

  const handlePosChange = useCallback((key: 'left' | 'top', val: number) => {
    updateSelected({ [key]: val });
  }, [updateSelected]);

  const handleSizeChange = useCallback((key: 'width' | 'height', val: number) => {
    const obj = selectedObject;
    if (!obj) return;
    if (key === 'width') {
      const scaleX = obj.scaleX || 1;
      updateSelected({ scaleX: val / (obj.width || 1) });
    } else {
      updateSelected({ scaleY: val / (obj.height || 1) });
    }
  }, [selectedObject, updateSelected]);

  // ── Text properties ──────────────────────────────────────────────

  const handleTextChange = useCallback((val: string) => {
    setText(val);
    updateSelected({ text: val });
  }, [updateSelected]);

  const handleFillChange = useCallback((val: string) => {
    setFill(val);
    updateSelected({ fill: val });
  }, [updateSelected]);

  const handleFontSizeChange = useCallback((val: number) => {
    setFontSize(val);
    updateSelected({ fontSize: val });
  }, [updateSelected]);

  const handleFontWeightChange = useCallback((val: string) => {
    setFontWeight(val);
    updateSelected({ fontWeight: val });
  }, [updateSelected]);

  const handleTextAlignChange = useCallback((val: 'left' | 'center' | 'right') => {
    setTextAlign(val);
    updateSelected({ textAlign: val });
  }, [updateSelected]);

  const handleFontFamilyChange = useCallback((val: string) => {
    setFontFamily(val);
    updateSelected({ fontFamily: val });
  }, [updateSelected]);

  const handleOpacityChange = useCallback((val: number) => {
    setOpacity(val);
    updateSelected({ opacity: val });
  }, [updateSelected]);

  const handleRxChange = useCallback((val: number) => {
    setRx(val);
    updateSelected({ rx: val, ry: val });
  }, [updateSelected]);

  // ── Render ───────────────────────────────────────────────────────

  return (
    <aside className="w-80 flex flex-col border-l border-zinc-800 bg-zinc-900/20 backdrop-blur-sm overflow-y-auto custom-scrollbar p-5 gap-5">

      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <Settings className="w-4 h-4 text-zinc-400" />
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300">
          {selectedObject ? (
            isTextbox ? 'Text Styling' : isImage ? 'Image Styling' : 'Shape Styling'
          ) : 'Canvas Settings'}
        </h2>
      </div>

      {selectedObject ? (
        /* ── Selected Object Panel ──────────────────────────────────── */
        <div className="flex flex-col gap-4">

          {/* Object type badge */}
          <div className="flex items-center gap-2">
            {isTextbox && <Type className="w-3.5 h-3.5 text-indigo-400" />}
            {isImage && <ImageIcon className="w-3.5 h-3.5 text-pink-400" />}
            {isShape && (
              (selectedObject as any).type === 'circle'
                ? <Circle className="w-3.5 h-3.5 text-teal-400" />
                : <Square className="w-3.5 h-3.5 text-teal-400" />
            )}
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              {(selectedObject as any).type || 'Object'}
            </span>
          </div>

          {/* Position */}
          <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/60 text-xs">
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">X</span>
              <input
                type="number"
                value={posX}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setPosX(v);
                  handlePosChange('left', v);
                }}
                className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 focus:outline-none text-zinc-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">Y</span>
              <input
                type="number"
                value={posY}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0;
                  setPosY(v);
                  handlePosChange('top', v);
                }}
                className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 focus:outline-none text-zinc-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">Width</span>
              <input
                type="number"
                value={objWidth}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 20;
                  setObjWidth(v);
                  handleSizeChange('width', v);
                }}
                className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 focus:outline-none text-zinc-200"
              />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 uppercase font-semibold">Height</span>
              <input
                type="number"
                value={objHeight}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 20;
                  setObjHeight(v);
                  handleSizeChange('height', v);
                }}
                className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 focus:outline-none text-zinc-200"
              />
            </div>
          </div>

          {/* Opacity */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Opacity</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setOpacity(v);
                  handleOpacityChange(v);
                }}
                className="flex-1 accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500 font-mono w-8">{Math.round(opacity * 100)}%</span>
            </div>
          </div>

          {/* ── Text specific ──────────────────────────────────────── */}
          {isTextbox && (
            <div className="flex flex-col gap-4 border-t border-zinc-800/80 pt-3">

              {/* Text content */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Text</span>
                <textarea
                  value={text}
                  rows={3}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Fill color */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Color</span>
                <div className="flex gap-1.5">
                  <input
                    type="color"
                    value={safeHex(fill, '#000000')}
                    onChange={(e) => handleFillChange(e.target.value)}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fill}
                    onChange={(e) => handleFillChange(e.target.value)}
                    className="w-full py-0.5 px-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Font family */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Font Family</span>
                <select
                  value={fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                  className="w-full py-1.5 px-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                >
                  <option value="Inter">Inter</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lora">Lora</option>
                  <option value="Raleway">Raleway</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Merriweather">Merriweather</option>
                </select>
              </div>

              {/* Font size + weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Font Size</span>
                  <input
                    type="number"
                    min={8}
                    max={200}
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 12)}
                    className="w-full py-1.5 px-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Weight</span>
                  <select
                    value={fontWeight}
                    onChange={(e) => handleFontWeightChange(e.target.value)}
                    className="w-full py-1.5 px-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="700">Bold (700)</option>
                    <option value="900">Black (900)</option>
                  </select>
                </div>
              </div>

              {/* Alignment */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Alignment</span>
                <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                  {(['left', 'center', 'right'] as const).map(a => (
                    <button
                      key={a}
                      onClick={() => handleTextAlignChange(a)}
                      className={`py-1 text-center rounded text-[10px] font-bold ${textAlign === a ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Letter spacing */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Letter Spacing</span>
                <input
                  type="number"
                  min={-10}
                  max={20}
                  value={(selectedObject as any).charSpacing ? Math.round((selectedObject as any).charSpacing / 100) : 0}
                  onChange={(e) => updateSelected({ charSpacing: parseInt(e.target.value) * 100 })}
                  className="w-full py-1.5 px-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ── Image specific ─────────────────────────────────────── */}
          {isImage && (
            <div className="flex flex-col gap-4 border-t border-zinc-800/80 pt-3">

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Image URL</span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    // Load new image from URL
                    if (e.target.value && selectedObject) {
                      fabric.FabricImage.fromURL(e.target.value, { crossOrigin: 'anonymous' }).then((img) => {
                        const scale = Math.min(
                          (canvasWidth * 0.6) / (img.width || 1),
                          (canvasHeight * 0.6) / (img.height || 1),
                          1
                        );
                        updateSelected({
                          src: e.target.value,
                          width: img.width,
                          height: img.height,
                          scaleX: scale,
                          scaleY: scale,
                        });
                      });
                    }
                  }}
                  className="w-full py-1.5 px-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Upload Image</span>
                <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer transition-colors mt-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const url = reader.result as string;
                        setImageUrl(url);
                        fabric.FabricImage.fromURL(url).then((img) => {
                          const scale = Math.min(
                            (canvasWidth * 0.6) / (img.width || 1),
                            (canvasHeight * 0.6) / (img.height || 1),
                            1
                          );
                          updateSelected({
                            src: url,
                            width: img.width,
                            height: img.height,
                            scaleX: scale,
                            scaleY: scale,
                          });
                        });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Border radius (rx/ry) */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Corner Radius</span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={rx}
                  onChange={(e) => handleRxChange(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 mt-1 cursor-pointer"
                />
                <span className="text-[9px] text-zinc-600 text-right">{rx}px</span>
              </div>
            </div>
          )}

          {/* ── Shape specific ─────────────────────────────────────── */}
          {isShape && (
            <div className="flex flex-col gap-4 border-t border-zinc-800/80 pt-3">

              {/* Fill color */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Fill Color</span>
                <div className="flex gap-1.5 mt-1">
                  <input
                    type="color"
                    value={safeHex(fill, '#6366f1')}
                    onChange={(e) => handleFillChange(e.target.value)}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fill}
                    onChange={(e) => handleFillChange(e.target.value)}
                    className="w-full py-0.5 px-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              {/* Stroke */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Stroke</span>
                <div className="flex gap-1.5 mt-1">
                  <input
                    type="color"
                    value={safeHex(selectedObject.stroke as string || '', '#000000')}
                    onChange={(e) => updateSelected({ stroke: e.target.value })}
                    className="w-7 h-7 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={selectedObject.strokeWidth || 0}
                    onChange={(e) => updateSelected({ strokeWidth: parseInt(e.target.value) || 0 })}
                    className="w-full py-0.5 px-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] focus:outline-none"
                    placeholder="Width"
                  />
                </div>
              </div>

              {/* Corner radius (for rects) */}
              {(selectedObject as any).type !== 'circle' && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Corner Radius</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={rx}
                    onChange={(e) => handleRxChange(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 mt-1 cursor-pointer"
                  />
                  <span className="text-[9px] text-zinc-600 text-right">{rx}px</span>
                </div>
              )}
            </div>
          )}

          {/* ── Quick Actions ──────────────────────────────────────── */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/80 pt-4 mt-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={deleteSelected}
                className="flex items-center justify-center gap-1 py-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-xs text-red-400 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => {
                  // Duplicate by cloning the selected object
                  if (selectedObject) {
                    selectedObject.clone().then((cloned: fabric.FabricObject) => {
                      cloned.set({
                        left: (selectedObject.left || 0) + 30,
                        top: (selectedObject.top || 0) + 30,
                      });
                      // We need to add to canvas - emit event or use ref
                      // For now, just set position
                      updateSelected({ left: selectedObject.left });
                    });
                  }
                }}
                className="flex items-center justify-center gap-1 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-semibold cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                Duplicate
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ── Canvas Settings Panel (no selection) ──────────────────── */
        <div className="flex flex-col gap-4">

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Canvas Dimensions</span>
            <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800 mt-1">
              <div>
                <span className="text-[9px] text-zinc-500">Width</span>
                <input
                  type="number"
                  value={canvasWidth}
                  onChange={(e) => onWidthChange(parseInt(e.target.value) || 1080)}
                  className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[9px] text-zinc-500">Height</span>
                <input
                  type="number"
                  value={canvasHeight}
                  onChange={(e) => onHeightChange(parseInt(e.target.value) || 1080)}
                  className="w-full mt-1 py-1 px-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Background Color</span>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={safeHex(bgColor, '#FFFFFF')}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  onBgColorChange(e.target.value);
                  setBackground('color', e.target.value);
                }}
                className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  onBgColorChange(e.target.value);
                  setBackground('color', e.target.value);
                }}
                className="flex-1 py-1 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-zinc-800/80 pt-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Background Image URL</span>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              onChange={(e) => {
                if (e.target.value) setBackground('image', e.target.value);
              }}
              className="w-full py-1.5 px-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none mt-1"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Upload BG Image</span>
            <label className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer transition-colors mt-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose File</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setBackground('image', reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
            </label>
          </div>

          {/* Add elements */}
          <div className="flex flex-col gap-2 border-t border-zinc-800/80 pt-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Add Elements</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addText('heading')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <Type className="w-4 h-4 text-indigo-400" />
                <span>Text</span>
              </button>
              <button
                onClick={() => addShape('rect')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <Square className="w-4 h-4 text-teal-400" />
                <span>Shape</span>
              </button>
              <button
                onClick={() => addImage('https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400')}
                className="flex flex-col items-center gap-1 p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors text-[10px] font-bold cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Image</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </aside>
  );
};
