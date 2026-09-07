'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Design, Template, Page } from '../types';

async function apiFetch<T>(method: string, url: string, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  };
  const res = await fetch(url, options);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function useDesigns(getCanvasJSONForPage: (pageId: string) => string) {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeDesign, setActiveDesign] = useState<Design | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const activePageIdRef = useRef<string | null>(null);

  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  // Load designs + templates on mount
  useEffect(() => {
    (async () => {
      try {
        const [d, t] = await Promise.all([
          apiFetch<Design[]>('GET', '/api/studio/designs'),
          apiFetch<Template[]>('GET', '/api/studio/templates'),
        ]);
        setDesigns(d);
        setTemplates(t);
      } catch (e) {
        console.error('Failed to load studio data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveDesign = useCallback(async () => {
    if (!activeIdRef.current) return;
    setSaving(true);
    try {
      const currentPages = pages;
      for (const page of currentPages) {
        const json = getCanvasJSONForPage(page.id);
        if (json && json !== '{}') {
          const updatedPage = await apiFetch<Page>('PUT', `/api/studio/pages/${page.id}`, {
            canvas_json: json,
          });
          setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
        }
      }
      const firstPageJson = currentPages.length > 0 ? getCanvasJSONForPage(currentPages[0].id) : '{}';
      const updated = await apiFetch<Design>('PUT', `/api/studio/designs/${activeIdRef.current}`, {
        canvas_json: firstPageJson,
      });
      setDesigns((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setActiveDesign(updated);
    } catch (e) {
      console.error('Failed to save design:', e);
    } finally {
      setSaving(false);
    }
  }, [getCanvasJSONForPage, pages]);

  const createDesign = useCallback(async (): Promise<string | undefined> => {
    try {
      const d = await apiFetch<Design>('POST', '/api/studio/designs', {
        name: 'Untitled Design',
        canvas_json: '{}',
      });
      setDesigns((prev) => [d, ...prev]);
      setActiveDesign(d);
      activeIdRef.current = d.id;
      return d.id;
    } catch (e) {
      console.error('Failed to create design:', e);
    }
  }, []);

  const createFromTemplate = useCallback(async (template: Template): Promise<string | undefined> => {
    try {
      const d = await apiFetch<Design>('POST', '/api/studio/designs', {
        name: template.name,
        canvas_json: template.canvas_json,
        width: template.width,
        height: template.height,
      });
      setDesigns((prev) => [d, ...prev]);
      return d.id;
    } catch (e) {
      console.error('Failed to create from template:', e);
    }
  }, []);

  const loadDesign = useCallback(
    async (id: string) => {
      try {
        const data = await apiFetch<Design & { pages?: Page[] }>('GET', `/api/studio/designs/${id}`);
        setActiveDesign(data);
        activeIdRef.current = id;
        const pList = data.pages && data.pages.length > 0 ? data.pages : [];
        setPages(pList);
        if (pList.length > 0) {
          setActivePageId(pList[0].id);
        }
      } catch (e) {
        console.error('Failed to load design:', e);
      }
    },
    []
  );

  const deleteDesign = useCallback(
    async (id: string) => {
      try {
        await apiFetch('DELETE', `/api/studio/designs/${id}`);
        setDesigns((prev) => prev.filter((d) => d.id !== id));
        if (activeDesign?.id === id) {
          setActiveDesign(null);
          activeIdRef.current = null;
          setPages([]);
          setActivePageId(null);
        }
      } catch (e) {
        console.error('Failed to delete design:', e);
      }
    },
    [activeDesign]
  );

  const renameDesign = useCallback(
    async (id: string, name: string) => {
      try {
        const updated = await apiFetch<Design>('PUT', `/api/studio/designs/${id}`, { name });
        setDesigns((prev) => prev.map((d) => (d.id === id ? updated : d)));
        if (activeDesign?.id === id) setActiveDesign(updated);
      } catch (e) {
        console.error('Failed to rename design:', e);
      }
    },
    [activeDesign]
  );

  const addPage = useCallback(
    async (afterId?: string) => {
      if (!activeIdRef.current) return;
      try {
        let afterSortOrder: number | undefined;
        if (afterId) {
          const refPage = pages.find((p) => p.id === afterId);
          if (refPage) afterSortOrder = refPage.sort_order;
        }
        const page = await apiFetch<Page>('POST', `/api/studio/designs/${activeIdRef.current}/pages`, {
          after_sort_order: afterSortOrder,
        });
        setPages((prev) => {
          const next = [...prev];
          if (afterSortOrder !== undefined) {
            next.forEach((p) => {
              if (p.sort_order > afterSortOrder!) p.sort_order += 1;
            });
          }
          next.push(page);
          return next.sort((a, b) => a.sort_order - b.sort_order);
        });
        setActivePageId(page.id);
      } catch (e) {
        console.error('Failed to add page:', e);
      }
    },
    [pages]
  );

  const duplicatePage = useCallback(
    async (pageId: string) => {
      try {
        const page = await apiFetch<Page>('POST', `/api/studio/pages/${pageId}/duplicate`);
        setPages((prev) => {
          const next = [...prev];
          const orig = prev.find((p) => p.id === pageId);
          if (orig) {
            next.forEach((p) => {
              if (p.sort_order > orig.sort_order) p.sort_order += 1;
            });
          }
          next.push(page);
          return next.sort((a, b) => a.sort_order - b.sort_order);
        });
        setActivePageId(page.id);
      } catch (e) {
        console.error('Failed to duplicate page:', e);
      }
    },
    []
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      if (pages.length <= 1) return;
      try {
        await apiFetch('DELETE', `/api/studio/pages/${pageId}`);
        const remaining = pages.filter((p) => p.id !== pageId);
        setPages(remaining);
        if (activePageIdRef.current === pageId && remaining.length > 0) {
          setActivePageId(remaining[0].id);
        }
      } catch (e) {
        console.error('Failed to delete page:', e);
      }
    },
    [pages]
  );

  const renamePage = useCallback(
    async (pageId: string, title: string) => {
      try {
        const updated = await apiFetch<Page>('PUT', `/api/studio/pages/${pageId}`, { title });
        setPages((prev) => prev.map((p) => (p.id === pageId ? updated : p)));
      } catch (e) {
        console.error('Failed to rename page:', e);
      }
    },
    []
  );

  const switchToPage = useCallback((pageId: string) => {
    setActivePageId(pageId);
  }, []);

  const activePage = pages.find((p) => p.id === activePageId) ?? null;

  return {
    designs,
    templates,
    activeDesign,
    pages,
    activePageId,
    activePage,
    loading,
    saving,
    createDesign,
    createFromTemplate,
    loadDesign,
    saveDesign,
    deleteDesign,
    renameDesign,
    addPage,
    duplicatePage,
    deletePage,
    renamePage,
    switchToPage,
  };
}
