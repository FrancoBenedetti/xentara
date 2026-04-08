-- Phase 7: Consumer Identity & Linking (PWA <-> Messengers)
-- Creates the Unified Identity Engine tables.

-- ============================================================
-- 1. CONSUMER PROFILES (1:1 extension of profiles for consumer-specific data)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consumer_profiles (
    id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    display_alias   TEXT,                                -- Public-facing name (privacy layer)
    avatar_hash     TEXT,                                -- Deterministic anonymized avatar seed
    is_anonymous    BOOLEAN DEFAULT true NOT NULL,       -- Whether curators can see real identity
    preferences     JSONB DEFAULT '{}'::jsonb NOT NULL,  -- Feed prefs, notification settings
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own consumer profile
DROP POLICY IF EXISTS "Users can view own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can view own consumer profile"
ON public.consumer_profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own consumer profile
DROP POLICY IF EXISTS "Users can update own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can update own consumer profile"
ON public.consumer_profiles FOR UPDATE
USING (auth.uid() = id);

-- Users can insert their own consumer profile
DROP POLICY IF EXISTS "Users can create own consumer profile" ON public.consumer_profiles;
CREATE POLICY "Users can create own consumer profile"
ON public.consumer_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Trigger for updated_at
CREATE TRIGGER update_consumer_profiles_updated_at
  BEFORE UPDATE ON public.consumer_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- 2. HUB SUBSCRIPTIONS (Consumer follows a hub)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hub_subscriptions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    hub_id                  UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    notification_preference TEXT DEFAULT 'all' NOT NULL
                            CHECK (notification_preference IN ('all', 'highlights', 'none')),
    subscribed_at           TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(consumer_id, hub_id)
);

ALTER TABLE public.hub_subscriptions ENABLE ROW LEVEL SECURITY;

-- Consumers can view their own subscriptions
DROP POLICY IF EXISTS "Consumers can view own subscriptions" ON public.hub_subscriptions;
CREATE POLICY "Consumers can view own subscriptions"
ON public.hub_subscriptions FOR SELECT
USING (auth.uid() = consumer_id);

-- Consumers can create subscriptions for themselves
DROP POLICY IF EXISTS "Consumers can subscribe to hubs" ON public.hub_subscriptions;
CREATE POLICY "Consumers can subscribe to hubs"
ON public.hub_subscriptions FOR INSERT
WITH CHECK (auth.uid() = consumer_id);

-- Consumers can update their own subscriptions (notification prefs)
DROP POLICY IF EXISTS "Consumers can update own subscriptions" ON public.hub_subscriptions;
CREATE POLICY "Consumers can update own subscriptions"
ON public.hub_subscriptions FOR UPDATE
USING (auth.uid() = consumer_id);

-- Consumers can delete (unsubscribe) their own subscriptions
DROP POLICY IF EXISTS "Consumers can unsubscribe" ON public.hub_subscriptions;
CREATE POLICY "Consumers can unsubscribe"
ON public.hub_subscriptions FOR DELETE
USING (auth.uid() = consumer_id);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_hub_subscriptions_consumer
  ON public.hub_subscriptions (consumer_id);
CREATE INDEX IF NOT EXISTS idx_hub_subscriptions_hub
  ON public.hub_subscriptions (hub_id);


-- ============================================================
-- 3. MESSENGER IDENTITIES (Links external platforms to Xentara identity)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messenger_identities (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform          TEXT NOT NULL CHECK (platform IN ('telegram', 'whatsapp')),
    platform_user_id  TEXT NOT NULL,               -- External platform's user identifier
    platform_username TEXT,                         -- Display handle (e.g., @username)
    consumer_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  -- NULL = shadow profile
    is_verified       BOOLEAN DEFAULT false NOT NULL,
    linked_at         TIMESTAMPTZ,                 -- When the link was established
    created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(platform, platform_user_id)
);

ALTER TABLE public.messenger_identities ENABLE ROW LEVEL SECURITY;

-- Users can view their own linked identities
DROP POLICY IF EXISTS "Users can view own messenger identities" ON public.messenger_identities;
CREATE POLICY "Users can view own messenger identities"
ON public.messenger_identities FOR SELECT
USING (auth.uid() = consumer_id);

-- Users can update their own identities (e.g., unlink by setting consumer_id to null won't work — use DELETE route instead)
DROP POLICY IF EXISTS "Users can update own messenger identities" ON public.messenger_identities;
CREATE POLICY "Users can update own messenger identities"
ON public.messenger_identities FOR UPDATE
USING (auth.uid() = consumer_id);

-- Note: INSERT and shadow creation are handled by the service role (no user-facing INSERT policy).
-- The claim/link flow uses the service role to update consumer_id.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messenger_identities_consumer
  ON public.messenger_identities (consumer_id);
CREATE INDEX IF NOT EXISTS idx_messenger_identities_platform
  ON public.messenger_identities (platform, platform_user_id);


-- ============================================================
-- 4. LINK TOKENS (One-time codes for identity hydration)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.link_tokens (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    messenger_identity_id  UUID REFERENCES public.messenger_identities(id) ON DELETE CASCADE,
    token                  TEXT UNIQUE NOT NULL,               -- 6-digit code
    expires_at             TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
    claimed_by             UUID REFERENCES public.profiles(id),
    claimed_at             TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.link_tokens ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view tokens they created or claimed
DROP POLICY IF EXISTS "Users can view own link tokens" ON public.link_tokens;
CREATE POLICY "Users can view own link tokens"
ON public.link_tokens FOR SELECT
USING (auth.uid() = claimed_by);

-- Note: Token creation and claiming are handled via service-role API routes.
-- No direct INSERT/UPDATE policies for regular users.


-- ============================================================
-- 5. HELPER FUNCTION: Get subscriber count for a hub (anonymized)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_hub_subscriber_count(p_hub_id UUID)
RETURNS bigint AS $$
BEGIN
  RETURN (
    SELECT count(*) FROM public.hub_subscriptions
    WHERE hub_id = p_hub_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
