-- Fix: Infinite recursion in RBAC policies

-- 1. Correct the Hub Memberships policies to use the SECURITY DEFINER function
-- This breaks the recursion because the function bypasses RLS for its internal query.

DROP POLICY IF EXISTS "Members can view hub memberships" ON public.hub_memberships;
DROP POLICY IF EXISTS "Owners can manage hub memberships" ON public.hub_memberships;

CREATE POLICY "Members can view hub memberships" 
ON public.hub_memberships FOR SELECT 
USING (
    user_id = auth.uid() 
    OR public.has_hub_access(hub_id)
);

CREATE POLICY "Owners can manage hub memberships" 
ON public.hub_memberships FOR ALL 
USING (
    public.has_hub_access(hub_id, ARRAY['owner']::public.hub_role[])
);

-- 2. Correct the Hub Invitations policies
DROP POLICY IF EXISTS "Owners/Editors can view invitations" ON public.hub_invitations;
DROP POLICY IF EXISTS "Owners can manage invitations" ON public.hub_invitations;

CREATE POLICY "Owners/Editors can view invitations" 
ON public.hub_invitations FOR SELECT 
USING (
    public.has_hub_access(hub_id, ARRAY['owner', 'editor']::public.hub_role[])
);

CREATE POLICY "Owners can manage invitations" 
ON public.hub_invitations FOR ALL 
USING (
    public.has_hub_access(hub_id, ARRAY['owner']::public.hub_role[])
);

-- 3. Ensure the has_hub_access function is robust
-- We ensure it's defined BEFORE these policies are heavily used.
-- (It's already in the previous migration, but we re-confirm its properties)
ALTER FUNCTION public.has_hub_access(UUID, public.hub_role[]) SECURITY DEFINER;
