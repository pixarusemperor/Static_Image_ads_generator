import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

export interface StudioDesign {
  id: string;
  name: string;
  canvas_json: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudioPage {
  id: string;
  design_id: string;
  title: string;
  canvas_json: string;
  sort_order: number;
  created_at: string;
}

export interface StudioDesignWithPages extends StudioDesign {
  pages: StudioPage[];
}

export interface StudioTemplate {
  id: string;
  name: string;
  category: string;
  canvas_json: string;
  width: number;
  height: number;
  thumbnail_url: string | null;
  sort_order: number;
}

// ==============================================================================
// Pre-seeded Default OpenDesign Templates
// ==============================================================================
export const SEED_TEMPLATES: StudioTemplate[] = [
  {
    id: 'quote-card',
    name: 'Quote Card',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1080,"height":1080,"fill":"#1a1a2e"},{"type":"textbox","left":80,"top":300,"width":920,"text":"Your inspiring quote goes here","fontSize":48,"fontFamily":"Playfair Display","fontWeight":"700","fill":"#ffffff","textAlign":"center"},{"type":"textbox","left":80,"top":900,"width":920,"text":"— Author Name","fontSize":24,"fontFamily":"Inter","fontWeight":"500","fill":"#a0a0b0","textAlign":"center"}]}',
    width: 1080,
    height: 1080,
    thumbnail_url: null,
    sort_order: 1,
  },
  {
    id: 'stats-highlight',
    name: 'Stats Highlight',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1080,"height":1080,"fill":"#0f172a"},{"type":"textbox","left":80,"top":200,"width":920,"text":"87%","fontSize":120,"fontFamily":"Montserrat","fontWeight":"900","fill":"#3b82f6","textAlign":"center"},{"type":"textbox","left":80,"top":400,"width":920,"text":"of professionals agree that AI\\nwill transform their industry","fontSize":36,"fontFamily":"Inter","fontWeight":"500","fill":"#e2e8f0","textAlign":"center"},{"type":"textbox","left":80,"top":900,"width":920,"text":"Source: Industry Report 2026","fontSize":18,"fontFamily":"Inter","fontWeight":"400","fill":"#64748b","textAlign":"center"}]}',
    width: 1080,
    height: 1080,
    thumbnail_url: null,
    sort_order: 2,
  },
  {
    id: 'announcement',
    name: 'Announcement',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1200,"height":627,"fill":"#ffffff"},{"type":"rect","left":0,"top":0,"width":8,"height":627,"fill":"#2563eb"},{"type":"textbox","left":60,"top":80,"width":400,"text":"NEW","fontSize":16,"fontFamily":"Montserrat","fontWeight":"800","fill":"#2563eb","letterSpacing":4},{"type":"textbox","left":60,"top":120,"width":1080,"text":"We are excited to announce\\nsomething big","fontSize":48,"fontFamily":"Montserrat","fontWeight":"700","fill":"#0f172a"},{"type":"textbox","left":60,"top":500,"width":1080,"text":"Learn more at yourcompany.com","fontSize":20,"fontFamily":"Inter","fontWeight":"500","fill":"#64748b"}]}',
    width: 1200,
    height: 627,
    thumbnail_url: null,
    sort_order: 3,
  },
  {
    id: 'tips-list',
    name: 'Tips List',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1080,"height":1080,"fill":"#fafaf9"},{"type":"textbox","left":80,"top":80,"width":920,"text":"5 Tips for Better\\nProductivity","fontSize":44,"fontFamily":"Montserrat","fontWeight":"800","fill":"#1c1917"},{"type":"textbox","left":80,"top":280,"width":920,"text":"1. Start with the hardest task\\n\\n2. Time-block your calendar\\n\\n3. Limit notifications\\n\\n4. Take regular breaks\\n\\n5. Review and reflect daily","fontSize":28,"fontFamily":"Inter","fontWeight":"400","fill":"#44403c","lineHeight":1.6}]}',
    width: 1080,
    height: 1080,
    thumbnail_url: null,
    sort_order: 4,
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1080,"height":1080,"fill":"#18181b"},{"type":"circle","left":440,"top":180,"radius":100,"fill":"#3f3f46"},{"type":"textbox","left":80,"top":420,"width":920,"text":"Jane Smith","fontSize":40,"fontFamily":"Montserrat","fontWeight":"700","fill":"#fafafa","textAlign":"center"},{"type":"textbox","left":80,"top":490,"width":920,"text":"Product Designer @ TechCo","fontSize":22,"fontFamily":"Inter","fontWeight":"400","fill":"#a1a1aa","textAlign":"center"},{"type":"textbox","left":140,"top":600,"width":800,"text":"Passionate about creating intuitive user experiences that make complex tools feel simple.","fontSize":20,"fontFamily":"Inter","fontWeight":"400","fill":"#d4d4d8","textAlign":"center"}]}',
    width: 1080,
    height: 1080,
    thumbnail_url: null,
    sort_order: 5,
  },
  {
    id: 'minimal-text',
    name: 'Minimal Text',
    category: 'linkedin',
    canvas_json: '{"version":"6.0.0","objects":[{"type":"rect","left":0,"top":0,"width":1080,"height":1080,"fill":"#f8fafc"},{"type":"textbox","left":120,"top":380,"width":840,"text":"Less is more.","fontSize":64,"fontFamily":"Playfair Display","fontWeight":"600","fill":"#0f172a","textAlign":"center"},{"type":"textbox","left":120,"top":520,"width":840,"text":"Sometimes the simplest message\\nhas the biggest impact.","fontSize":22,"fontFamily":"Inter","fontWeight":"400","fill":"#64748b","textAlign":"center"}]}',
    width: 1080,
    height: 1080,
    thumbnail_url: null,
    sort_order: 6,
  },
];

