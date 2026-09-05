import crypto from 'crypto';
import { getSupabaseClient } from '@/lib/supabase';

export interface CampaignRecord {
  id?: string;
  name: string;
  product_dna?: Record<string, unknown>;
  avatar_dna?: Record<string, unknown>;
  channel?: string;
  created_at?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CreativeRecord {
  id?: string;
  campaign_id: string;
  template_id: string;
  image_r2_url?: string | null;
  feed_copy?: Record<string, unknown>;
  in_image_variables?: Record<string, unknown>;
  post_click_bridge?: Record<string, unknown>;
  compliance_audit?: Record<string, unknown>;
  status?: 'draft' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ==============================================================================
// In-Memory Fallback Cache (Zero-Configuration Local Dev & Offline Resilience)
// ==============================================================================
const inMemoryCampaigns = new Map<string, CampaignRecord>();
const inMemoryCreatives = new Map<string, CreativeRecord>();

function generateId(prefix: string): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // Fallback if crypto is unavailable
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Persists a campaign record to Supabase PostgreSQL with in-memory caching.
 */
export async function saveCampaignRecord(campaign: CampaignRecord): Promise<string> {
  const id = campaign.id || generateId('cmp');
  const now = new Date().toISOString();

  const record: CampaignRecord = {
    id,
    name: campaign.name,
    product_dna: (campaign.product_dna || campaign.productDna || {}) as Record<string, unknown>,
    avatar_dna: (campaign.avatar_dna || campaign.avatarDna || {}) as Record<string, unknown>,
    channel: campaign.channel || 'meta',
    status: campaign.status || 'active',
    created_at: campaign.created_at || now,
  };

  // Always update in-memory cache
  inMemoryCampaigns.set(id, record);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('campaigns').upsert(record);
      if (error) {
        console.warn(`[database] Failed to persist campaign ${id} to Supabase:`, error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[database] Supabase upsert error for campaign ${id}:`, msg);
    }
  }

  return id;
}

/**
 * Persists an ad creative record to Supabase PostgreSQL with in-memory caching.
 * Supports linking Cloudflare R2 image assets, feed copy, and compliance audits.
 */
export async function saveCreativeRecord(creative: CreativeRecord): Promise<string> {
  const id = creative.id || generateId('crt');
  const now = new Date().toISOString();

  const record: CreativeRecord = {
    id,
    campaign_id: (creative.campaign_id || creative.campaignId || '') as string,
    template_id: (creative.template_id || creative.templateId || '') as string,
    image_r2_url: (creative.image_r2_url ?? creative.imageR2Url ?? null) as string | null,
    feed_copy: (creative.feed_copy || creative.feedCopy || {}) as Record<string, unknown>,
    in_image_variables: (creative.in_image_variables || creative.inImageVariables || {}) as Record<string, unknown>,
    post_click_bridge: (creative.post_click_bridge || creative.postClickBridge || {}) as Record<string, unknown>,
    compliance_audit: (creative.compliance_audit || creative.complianceAudit || {}) as Record<string, unknown>,
    status: creative.status || 'draft',
    created_at: creative.created_at || now,
    updated_at: now,
  };

  // Always update in-memory cache
  inMemoryCreatives.set(id, record);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('ad_creatives').upsert(record);
      if (error) {
        console.warn(`[database] Failed to persist creative ${id} to Supabase:`, error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[database] Supabase upsert error for creative ${id}:`, msg);
    }
  }

  return id;
}

/**
 * Lists all creative records for a given campaign, ordered by created_at DESC.
 * Queries Supabase first, seamlessly falling back to in-memory storage if unavailable.
 */
export async function listCampaignCreatives(campaignId: string): Promise<CreativeRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ad_creatives')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Sync into in-memory cache
        for (const row of data) {
          inMemoryCreatives.set(row.id, row as CreativeRecord);
        }
        return data as CreativeRecord[];
      }
      if (error) {
        console.warn(`[database] Supabase query failed for campaign ${campaignId}:`, error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[database] Supabase query error for campaign ${campaignId}:`, msg);
    }
  }

  // In-memory fallback
  return Array.from(inMemoryCreatives.values())
    .filter((c) => c.campaign_id === campaignId)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

/**
 * Updates the approval status of a creative record.
 */
export async function updateCreativeStatus(
  creativeId: string,
  status: 'draft' | 'approved' | 'rejected'
): Promise<boolean> {
  let updated = false;
  const now = new Date().toISOString();

  // Update in-memory
  const existing = inMemoryCreatives.get(creativeId);
  if (existing) {
    existing.status = status;
    existing.updated_at = now;
    inMemoryCreatives.set(creativeId, existing);
    updated = true;
  }

  // Update Supabase if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('ad_creatives')
        .update({ status, updated_at: now })
        .eq('id', creativeId);

      if (error) {
        console.warn(`[database] Failed to update creative ${creativeId} status in Supabase:`, error.message);
      } else {
        updated = true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[database] Supabase update status error for ${creativeId}:`, msg);
    }
  }

  return updated;
}

/**
 * Retrieves a single creative record by ID.
 */
export async function getCreativeRecord(creativeId: string): Promise<CreativeRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ad_creatives')
        .select('*')
        .eq('id', creativeId)
        .single();

      if (!error && data) {
        inMemoryCreatives.set(data.id, data as CreativeRecord);
        return data as CreativeRecord;
      }
    } catch {
      // ignore and use in-memory fallback
    }
  }

  return inMemoryCreatives.get(creativeId) || null;
}

/**
 * Retrieves a single campaign record by ID.
 */
export async function getCampaignRecord(campaignId: string): Promise<CampaignRecord | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (!error && data) {
        inMemoryCampaigns.set(data.id, data as CampaignRecord);
        return data as CampaignRecord;
      }
    } catch {
      // ignore and use in-memory fallback
    }
  }

  return inMemoryCampaigns.get(campaignId) || null;
}

/**
 * Resets the in-memory cache (primarily used for unit testing).
 */
export function _clearInMemoryCacheForTesting(): void {
  inMemoryCampaigns.clear();
  inMemoryCreatives.clear();
}
