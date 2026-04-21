CREATE TABLE IF NOT EXISTS source_filter_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES monitored_sources(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('blocklist', 'allowlist')),
  match_mode TEXT NOT NULL DEFAULT 'keywords' CHECK (match_mode IN ('keywords', 'description')),
  value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_source_filter_rules_source_id ON source_filter_rules(source_id);

ALTER TABLE publications ADD COLUMN IF NOT EXISTS purge_reason TEXT;

ALTER TYPE publication_status ADD VALUE IF NOT EXISTS 'auto_purge_tagged';