// ==============================================================================
// In-Memory Fallback Cache
// ==============================================================================
const inMemoryDesigns = new Map<string, StudioDesign>();
const inMemoryPages = new Map<string, StudioPage[]>();
const inMemoryTemplates = new Map<string, StudioTemplate>();

// Initialize in-memory templates
SEED_TEMPLATES.forEach((t) => inMemoryTemplates.set(t.id, t));

function generateId(prefix: string): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // fallback
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ==============================================================================
// Designs Operations
// ==============================================================================
export async function listStudioDesigns(): Promise<StudioDesign[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('studio_designs')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!error && data) {
        return data as StudioDesign[];
      }
    } catch {
      // fallback to memory
    }
  }

  return Array.from(inMemoryDesigns.values()).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at)
  );
}

export async function getStudioDesign(id: string): Promise<StudioDesignWithPages | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: design, error } = await supabase
        .from('studio_designs')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && design) {
        const { data: pages } = await supabase
          .from('studio_pages')
          .select('*')
          .eq('design_id', id)
          .order('sort_order', { ascending: true });
        return {
          ...(design as StudioDesign),
          pages: (pages || []) as StudioPage[],
        };
      }
    } catch {
      // fallback
    }
  }

  const design = inMemoryDesigns.get(id);
  if (!design) return null;
  const pages = inMemoryPages.get(id) || [];
  return {
    ...design,
    pages: [...pages].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function createStudioDesign(params: {
  name?: string;
  canvas_json?: string;
  width?: number;
  height?: number;
}): Promise<StudioDesign> {
  const id = generateId('dsg');
  const now = new Date().toISOString();
  const canvasJson = params.canvas_json || '{}';

  const design: StudioDesign = {
    id,
    name: params.name || 'Untitled Design',
    canvas_json: canvasJson,
    width: params.width || 1080,
    height: params.height || 1080,
    thumbnail_url: null,
    created_at: now,
    updated_at: now,
  };

  const pageId = generateId('pg');
  const firstPage: StudioPage = {
    id: pageId,
    design_id: id,
    title: 'Page 1',
    canvas_json: canvasJson,
    sort_order: 0,
    created_at: now,
  };

  inMemoryDesigns.set(id, design);
  inMemoryPages.set(id, [firstPage]);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('studio_designs').insert(design);
      await supabase.from('studio_pages').insert(firstPage);
    } catch {
      // fallback kept in memory
    }
  }

  return design;
}

