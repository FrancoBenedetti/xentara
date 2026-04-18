CREATE TABLE public.hub_engagement_config (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id              UUID NOT NULL UNIQUE REFERENCES public.hubs(id) ON DELETE CASCADE,
    reactions_enabled   TEXT[] NOT NULL DEFAULT ARRAY['insight', 'helpful', 'irrelevant'],
    comments_enabled    BOOLEAN NOT NULL DEFAULT true,
    updated_at          TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Keep updated_at fresh
CREATE TRIGGER update_hub_engagement_config_updated_at
    BEFORE UPDATE ON public.hub_engagement_config
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_hub_engagement_config_hub_id ON public.hub_engagement_config(hub_id);

ALTER TABLE public.hub_engagement_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hub members can view engagement config"
ON public.hub_engagement_config FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_engagement_config.hub_id
    AND hm.user_id = auth.uid()
  )
);

CREATE POLICY "Hub owners and editors can manage engagement config"
ON public.hub_engagement_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_engagement_config.hub_id
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'editor')
  )
);
