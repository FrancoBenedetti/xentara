-- Phase 4: Hub RBAC & Team Management

-- 1. Create PROFILES Table (Publicly accessible user data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- TRIGGER to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Create HUB MEMBERSHIPS Table
DO $$ BEGIN
    CREATE TYPE public.hub_role AS ENUM ('owner', 'editor', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.hub_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role public.hub_role DEFAULT 'viewer' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(hub_id, user_id)
);

-- Enable RLS on hub_memberships
ALTER TABLE public.hub_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view hub memberships" ON public.hub_memberships;
CREATE POLICY "Members can view hub memberships" 
ON public.hub_memberships FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.hub_memberships m WHERE m.hub_id = hub_memberships.hub_id AND m.user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM public.hubs h WHERE h.id = hub_memberships.hub_id AND h.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can manage hub memberships" ON public.hub_memberships;
CREATE POLICY "Owners can manage hub memberships" 
ON public.hub_memberships FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.hub_memberships m WHERE m.hub_id = hub_memberships.hub_id AND m.user_id = auth.uid() AND m.role = 'owner')
    OR EXISTS (SELECT 1 FROM public.hubs h WHERE h.id = hub_memberships.hub_id AND h.owner_id = auth.uid())
);

-- 3. Create HUB INVITATIONS Table
CREATE TABLE IF NOT EXISTS public.hub_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hub_id UUID NOT NULL REFERENCES public.hubs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.hub_role DEFAULT 'viewer' NOT NULL,
    invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days') NOT NULL
);

-- Enable RLS on invitations
ALTER TABLE public.hub_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners/Editors can view invitations" ON public.hub_invitations;
CREATE POLICY "Owners/Editors can view invitations" 
ON public.hub_invitations FOR SELECT 
USING (
    EXISTS (SELECT 1 FROM public.hub_memberships m WHERE m.hub_id = hub_invitations.hub_id AND m.user_id = auth.uid() AND m.role IN ('owner', 'editor'))
    OR EXISTS (SELECT 1 FROM public.hubs h WHERE h.id = hub_invitations.hub_id AND h.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "Owners can manage invitations" ON public.hub_invitations;
CREATE POLICY "Owners can manage invitations" 
ON public.hub_invitations FOR ALL 
USING (
    EXISTS (SELECT 1 FROM public.hub_memberships m WHERE m.hub_id = hub_invitations.hub_id AND m.user_id = auth.uid() AND m.role = 'owner')
    OR EXISTS (SELECT 1 FROM public.hubs h WHERE h.id = hub_invitations.hub_id AND h.owner_id = auth.uid())
);

-- 4. TRIGGER to add owner to memberships on hub creation
CREATE OR REPLACE FUNCTION public.handle_new_hub() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.hub_memberships (hub_id, user_id, role)
  VALUES (new.id, new.owner_id, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_hub_created
  AFTER INSERT ON public.hubs
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_hub();

-- 5. RE-DEFINE RLS POLICIES (Switch from owner_id check to membership check)

-- Function to check membership
CREATE OR REPLACE FUNCTION public.has_hub_access(p_hub_id UUID, p_roles public.hub_role[] DEFAULT ARRAY['owner', 'editor', 'viewer']::public.hub_role[])
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hub_memberships m
    WHERE m.hub_id = p_hub_id
    AND m.user_id = auth.uid()
    AND m.role = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP AND RECREATE HUBS POLICIES
DROP POLICY IF EXISTS "Users can view their own hubs" ON public.hubs;
DROP POLICY IF EXISTS "Users can manage their own hubs" ON public.hubs;
DROP POLICY IF EXISTS "Users can view hubs they are members of" ON public.hubs;
DROP POLICY IF EXISTS "Owners can manage hubs" ON public.hubs;

CREATE POLICY "Users can view hubs they are members of" 
ON public.hubs FOR SELECT 
USING (public.has_hub_access(id));

CREATE POLICY "Owners can manage hubs" 
ON public.hubs FOR ALL 
USING (public.has_hub_access(id, ARRAY['owner']::public.hub_role[]))
WITH CHECK (owner_id = auth.uid());

-- DROP AND RECREATE BOARDS POLICIES
DROP POLICY IF EXISTS "Users can view boards in their hubs" ON public.boards;
DROP POLICY IF EXISTS "Users can manage boards in their hubs" ON public.boards;
DROP POLICY IF EXISTS "Members can view boards" ON public.boards;
DROP POLICY IF EXISTS "Editors/Owners can manage boards" ON public.boards;

CREATE POLICY "Members can view boards" 
ON public.boards FOR SELECT 
USING (public.has_hub_access(hub_id));

CREATE POLICY "Editors/Owners can manage boards" 
ON public.boards FOR ALL 
USING (public.has_hub_access(hub_id, ARRAY['owner', 'editor']::public.hub_role[]));

-- DROP AND RECREATE SOURCES POLICIES
DROP POLICY IF EXISTS "Users can manage sources in their hubs" ON public.monitored_sources;
DROP POLICY IF EXISTS "Members can view sources" ON public.monitored_sources;
DROP POLICY IF EXISTS "Editors/Owners can manage sources" ON public.monitored_sources;

CREATE POLICY "Members can view sources" 
ON public.monitored_sources FOR SELECT 
USING (public.has_hub_access(hub_id));

CREATE POLICY "Editors/Owners can manage sources" 
ON public.monitored_sources FOR ALL 
USING (public.has_hub_access(hub_id, ARRAY['owner', 'editor']::public.hub_role[]));

-- DROP AND RECREATE PUBLICATIONS POLICIES
DROP POLICY IF EXISTS "Users can manage publications in their hubs" ON public.publications;
DROP POLICY IF EXISTS "Members can view publications" ON public.publications;
DROP POLICY IF EXISTS "Editors/Owners can manage publications" ON public.publications;

CREATE POLICY "Members can view publications" 
ON public.publications FOR SELECT 
USING (public.has_hub_access(hub_id));

CREATE POLICY "Editors/Owners can manage publications" 
ON public.publications FOR ALL 
USING (public.has_hub_access(hub_id, ARRAY['owner', 'editor']::public.hub_role[]));

-- DROP AND RECREATE TAGS POLICIES
DROP POLICY IF EXISTS "Users can manage their own hub tags" ON public.hub_tags;
DROP POLICY IF EXISTS "Users can manage publication tags" ON public.publication_hub_tags;
DROP POLICY IF EXISTS "Members can view tags" ON public.hub_tags;
DROP POLICY IF EXISTS "Editors/Owners can manage tags" ON public.hub_tags;
DROP POLICY IF EXISTS "Members can view publication tags" ON public.publication_hub_tags;
DROP POLICY IF EXISTS "Editors/Owners can manage publication tags" ON public.publication_hub_tags;

CREATE POLICY "Members can view tags" 
ON public.hub_tags FOR SELECT 
USING (public.has_hub_access(hub_id));

CREATE POLICY "Editors/Owners can manage tags" 
ON public.hub_tags FOR ALL 
USING (public.has_hub_access(hub_id, ARRAY['owner', 'editor']::public.hub_role[]));

CREATE POLICY "Members can view publication tags" 
ON public.publication_hub_tags FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.publications p WHERE p.id = publication_hub_tags.publication_id AND public.has_hub_access(p.hub_id)));

CREATE POLICY "Editors/Owners can manage publication tags" 
ON public.publication_hub_tags FOR ALL 
USING (EXISTS (SELECT 1 FROM public.publications p WHERE p.id = publication_hub_tags.publication_id AND public.has_hub_access(p.hub_id, ARRAY['owner', 'editor']::public.hub_role[])));
