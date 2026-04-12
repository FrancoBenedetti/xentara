CREATE TABLE public.publication_engagement (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id         UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    hub_id                 UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    consumer_id            UUID REFERENCES public.consumer_profiles(id) ON DELETE SET NULL,
    messenger_identity_id  UUID REFERENCES public.messenger_identities(id) ON DELETE SET NULL,
    platform               TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp', 'pwa')),
    type                   TEXT NOT NULL CHECK (type IN ('reaction', 'comment', 'share')),
    value                  TEXT NOT NULL,
    sentiment_score        DOUBLE PRECISION,
    metadata               JSONB DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ DEFAULT now() NOT NULL,
    -- Prevent duplicate reactions from the same user on the same publication
    UNIQUE NULLS NOT DISTINCT (publication_id, messenger_identity_id, type, value)
);

CREATE INDEX idx_engagement_publication_id ON public.publication_engagement(publication_id);
CREATE INDEX idx_engagement_hub_id ON public.publication_engagement(hub_id);
CREATE INDEX idx_engagement_consumer_id ON public.publication_engagement(consumer_id) WHERE consumer_id IS NOT NULL;
CREATE INDEX idx_engagement_messenger_id ON public.publication_engagement(messenger_identity_id) WHERE messenger_identity_id IS NOT NULL;

ALTER TABLE public.publication_engagement ENABLE ROW LEVEL SECURITY;

-- Service role writes (bot/Inngest). Curators can read for their hubs.
CREATE POLICY "Curators can view engagement for their hubs"
ON public.publication_engagement FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.publication_engagement.hub_id
    AND hm.user_id = auth.uid()
  )
);
