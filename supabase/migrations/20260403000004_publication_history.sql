-- Phase 5: Publication History & Manual Republication System

-- 1. Update PUBLICATION_STATUS Enum
-- Note: ALTER TYPE ... ADD VALUE cannot be executed inside a transaction block.
-- If running this in a single script, ensure it's idempotent.
DO $$ BEGIN
    ALTER TYPE public.publication_status ADD VALUE 'published' AFTER 'ready';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add columns to PUBLICATIONS
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS curator_commentary TEXT,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 3. Correct the published_at logic
-- We want to track when it was officially published by the curator
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS curator_published_at TIMESTAMPTZ;

-- 4. Index for History Retrieval
CREATE INDEX IF NOT EXISTS idx_publications_history 
ON public.publications (hub_id, status, created_at DESC);

-- 5. Update RLS (Ensure new columns are manageable)
-- Our existing FOR ALL policy on publications in 20260403000001_hub_rbac.sql
-- already covers these columns for Owners and Editors.
