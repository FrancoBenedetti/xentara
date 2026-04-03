'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'

/**
 * --- PROFESSIONAL LOCAL SCHEMA ---
 * We define these here so the Hub management logic is type-safe and lint-free
 * until the global Supabase 'Database' type is officially re-generated.
 */
export interface Hub {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  brand_color?: string;
  logo_url?: string;
  strictness?: 'exploratory' | 'strict';
  role?: 'owner' | 'editor' | 'viewer'; // User's role in this hub
}

export interface HubMember {
  id: string;
  hub_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  profiles: {
    email: string;
    display_name: string;
    avatar_url?: string;
  };
}

export interface HubTag {
  id: string;
  hub_id: string;
  name: string;
  description: string;
  is_confirmed: boolean;
}

export interface MonitoredSource {
  id: string;
  hub_id: string;
  name: string;
  url: string;
  type: string;
  is_active: boolean;
}

export interface Publication {
  id: string;
  hub_id: string;
  source_id: string;
  title: string;
  byline: string;
  summary: string;
  status: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed' | 'published';
  source_url: string;
  tags: string[];
  sentiment_score: number | null;
  curator_commentary?: string;
  is_published: boolean;
  published_at: string;
  curator_published_at?: string;
  error_message?: string | null;
  monitored_sources?: {
    name: string;
  };
}

interface PublicationResult {
  monitored_sources: {
    type: string;
  } | null;
}

/**
 * HUB MANAGEMENT
 */
export async function createHub(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (!user.email_confirmed_at) throw new Error('Email must be confirmed to create hubs')

  const hubData: Partial<Hub> = {
    name,
    slug,
    owner_id: user.id
  }

  const { error } = await supabase.from('hubs' as never).insert(hubData as never)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function getHubs(): Promise<Hub[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch hubs where the user is a member
    const { data: memberships, error } = await supabase
      .from('hub_memberships' as never)
      .select('role, hubs (*)')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching hubs via memberships:', error)
      return []
    }

    return (memberships as any[]).map(m => ({
      ...m.hubs,
      role: m.role
    })) || []
  } catch (err) {
    console.error('getHubs exception:', err)
    return []
  }
}

/**
 * TEAM MANAGEMENT
 */
export async function getHubMembers(hubId: string): Promise<HubMember[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hub_memberships' as never)
    .select('*, profiles (email, display_name, avatar_url)')
    .eq('hub_id', hubId)

  if (error) {
    console.error('Error fetching hub members:', error)
    return []
  }

  return (data as unknown as HubMember[]) || []
}

