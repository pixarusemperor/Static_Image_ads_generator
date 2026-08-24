'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as fabric from 'fabric';

const MAX_HISTORY = 50;

export interface CanvasSize {
  label: string;
  width: number;
  height: number;
}

export const CANVAS_PRESETS: CanvasSize[] = [
  { label: '1:1 (1080×1080)', width: 1080, height: 1080 },
  { label: '9:16 (1080×1920)', width: 1080, height: 1920 },
  { label: '16:9 (1920×1080)', width: 1920, height: 1080 },
  { label: 'LinkedIn Square', width: 1080, height: 1080 },
  { label: 'LinkedIn Landscape', width: 1200, height: 627 },
  { label: 'Instagram Story', width: 1080, height: 1920 },
];

interface CanvasHistory {
  entries: string[];
  index: number;
}

export function useFabricCanvas() {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<CanvasHistory>({ entries: [], index: -1 });
  const isRestoringRef = useRef(false);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [canvasWidth, setCanvasWidth] = useState(1080);
  const [canvasHeight, setCanvasHeight] = useState(1080);
  const [zoom, setZoom] = useState(0.58);
  const [fitScale, setFitScale] = useState(0.58);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Update undo/redo state
  const updateUndoRedoState = useCallback(() => {
    const hist = historyRef.current;
    setCanUndo(hist.index > 0);
    setCanRedo(hist.index < hist.entries.length - 1);
  }, []);

  // Save history snapshot
  const saveHistory = useCallback(() => {
    if (isRestoringRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    let hist = historyRef.current;
    hist.entries = hist.entries.slice(0, hist.index + 1);
    hist.entries.push(json);
    if (hist.entries.length > MAX_HISTORY) {
      hist.entries.shift();
    } else {
      hist.index = hist.entries.length - 1;
    }
    updateUndoRedoState();
  }, [updateUndoRedoState]);

  // Initialize canvas
  const initCanvas = useCallback((canvasEl: HTMLCanvasElement, width: number, height: number) => {
    if (canvasRef.current) {
      canvasRef.current.dispose();
    }

    const c = new fabric.Canvas(canvasEl, {
      width,
      height,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true,
      controlsAboveOverlay: true,
    });

    // Retina rendering
    const dpr = window.devicePixelRatio || 1;
    c.setDimensions({ width: width * dpr, height: height * dpr }, { cssOnly: false });
    c.setDimensions({ width, height }, { cssOnly: true });
    c.setViewportTransform([dpr, 0, 0, dpr, 0, 0]);

    // Selection events
    c.on('selection:created', (e) => setSelectedObject(e.selected?.[0] ?? null));
    c.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] ?? null));
    c.on('selection:cleared', () => setSelectedObject(null));

    // History events
    c.on('object:added', () => saveHistory());
    c.on('object:modified', () => saveHistory());
    c.on('object:removed', () => saveHistory());

    canvasRef.current = c;
    canvasElRef.current = canvasEl;

    // Initial history snapshot
    setTimeout(() => {
      const json = JSON.stringify(c.toJSON());
      historyRef.current = { entries: [json], index: 0 };
      updateUndoRedoState();
      setCanvasReady(true);
    }, 100);
  }, [saveHistory, updateUndoRedoState]);

  // Dispose canvas
  const disposeCanvas = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.dispose();
      canvasRef.current = null;
    }
    setCanvasReady(false);
  }, []);

  // ── Text ────────────────────────────────────────────────────────────

  const addText = useCallback((preset: 'heading' | 'subheading' | 'body') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const presets = {
      heading: { text: 'Add a heading', fontSize: 48, fontWeight: '700', fontFamily: 'Inter' },
      subheading: { text: 'Add a subheading', fontSize: 32, fontWeight: '500', fontFamily: 'Inter' },
      body: { text: 'Add body text', fontSize: 18, fontWeight: '400', fontFamily: 'Inter' },
    };
    const cfg = presets[preset];
    const text = new fabric.Textbox(cfg.text, {
      left: canvasWidth / 2 - 200,
      top: canvasHeight / 2 - 30,
      width: 400,
      fontSize: cfg.fontSize,
      fontWeight: cfg.fontWeight as any,
      fontFamily: cfg.fontFamily,
      fill: '#ffffff',
      textAlign: 'center',
      editable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  }, [canvasWidth, canvasHeight]);

  // ── Shapes ──────────────────────────────────────────────────────────

  const addShape = useCallback((type: 'rect' | 'circle' | 'triangle' | 'line') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let obj: fabric.FabricObject;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const defaults = { fill: '#6366f1', stroke: '', strokeWidth: 0, opacity: 1 };

    switch (type) {
      case 'rect':
        obj = new fabric.Rect({ left: cx - 75, top: cy - 75, width: 150, height: 150, rx: 8, ry: 8, ...defaults });
        break;
      case 'circle':
        obj = new fabric.Circle({ left: cx - 60, top: cy - 60, radius: 60, ...defaults });
        break;
      case 'triangle':
        obj = new fabric.Triangle({ left: cx - 60, top: cy - 60, width: 120, height: 120, ...defaults });
        break;
      case 'line':
        obj = new fabric.Line([cx - 100, cy, cx + 100, cy], { stroke: '#6366f1', strokeWidth: 3, fill: '' });
        break;
      default:
        return;
    }
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  }, [canvasWidth, canvasHeight]);

  // ── Images ──────────────────────────────────────────────────────────

  const addImage = useCallback(async (url: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const scale = Math.min(
        (canvasWidth * 0.6) / (img.width || 1),
        (canvasHeight * 0.6) / (img.height || 1),
        1
      );
      img.set({
        left: canvasWidth / 2 - ((img.width || 0) * scale) / 2,
        top: canvasHeight / 2 - ((img.height || 0) * scale) / 2,
        scaleX: scale,
        scaleY: scale,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    } catch (e) {
      console.error('Failed to load image:', e);
    }
  }, [canvasWidth, canvasHeight]);

  // ── Background ──────────────────────────────────────────────────────

  const setBackground = useCallback((type: 'color' | 'gradient' | 'image', value: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (type === 'color' || type === 'gradient') {
      canvas.backgroundColor = value;
      canvas.requestRenderAll();
      saveHistory();
    } else if (type === 'image') {
      fabric.FabricImage.fromURL(value, { crossOrigin: 'anonymous' }).then((img) => {
        const scaleX = canvasWidth / (img.width || 1);
        const scaleY = canvasHeight / (img.height || 1);
        img.set({ left: 0, top: 0, scaleX, scaleY, selectable: false, evented: false });
        const objects = canvas.getObjects();
        const bgObj = objects.find((o) => (o as any)._isBgImage);
        if (bgObj) canvas.remove(bgObj);
        (img as any)._isBgImage = true;
        canvas.add(img);
        canvas.sendObjectToBack(img);
        canvas.requestRenderAll();
        saveHistory();
      });
    }
  }, [canvasWidth, canvasHeight, saveHistory]);

  // ── Object manipulation ─────────────────────────────────────────────

  const updateSelectedObject = useCallback((props: Record<string, unknown>) => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedObject) return;
    selectedObject.set(props as Partial<fabric.FabricObject>);
    canvas.requestRenderAll();
    saveHistory();
    setSelectedObject({ ...selectedObject } as fabric.FabricObject);
  }, [selectedObject, saveHistory]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (active.length === 0) return;
    active.forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }, []);

  // ── Undo / Redo ─────────────────────────────────────────────────────

  const restoreFromHistory = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hist = historyRef.current;
    if (index < 0 || index >= hist.entries.length) return;
    isRestoringRef.current = true;
    hist.index = index;
    const json = hist.entries[index];
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.requestRenderAll();
      isRestoringRef.current = false;
      updateUndoRedoState();
    });
  }, [updateUndoRedoState]);

  const undo = useCallback(() => {
    const hist = historyRef.current;
    if (hist.index > 0) restoreFromHistory(hist.index - 1);
  }, [restoreFromHistory]);

  const redo = useCallback(() => {
    const hist = historyRef.current;
    if (hist.index < hist.entries.length - 1) restoreFromHistory(hist.index + 1);
  }, [restoreFromHistory]);

  // ── Canvas size ─────────────────────────────────────────────────────

  const setCanvasSize = useCallback((width: number, height: number) => {
    setCanvasWidth(width);
    setCanvasHeight(height);
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = window.devicePixelRatio || 1;
      canvas.setDimensions({ width: width * dpr, height: height * dpr }, { cssOnly: false });
      canvas.setDimensions({ width, height }, { cssOnly: true });
      canvas.setViewportTransform([dpr, 0, 0, dpr, 0, 0]);
      canvas.requestRenderAll();
    }
  }, []);

  // ── Zoom ────────────────────────────────────────────────────────────

  const zoomToFit = useCallback(() => setZoom(fitScale), [fitScale]);
  const zoomIn = useCallback(() => setZoom((z) => Math.min(z * 1.2, 3)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z / 1.2, 0.05)), []);

  // ── Export ──────────────────────────────────────────────────────────

  const exportPNG = useCallback((filename?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    canvas.discardActiveObject();
    canvas.requestRenderAll();

    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2, quality: 1 });

    const link = document.createElement('a');
    link.download = filename || 'design.png';
    link.href = dataURL;
    link.click();

    if (activeObj) {
      canvas.setActiveObject(activeObj);
      canvas.requestRenderAll();
    }
  }, []);

  // ── Serialization ───────────────────────────────────────────────────

  const getCanvasJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '{}';
    return JSON.stringify(canvas.toJSON());
  }, []);

  const loadFromJSON = useCallback((json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    canvas.loadFromJSON(JSON.parse(json)).then(() => {
      canvas.requestRenderAll();
      isRestoringRef.current = false;
      historyRef.current = { entries: [JSON.stringify(canvas.toJSON())], index: 0 };
      updateUndoRedoState();
    });
  }, [updateUndoRedoState]);

  const loadFromObject = useCallback((obj: Record<string, any>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isRestoringRef.current = true;
    canvas.loadFromJSON(obj).then(() => {
      canvas.requestRenderAll();
      isRestoringRef.current = false;
      historyRef.current = { entries: [JSON.stringify(canvas.toJSON())], index: 0 };
      updateUndoRedoState();
    });
  }, [updateUndoRedoState]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (meta && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTextEditing()) {
        e.preventDefault();
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, deleteSelected]);

  function isTextEditing(): boolean {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const obj = canvas.getActiveObject();
    return obj instanceof fabric.Textbox && obj.isEditing === true;
  }

  return {
    // Canvas ref management
    initCanvas,
    disposeCanvas,
    canvas: canvasRef,
    canvasElRef,
    canvasReady,
    selectedObject,
    canvasWidth,
    canvasHeight,
    zoom,
    setZoomRaw: setZoom,
    fitScale,
    setFitScale,

    // Actions
    addText,
    addShape,
    addImage,
    setBackground,
    updateSelectedObject,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    setCanvasSize,
    zoomToFit,
    zoomIn,
    zoomOut,
    exportPNG,
    getCanvasJSON,
    loadFromJSON,
    loadFromObject,
  };
}
