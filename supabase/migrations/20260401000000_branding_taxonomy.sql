-- 1. Add Branding & Strictness to Hubs
ALTER TABLE IF EXISTS public.hubs 
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS strictness TEXT DEFAULT 'exploratory' CHECK (strictness IN ('exploratory', 'strict'));

-- 2. Create Hub-Specific Taxonomy Table
CREATE TABLE IF NOT EXISTS public.hub_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(hub_id, name)
);

-- 3. Junction Table: Many-to-Many Publications -> Hub Tags
CREATE TABLE IF NOT EXISTS public.publication_hub_tags (
    publication_id UUID REFERENCES public.publications(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.hub_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, tag_id)
);

-- 4. RLS for Taxonomy
ALTER TABLE public.hub_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_hub_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own hub tags" 
ON public.hub_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM public.hubs h WHERE h.id = hub_tags.hub_id AND h.owner_id = auth.uid()));

CREATE POLICY "Users can manage publication tags" 
ON public.publication_hub_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM public.publications p JOIN public.hubs h ON p.hub_id = h.id 
               WHERE p.id = publication_hub_tags.publication_id AND h.owner_id = auth.uid()));
