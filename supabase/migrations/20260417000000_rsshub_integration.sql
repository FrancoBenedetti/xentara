-- Add 'rsshub' to the source_type enum
ALTER TYPE source_type ADD VALUE IF NOT EXISTS 'rsshub';

-- Create route_requests table
CREATE TABLE public.route_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Who requested it
    requested_by    UUID NOT NULL REFERENCES auth.users(id),
    requested_by_hub_id UUID REFERENCES public.hubs(id) ON DELETE SET NULL,

    -- What they want
    target_url      TEXT NOT NULL,          -- The site/page URL to create a route for
    instructions    TEXT,                   -- Free-text instructions from the curator

    -- Credentials / access (optional, nullable)
    access_notes    TEXT,                   -- API keys, login info, or notes about access requirements

    -- Lifecycle
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'failed')),

    -- Resolution (filled when completed)
    rsshub_namespace  TEXT,                 -- e.g., 'solidariteit'
    rsshub_route_path TEXT,                 -- e.g., '/:category?'
    rsshub_example_url TEXT,               -- e.g., '/solidariteit/nuus'
    resolution_notes  TEXT,                -- Agent/developer notes about what was built
    resolved_at     TIMESTAMPTZ,
    resolved_by     TEXT                   -- 'agent' | 'developer' | user identifier
);

CREATE INDEX idx_route_requests_status ON public.route_requests(status);
CREATE INDEX idx_route_requests_requested_by ON public.route_requests(requested_by);

ALTER TABLE public.route_requests ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can create requests
CREATE POLICY "Users can create route requests"
ON public.route_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requested_by);

-- Users can view their own requests
CREATE POLICY "Users can view their own route requests"
ON public.route_requests FOR SELECT
TO authenticated
USING (auth.uid() = requested_by);

-- Trigger for updated_at
CREATE TRIGGER update_route_requests_updated_at
BEFORE UPDATE ON public.route_requests
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