export async function updateStudioDesign(
  id: string,
  updates: Partial<Pick<StudioDesign, 'name' | 'canvas_json' | 'width' | 'height' | 'thumbnail_url'>>
): Promise<StudioDesign | null> {
  const existing = inMemoryDesigns.get(id);
  const now = new Date().toISOString();

  const updated: StudioDesign = {
    ...(existing || {
      id,
      name: 'Untitled Design',
      canvas_json: '{}',
      width: 1080,
      height: 1080,
      thumbnail_url: null,
      created_at: now,
      updated_at: now,
    }),
    ...updates,
    updated_at: now,
  };

  inMemoryDesigns.set(id, updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('studio_designs').update(updated).eq('id', id);
    } catch {
      // fallback
    }
  }

  return updated;
}

export async function deleteStudioDesign(id: string): Promise<boolean> {
  inMemoryDesigns.delete(id);
  inMemoryPages.delete(id);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('studio_designs').delete().eq('id', id);
      await supabase.from('studio_pages').delete().eq('design_id', id);
    } catch {
      // fallback
    }
  }
  return true;
}

// ==============================================================================
// Pages Operations
// ==============================================================================
export async function addStudioPage(
  designId: string,
  params: { title?: string; canvas_json?: string; after_sort_order?: number }
): Promise<StudioPage> {
  const pages = inMemoryPages.get(designId) || [];
  const pageId = generateId('pg');
  const now = new Date().toISOString();
  const title = params.title || `Page ${pages.length + 1}`;
  const canvasJson = params.canvas_json || '{}';

  let insertOrder = pages.length;
  if (params.after_sort_order !== undefined) {
    insertOrder = params.after_sort_order + 1;
    pages.forEach((p) => {
      if (p.sort_order >= insertOrder) {
        p.sort_order += 1;
      }
    });
  }

  const newPage: StudioPage = {
    id: pageId,
    design_id: designId,
    title,
    canvas_json: canvasJson,
    sort_order: insertOrder,
    created_at: now,
  };

  pages.push(newPage);
  inMemoryPages.set(designId, pages);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('studio_pages').insert(newPage);
    } catch {
      // fallback
    }
  }

  return newPage;
}

export async function updateStudioPage(
  pageId: string,
  updates: { title?: string; canvas_json?: string }
): Promise<StudioPage | null> {
  for (const [designId, pages] of inMemoryPages.entries()) {
    const page = pages.find((p) => p.id === pageId);
    if (page) {
      if (updates.title !== undefined) page.title = updates.title;
      if (updates.canvas_json !== undefined) page.canvas_json = updates.canvas_json;

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('studio_pages').update(updates).eq('id', pageId);
        } catch {
          // fallback
        }
      }
      return page;
    }
  }
  return null;
}

export async function duplicateStudioPage(pageId: string): Promise<StudioPage | null> {
  for (const [designId, pages] of inMemoryPages.entries()) {
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx !== -1) {
      const orig = pages[idx];
      return addStudioPage(designId, {
        title: `${orig.title} (copy)`,
        canvas_json: orig.canvas_json,
        after_sort_order: orig.sort_order,
      });
    }
  }
  return null;
}

export async function deleteStudioPage(pageId: string): Promise<boolean> {
  for (const [designId, pages] of inMemoryPages.entries()) {
    const idx = pages.findIndex((p) => p.id === pageId);
    if (idx !== -1) {
      if (pages.length <= 1) {
        throw new Error('Cannot delete the last page');
      }
      pages.splice(idx, 1);
      inMemoryPages.set(designId, pages);

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('studio_pages').delete().eq('id', pageId);
        } catch {
          // fallback
        }
      }
      return true;
    }
  }
  return false;
}

// ==============================================================================
// Templates Operations
// ==============================================================================
export async function listStudioTemplates(): Promise<StudioTemplate[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('studio_templates')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as StudioTemplate[];
      }
    } catch {
      // fallback
    }
  }
  return Array.from(inMemoryTemplates.values()).sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveStudioTemplate(template: StudioTemplate): Promise<StudioTemplate> {
  inMemoryTemplates.set(template.id, template);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('studio_templates').upsert(template);
    } catch {
      // fallback
    }
  }
  return template;
}
