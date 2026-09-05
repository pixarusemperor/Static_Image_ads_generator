-- ==============================================================================
-- SuperAds Database Schema (Supabase / PostgreSQL)
-- Multi-tier Direct-Response Ad Creatives & Campaigns Persistence
-- ==============================================================================

-- 1. Enable required extensions for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Campaigns Table
-- Persists strategic campaign definitions, product DNA, avatar targeting, and channel specs.
CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    product_dna JSONB NOT NULL DEFAULT '{}'::jsonb,
    avatar_dna JSONB NOT NULL DEFAULT '{}'::jsonb,
    channel TEXT NOT NULL DEFAULT 'meta',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Ad Creatives Table
-- Persists generated creative iterations, Cloudflare R2 links, copy, in-image variables,
-- post-click bridges, and compliance audit reports.
CREATE TABLE IF NOT EXISTS ad_creatives (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    campaign_id TEXT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    image_r2_url TEXT,
    feed_copy JSONB NOT NULL DEFAULT '{}'::jsonb,
    in_image_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    post_click_bridge JSONB NOT NULL DEFAULT '{}'::jsonb,
    compliance_audit JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Indexes for high-throughput queries and campaign aggregation
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_campaign_id ON ad_creatives(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_created_at ON ad_creatives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_status ON ad_creatives(status);

-- 5. Auto-update trigger for updated_at column on ad_creatives
CREATE OR REPLACE FUNCTION update_ad_creatives_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_ad_creatives_updated_at ON ad_creatives;
CREATE TRIGGER trg_update_ad_creatives_updated_at
    BEFORE UPDATE ON ad_creatives
    FOR EACH ROW
    EXECUTE FUNCTION update_ad_creatives_updated_at();

-- 6. Row Level Security (RLS) configuration
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for service role and anon clients (can be tightened with user auth)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Allow public access to campaigns'
    ) THEN
        CREATE POLICY "Allow public access to campaigns" ON campaigns FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'ad_creatives' AND policyname = 'Allow public access to ad_creatives'
    ) THEN
        CREATE POLICY "Allow public access to ad_creatives" ON ad_creatives FOR ALL USING (true) WITH CHECK (true);
    END IF;
END;
$$;