export async function inviteMember(hubId: string, email: string, role: string) {
  const supabase = await createClient()

  // 1. Check if user already exists in profiles
  const { data: profile } = await supabase
    .from('profiles' as never)
    .select('id')
    .eq('email', email)
    .single()

  if (profile) {
    // 2. Direct add if user exists
    const { error } = await supabase
      .from('hub_memberships' as never)
      .insert({ hub_id: hubId, user_id: (profile as any).id, role } as never)
    
    if (error) throw new Error(error.message)
  } else {
    // 3. Create invitation if user doesn't exist
    const { data: { user: inviter } } = await supabase.auth.getUser()
    if (!inviter) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('hub_invitations' as never)
      .insert({ hub_id: hubId, email, role, invited_by: inviter.id } as never)
    
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function updateMemberRole(hubId: string, userId: string, role: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_memberships' as never)
    .update({ role } as never)
    .eq('hub_id', hubId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
  return { success: true }
}

export async function removeMember(hubId: string, userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_memberships' as never)
    .delete()
    .eq('hub_id', hubId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * SOURCE MANAGEMENT
 */
export async function addSource(hubId: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as string

  const sourceData: Partial<MonitoredSource> = {
      hub_id: hubId,
      name,
      url,
      type,
      is_active: true
  }

  const { error, data: source } = await supabase
    .from('monitored_sources' as never)
    .insert(sourceData as never)
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (source) {
    const s = source as unknown as MonitoredSource
    try {
      await inngest.send({
        name: "xentara/source.added",
        data: { sourceId: s.id, url: s.url, type: s.type }
      })
    } catch (inngestError) {
      console.warn("Inngest event failed to send (source.added). Is the Dev Server running?", inngestError);
    }
  }

  revalidatePath('/dashboard')
}

export async function getSources(hubId: string): Promise<MonitoredSource[]> {
  const supabase = await createClient()
  const { data: sources } = await supabase
    .from('monitored_sources' as never)
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })

  return (sources as unknown as MonitoredSource[]) || []
}

export async function updateSource(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as string

  const { error } = await supabase
    .from('monitored_sources' as never)
    .update({ name, url, type } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function removeSource(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('monitored_sources').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function refreshSource(id: string, url: string, type: string) {
  try {
    await inngest.send({
      name: "xentara/source.added",
      data: { sourceId: id, url: url, type: type }
    })
  } catch (inngestError) {
    console.error("Inngest refresh failed. Check if Inngest Dev Server is running.", inngestError);
    throw new Error("Unable to trigger background refresh. Please ensure Inngest is active.");
  }
}

/**
 * INTELLIGENCE & PUBLICATIONS
 */
export async function getRecentPublications(hubId: string): Promise<Publication[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('publications')
    .select('*, monitored_sources(name)')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })
    .limit(20)

  return (data as unknown as Publication[]) || []
}

export async function getPublicationHistory(hubId: string, page: number = 0): Promise<Publication[]> {
  const supabase = await createClient()
  const pageSize = 20
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data } = await supabase
    .from('publications')
    .select('*, monitored_sources(name)')
    .eq('hub_id', hubId)
    .eq('is_published', true)
    .order('curator_published_at', { ascending: false })
    .range(from, to)

  return (data as unknown as Publication[]) || []
}

export async function publishPublication(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const byline = formData.get('byline') as string
  const summary = formData.get('summary') as string
  const curator_commentary = formData.get('curator_commentary') as string

  const { error } = await supabase
    .from('publications' as never)
    .update({
      title,
      byline,
      summary,
      curator_commentary,
      status: 'published',
      is_published: true,
      curator_published_at: new Date().toISOString()
    } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/history')
  return { success: true }
}

export async function updateHubBranding(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const brand_color = formData.get('brand_color') as string
  const logo_url = formData.get('logo_url') as string
  const strictness = formData.get('strictness') as string

  const { error } = await supabase
    .from('hubs' as never)
    .update({ name, brand_color, logo_url, strictness } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
}

/**
 * TAXONOMY MANAGEMENT
 */
export async function getHubTags(hubId: string): Promise<HubTag[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hub_tags' as never)
    .select('*')
    .eq('hub_id', hubId)
    .order('is_confirmed', { ascending: true })
    .order('created_at', { ascending: false })

  return (data as unknown as HubTag[]) || []
}

export async function updateHubStrictness(id: string, strictness: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hubs' as never)
    .update({ strictness } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function confirmHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags' as never)
    .update({ is_confirmed: true } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function updateHubTag(id: string, name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags' as never)
    .update({ name, description, is_confirmed: true } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function removeHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('hub_tags' as never).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function addHubTag(hubId: string, name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('hub_tags' as never).insert({
    hub_id: hubId,
    name,
    description,
    is_confirmed: true
  } as never)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function reprocessPublication(id: string, url: string) {
  const supabase = await createClient()
  
  await supabase
    .from('publications' as never)
    .update({ status: 'raw' } as never)
    .eq('id', id)

  const { data: pub } = await supabase
    .from('publications' as never)
    .select('monitored_sources(type)')
    .eq('id', id)
    .single();

  const sourceType = (pub as unknown as PublicationResult)?.monitored_sources?.type || 'youtube';

  try {
    await inngest.send({
      name: "xentara/publication.detected",
      data: { 
          publicationId: id, 
          sourceUrl: url,
          type: sourceType
      }
    })
  } catch (inngestError) {
    console.error("Inngest reprocess failed:", inngestError);
    // Even if inngest fails, we still want to revalidate the path
  }

  revalidatePath('/dashboard')
}
