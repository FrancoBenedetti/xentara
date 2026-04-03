-- Phase 4 Backfill: Populate profiles for existing users

INSERT INTO public.profiles (id, email, display_name)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Also ensure the current user is an owner of their existing hubs in memberships
INSERT INTO public.hub_memberships (hub_id, user_id, role)
SELECT 
    id, 
    owner_id, 
    'owner'
FROM public.hubs
ON CONFLICT (hub_id, user_id) DO NOTHING;
