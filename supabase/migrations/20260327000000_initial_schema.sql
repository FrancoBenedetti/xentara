-- Phase 1: Initial Schema for Xentara

-- Enable Row-Level Security
-- (Note: These tables are for the core multi-tenant structure)

-- 1. HUBS TABLE
CREATE TABLE IF NOT EXISTS hubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- Used for subdomain/tenant identification
    owner_id UUID REFERENCES auth.users(id),
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS on hubs
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;

-- 2. BOARDS TABLE
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    archetype TEXT DEFAULT 'news', -- 'news', 'market', 'calendar', etc.
    config JSONB DEFAULT '{}'::jsonb,
    is_public BOOLEAN DEFAULT false
);

-- Enable RLS on boards
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- POLICIES (Initial simple ownership policies)

-- Users can view hubs they own
CREATE POLICY "Users can view their own hubs" 
ON hubs FOR SELECT 
TO authenticated 
USING (auth.uid() = owner_id);

-- Users can manage their own hubs
CREATE POLICY "Users can manage their own hubs" 
ON hubs FOR ALL 
TO authenticated 
USING (auth.uid() = owner_id);

-- Users can view boards in hubs they have access to
-- (For Phase 1, we assume if you own the hub, you own the boards)
CREATE POLICY "Users can view boards in their hubs" 
ON boards FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM hubs 
    WHERE hubs.id = boards.hub_id 
    AND hubs.owner_id = auth.uid()
));

-- Users can manage boards in their hubs
CREATE POLICY "Users can manage boards in their hubs" 
ON boards FOR ALL 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM hubs 
    WHERE hubs.id = boards.hub_id 
    AND hubs.owner_id = auth.uid()
));

-- TRIGGER for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hubs_updated_at BEFORE UPDATE ON hubs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
