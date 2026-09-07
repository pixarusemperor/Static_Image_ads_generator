'use client';

import React, { useState, useEffect } from 'react';
import { EditorContext } from './context';
import { useCanvasState } from './hooks/use-canvas';
import { useDesigns } from './hooks/use-designs';
import { Editor } from './components/editor';
import { Home } from './components/home';

interface OpenDesignStudioProps {
  onImportToSuperAds?: (templateId: string) => void;
  initialDesignId?: string | null;
}

export function OpenDesignStudio({ onImportToSuperAds, initialDesignId }: OpenDesignStudioProps) {
  const [currentPath, setCurrentPath] = useState(
    initialDesignId ? `/design/${initialDesignId}` : '/'
  );

  const canvasState = useCanvasState();
  const designState = useDesigns(canvasState.getCanvasJSONForPage);

  const designId = currentPath.startsWith('/design/') ? currentPath.replace('/design/', '') : null;

  const navigate = (to: string) => {
    setCurrentPath(to);
  };

  // Load design from state when designId changes
  useEffect(() => {
    if (designId && !designState.loading) {
      if (designState.activeDesign?.id !== designId) {
        designState.loadDesign(designId);
      }
    }
  }, [designId, designState.loading]);

  // Sync canvas size to the loaded design's dimensions
  useEffect(() => {
    if (designState.activeDesign) {
      const { width, height } = designState.activeDesign;
      if (
        width &&
        height &&
        (width !== canvasState.canvasWidth || height !== canvasState.canvasHeight)
      ) {
        canvasState.setCanvasSize(width, height);
      }
    }
  }, [designState.activeDesign]);

  // Auto-activate first page when pages load
  useEffect(() => {
    if (designState.pages.length > 0 && !canvasState.activeCanvasId) {
      canvasState.setActiveCanvas(designState.pages[0].id);
    }
  }, [designState.pages, canvasState.activeCanvasId]);

  if (designState.loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#F3F4F7]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3 mx-auto" />
          <p className="text-zinc-500 text-xs font-medium">Loading OpenDesign Studio...</p>
        </div>
      </div>
    );
  }

  // Home / Gallery view
  if (!designId) {
    return (
      <div className="h-full w-full overflow-hidden flex flex-col">
        <Home
          designs={designState.designs}
          templates={designState.templates}
          navigate={navigate}
          createDesign={designState.createDesign}
          deleteDesign={designState.deleteDesign}
          renameDesign={designState.renameDesign}
          createFromTemplate={designState.createFromTemplate}
        />
      </div>
    );
  }

  // Editor view
  const contextValue = {
    ...canvasState,
    ...designState,
    activePageId: canvasState.activeCanvasId ?? designState.activePageId,
    navigate,
    onImportToSuperAds,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      <div className="h-full w-full overflow-hidden flex flex-col">
        <Editor />
      </div>
    </EditorContext.Provider>
  );
}
