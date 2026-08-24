'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

interface FabricCanvasProps {
  width: number;
  height: number;
  zoom: number;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onCanvasDispose?: () => void;
  canvasRef: React.MutableRefObject<fabric.Canvas | null>;
}

export const FabricCanvas: React.FC<FabricCanvasProps> = ({
  width,
  height,
  zoom,
  onCanvasReady,
  onCanvasDispose,
  canvasRef,
}) => {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasElRef.current || fabricRef.current) return;

    const c = new fabric.Canvas(canvasElRef.current, {
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

    // Custom control appearance
    const CONTROL_STYLE = {
      transparentCorners: false,
      borderColor: '#6366f1',
      borderScaleFactor: 1.5,
      padding: 6,
      cornerSize: 14,
      cornerColor: '#ffffff',
      cornerStrokeColor: '#6366f1',
      cornerStyle: 'circle' as const,
    };

    const renderCircleCorner = (
      ctx: CanvasRenderingContext2D,
      left: number,
      top: number,
    ) => {
      const size = 14;
      ctx.save();
      ctx.translate(left, top);
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const renderPillControl = (horizontal: boolean) => {
      return (
        ctx: CanvasRenderingContext2D,
        left: number,
        top: number,
      ) => {
        const w = horizontal ? 28 : 8;
        const h = horizontal ? 8 : 28;
        ctx.save();
        ctx.translate(left, top);
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, 4);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      };
    };

    const applyCustomControls = (obj: fabric.FabricObject) => {
      obj.set(CONTROL_STYLE);
      if (obj.controls) {
        for (const key of ['tl', 'tr', 'bl', 'br']) {
          if (obj.controls[key]) {
            obj.controls[key].render = renderCircleCorner;
            obj.controls[key].sizeX = 18;
            obj.controls[key].sizeY = 18;
          }
        }
        for (const key of ['mt', 'mb']) {
          if (obj.controls[key]) {
            obj.controls[key].render = renderPillControl(true);
            obj.controls[key].sizeX = 32;
            obj.controls[key].sizeY = 12;
          }
        }
        for (const key of ['ml', 'mr']) {
          if (obj.controls[key]) {
            obj.controls[key].render = renderPillControl(false);
            obj.controls[key].sizeX = 12;
            obj.controls[key].sizeY = 32;
          }
        }
      }
    };

    // Apply to all existing objects
    c.getObjects().forEach(applyCustomControls);
    c.on('object:added', (e) => {
      if (e.target) applyCustomControls(e.target);
    });

    fabricRef.current = c;
    canvasRef.current = c;
    onCanvasReady?.(c);

    return () => {
      onCanvasDispose?.();
      c.dispose();
      fabricRef.current = null;
      canvasRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle resize
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.setDimensions({ width: width * dpr, height: height * dpr }, { cssOnly: false });
    canvas.setDimensions({ width, height }, { cssOnly: true });
    canvas.setViewportTransform([dpr, 0, 0, dpr, 0, 0]);
    canvas.requestRenderAll();
  }, [width, height]);

  return (
    <div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={{
        width: width * zoom,
        height: height * zoom,
      }}
    >
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width,
          height,
        }}
      >
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
};
