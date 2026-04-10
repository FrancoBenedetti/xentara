CREATE TABLE public.hub_channels (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id         UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    platform       TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp')),
    channel_id     TEXT NOT NULL,            -- Telegram chat_id or WhatsApp group/broadcast ID
    channel_name   TEXT,                     -- Human-readable label
    is_active      BOOLEAN DEFAULT true,     -- Toggle distribution on/off
    added_by       UUID REFERENCES public.profiles(id),
    created_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(hub_id, platform, channel_id)
);

CREATE INDEX idx_hub_channels_hub_id ON public.hub_channels(hub_id);

ALTER TABLE public.hub_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hub owners and editors can view channels"
ON public.hub_channels FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_channels.hub_id
    AND hm.user_id = auth.uid()
  )
);

CREATE POLICY "Hub owners and editors can manage channels"
ON public.hub_channels FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.hub_memberships hm
    WHERE hm.hub_id = public.hub_channels.hub_id
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'editor')
  )
);


CREATE TABLE public.distribution_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id  UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
    hub_channel_id  UUID REFERENCES public.hub_channels(id) ON DELETE SET NULL,
    platform        TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp')),
    target_id       TEXT NOT NULL,            -- chat_id, phone number, or channel_id
    status          TEXT DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'failed', 'rate_limited')),
    message_id      TEXT,                     -- Platform-specific message ID (for later edits/deletes)
    error_message   TEXT,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_distribution_log_pub_id ON public.distribution_log(publication_id);
CREATE INDEX idx_distribution_log_channel_id ON public.distribution_log(hub_channel_id);

ALTER TABLE public.distribution_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Distribution log is service role only"
ON public.distribution_log FOR ALL
USING (false);

-- Optional: Allow hub owners to SELECT logs for their hubs
CREATE POLICY "Hub owners can view distribution logs"
ON public.distribution_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.publications p
    JOIN public.hub_memberships hm ON p.hub_id = hm.hub_id
    WHERE p.id = public.distribution_log.publication_id
    AND hm.user_id = auth.uid()
    AND hm.role IN ('owner', 'editor')
  )
);
