'use client';

import { useState, useCallback } from 'react';

export interface Design {
  id: string;
  name: string;
  canvas_json: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [activeDesign, setActiveDesign] = useState<Design | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDesigns = useCallback(async () => {
    try {
      const res = await fetch('/api/designs');
      const data = await res.json();
      setDesigns(data);
    } catch (err) {
      console.error('Failed to fetch designs:', err);
    }
  }, []);

  const loadDesign = useCallback(async (id: string): Promise<Design | null> => {
    try {
      const res = await fetch(`/api/designs/${id}`);
      if (!res.ok) return null;
      const design = await res.json();
      setActiveDesign(design);
      return design;
    } catch (err) {
      console.error('Failed to load design:', err);
      return null;
    }
  }, []);

  const createDesign = useCallback(async (
    name: string,
    canvas_json: string,
    width: number,
    height: number
  ): Promise<Design | null> => {
    try {
      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, canvas_json, width, height }),
      });
      const design = await res.json();
      setActiveDesign(design);
      setDesigns(prev => [design, ...prev]);
      return design;
    } catch (err) {
      console.error('Failed to create design:', err);
      return null;
    }
  }, []);

  const saveDesign = useCallback(async (
    id: string,
    name?: string,
    canvas_json?: string
  ): Promise<void> => {
    setSaving(true);
    try {
      const body: Record<string, any> = {};
      if (name) body.name = name;
      if (canvas_json) body.canvas_json = canvas_json;

      const res = await fetch(`/api/designs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setActiveDesign(updated);
      setDesigns(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    } catch (err) {
      console.error('Failed to save design:', err);
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteDesign = useCallback(async (id: string): Promise<void> => {
    try {
      await fetch(`/api/designs/${id}`, { method: 'DELETE' });
      setDesigns(prev => prev.filter(d => d.id !== id));
      if (activeDesign?.id === id) setActiveDesign(null);
    } catch (err) {
      console.error('Failed to delete design:', err);
    }
  }, [activeDesign]);

  return {
    designs,
    activeDesign,
    setActiveDesign,
    saving,
    fetchDesigns,
    loadDesign,
    createDesign,
    saveDesign,
    deleteDesign,
  };
}
