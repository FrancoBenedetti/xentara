'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
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
  content_language?: string; // e.g. 'en-GB', 'af', 'original'
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
  synopsis?: string;
  status: 'raw' | 'transcribing' | 'summarizing' | 'ready' | 'failed' | 'published' | 'purged';
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
  metadata?: any;
  created_at?: string;
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

  const { error } = await (supabase.from('hubs' as any) as any).insert(hubData as never)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function getHubs(): Promise<Hub[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Fetch hubs where the user is a member
    const { data: memberships, error } = await (supabase
      .from('hub_memberships' as any) as any)
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
    unstable_rethrow(err)
    console.error('getHubs exception:', err)
    return []
  }
}

export async function getHubBySlug(slug: string): Promise<Hub | null> {
  const hubs = await getHubs()
  return hubs.find(h => h.slug === slug) || null
}

export async function getHubSubscriberCount(hubId: string): Promise<number> {
  try {
    const { createAdminClient } = await import('@/utils/supabase/admin')
    const admin = createAdminClient()
    const { count, error } = await (admin
      .from('hub_subscriptions' as any) as any)
      .select('*', { count: 'exact', head: true })
      .eq('hub_id', hubId)

    if (error) {
      console.error('Error fetching subscriber count:', error)
      return 0
    }
    return count ?? 0
  } catch (err) {
    unstable_rethrow(err)
    console.error('getHubSubscriberCount exception:', err)
    return 0
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

  revalidatePath('/dashboard', 'layout')
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
  revalidatePath('/dashboard', 'layout')
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
  revalidatePath('/dashboard', 'layout')
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
    .order('name', { ascending: true })

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

  revalidatePath('/dashboard')
}

/**
 * INTELLIGENCE & PUBLICATIONS
 */
export async function getRecentPublications(hubId: string, sourceId?: string, page: number = 0): Promise<Publication[]> {
  const supabase = await createClient()
  let query = supabase
    .from('publications')
    .select('*, monitored_sources(name)')
    .eq('hub_id', hubId)
    .neq('status', 'purged')
    
  if (sourceId) {
    query = query.eq('source_id', sourceId)
  }

  const pageSize = 50
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  return (data as unknown as Publication[]) || []
}

export async function getPublicationHistory(
  hubId: string, 
  page: number = 0,
  options?: {
    search?: string;
    flavor?: string;
    dateFrom?: string;
    dateTo?: string;
    sortAsc?: boolean;
  }
): Promise<Publication[]> {
  const supabase = await createClient()
  const pageSize = 20
  const from = page * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('publications')
    .select('*, monitored_sources(name)')
    .eq('hub_id', hubId)
    .eq('is_published', true)
    .neq('status', 'purged')

  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`)
  }

  if (options?.flavor) {
    query = query.contains('tags', [options.flavor])
  }

  if (options?.dateFrom) {
    query = query.gte('curator_published_at', options.dateFrom)
  }

  if (options?.dateTo) {
    query = query.lte('curator_published_at', options.dateTo)
  }

  query = query.order('curator_published_at', { ascending: options?.sortAsc ?? false })
  
  const { data } = await query.range(from, to)

  return (data as unknown as Publication[]) || []
}

export async function publishPublication(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const title = formData.get('title') as string
  const byline = formData.get('byline') as string
  const summary = formData.get('summary') as string
  const synopsis = formData.get('synopsis') as string
  const curator_commentary = formData.get('curator_commentary') as string

  const { error } = await supabase
    .from('publications' as never)
    .update({
      title,
      byline,
      summary,
      synopsis,
      curator_commentary,
      status: 'published',
      is_published: true,
      curator_published_at: new Date().toISOString()
    } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  // Trigger distribution agent
  try {
    const { data: pub } = await supabase
      .from('publications')
      .select('hub_id')
      .eq('id', id)
      .single()

    if (pub) {
      await inngest.send({
        name: 'xentara/publication.published',
        data: { publicationId: id, hubId: (pub as any).hub_id }
      })
    }
  } catch (inngestError) {
    console.warn('Distribution event failed:', inngestError)
  }

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
  revalidatePath('/dashboard', 'layout')
}

/**
 * TAXONOMY MANAGEMENT
 */

/** Lightweight count-only query — no row data fetched */
export async function getHubTagCounts(hubId: string): Promise<{ confirmed: number; unconfirmed: number }> {
  const supabase = await createClient()
  const [c, u] = await Promise.all([
    (supabase.from('hub_tags' as never) as any)
      .select('id', { count: 'exact', head: true })
      .eq('hub_id', hubId)
      .eq('is_confirmed', true),
    (supabase.from('hub_tags' as never) as any)
      .select('id', { count: 'exact', head: true })
      .eq('hub_id', hubId)
      .eq('is_confirmed', false),
  ])
  return { confirmed: c.count ?? 0, unconfirmed: u.count ?? 0 }
}

/** Fetch id + name only for confirmed tags — used for chip rendering */
export async function getConfirmedTagNames(hubId: string): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data } = await (supabase.from('hub_tags' as never) as any)
    .select('id, name')
    .eq('hub_id', hubId)
    .eq('is_confirmed', true)
    .order('name', { ascending: true })
  return (data as { id: string; name: string }[]) || []
}

/** Full fetch — used by Taxonomy Studio (capped at 200 rows) */
export async function getHubTags(hubId: string): Promise<HubTag[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hub_tags' as never)
    .select('*')
    .eq('hub_id', hubId)
    .order('is_confirmed', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(200)

  return (data as unknown as HubTag[]) || []
}

export async function updateHubStrictness(id: string, strictness: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hubs' as never)
    .update({ strictness } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard', 'layout')
}

export async function updateHubContentLanguage(id: string, content_language: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hubs' as never)
    .update({ content_language } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard', 'layout')
}

export async function confirmHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags' as never)
    .update({ is_confirmed: true } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard', 'layout')
}

export async function updateHubTag(id: string, name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags' as never)
    .update({ name, description, is_confirmed: true } as never)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard', 'layout')
}

export async function removeHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('hub_tags' as never).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard', 'layout')
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
  revalidatePath('/dashboard', 'layout')
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

export async function getPublicationTags(publicationId: string): Promise<{ id: string; name: string; tag_id: string; is_suppressed: boolean; description?: string }[]> {
  const supabase = await createClient()
  
  // 1. Fetch publication to get its raw tags
  const { data: pub } = await supabase
    .from('publications')
    .select('hub_id, tags')
    .eq('id', publicationId)
    .single()

  if (!pub) return []

  // 2. Fetch existing links — include description so inline edit (R2) can preserve it
  const { data: existingLinks } = await supabase
    .from('publication_hub_tags' as never)
    .select(`
      id,
      is_suppressed,
      tag_id,
      hub_tags!inner(name, description)
    `)
    .eq('publication_id', publicationId)

  const linkedTagIds = new Set((existingLinks || []).map((l: any) => l.tag_id))
  const results = (existingLinks || []).map((d: any) => ({
    id: d.id,
    tag_id: d.tag_id,
    name: d.hub_tags.name,
    description: d.hub_tags.description as string | undefined,
    is_suppressed: d.is_suppressed
  }))

  // 3. AUTO-SYNC: Check if raw tags now match confirmed hub flavors that aren't linked yet
  if (pub.tags && pub.tags.length > 0) {
    const { data: matchingHubTags } = await supabase
      .from('hub_tags')
      .select('id, name, description')
      .eq('hub_id', pub.hub_id)
      .eq('is_confirmed', true)
      .in('name', pub.tags)

    if (matchingHubTags && matchingHubTags.length > 0) {
      const missingLinks = matchingHubTags
        .filter(ht => !linkedTagIds.has(ht.id))
        .map(ht => ({
          publication_id: publicationId,
          tag_id: ht.id,
          is_suppressed: false
        }))

      if (missingLinks.length > 0) {
        const { data: newLinks } = await supabase
          .from('publication_hub_tags' as never)
          .insert(missingLinks as any)
          .select('id, tag_id, is_suppressed')

        if (newLinks) {
          newLinks.forEach((nl: any) => {
            const ht = matchingHubTags.find(t => t.id === nl.tag_id)
            results.push({
              id: nl.id,
              tag_id: nl.tag_id,
              name: ht?.name || 'Unknown',
              description: ht?.description as string | undefined,
              is_suppressed: nl.is_suppressed
            })
          })
        }
      }
    }
  }
    
  return results
}

/** Search confirmed hub flavors by name for the Add-Flavor combobox (R3) */
export async function searchConfirmedTags(
  hubId: string,
  query: string,
  excludeTagIds: string[]
): Promise<{ id: string; name: string; description: string }[]> {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('hub_tags' as never) as any)
    .select('id, name, description')
    .eq('hub_id', hubId)
    .eq('is_confirmed', true)
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })
    .limit(20)

  return ((data as any[]) || [])
    .filter((t: any) => !excludeTagIds.includes(t.id))
    .slice(0, 8)
}

/** Attach an existing confirmed hub flavor to a publication (R3) */
export async function addPublicationTag(
  publicationId: string,
  tagId: string
): Promise<void> {
  const supabase = await createClient()
  // Upsert to handle any race-condition duplicates gracefully
  const { error } = await supabase
    .from('publication_hub_tags' as never)
    .upsert(
      { publication_id: publicationId, tag_id: tagId, is_suppressed: false } as never,
      { onConflict: 'publication_id,tag_id', ignoreDuplicates: false }
    )
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function setPublicationTagSuppression(linkIds: string[], is_suppressed: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('publication_hub_tags' as never)
    .update({ is_suppressed } as never)
    .in('id', linkIds)
    
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

/**
 * RSSHUB INTEGRATION
 */

export async function createRouteRequest(hubId: string | null, targetUrl: string, instructions?: string, accessNotes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('route_requests' as never)
    .insert({
      requested_by: user.id,
      requested_by_hub_id: hubId,
      target_url: targetUrl,
      instructions: instructions || null,
      access_notes: accessNotes || null,
      status: 'pending'
    } as never)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getRouteRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('route_requests' as never)
    .select('*')
    .eq('requested_by', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching route requests:', error)
    return []
  }

  return data || []
}

/**
 * SOURCE FILTER RULES
 */
export async function getSourceRules(sourceId: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('source_filter_rules' as never).select('*').eq('source_id', sourceId).order('created_at', { ascending: false })
  return data || []
}

export async function addSourceRule(sourceId: string, rule_type: 'blocklist' | 'allowlist', value: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('source_filter_rules' as never).insert({
    source_id: sourceId,
    rule_type,
    match_mode: 'keywords',
    value
  } as never)
  if (error) throw new Error(error.message)
}

export async function toggleSourceRule(ruleId: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('source_filter_rules' as never).update({ is_active } as never).eq('id', ruleId)
  if (error) throw new Error(error.message)
}

export async function deleteSourceRule(ruleId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('source_filter_rules' as never).delete().eq('id', ruleId)
  if (error) throw new Error(error.message)
}

export async function executePurge(hubId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('publications' as never).update({ status: 'purged' } as never).eq('hub_id', hubId).eq('status', 'auto_purge_tagged')
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function searchRSSHubRoutesAction(searchTerm: string) {
  // Dynamic import to avoid module issues edge vs server
  const { findRSSHubRoutes } = await import('@/utils/sourcing/rsshub')
  return await findRSSHubRoutes(searchTerm)
}

export async function previewRSSHubRouteAction(routePath: string) {
  const { RSSHUB_BASE_URL } = await import('@/utils/sourcing/rsshub')
  const origin = RSSHUB_BASE_URL.replace(/\/$/, "");
  const base = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const url = `${origin}${base}`;
  
  const res = await fetch(`${url}${url.includes('?') ? '&' : '?'}format=json`, { cache: 'no-store' })
  if (!res.ok) throw new Error("Could not load preview")
  return await res.json()
}

/**
 * CURATOR PROMOTIONS
 */

export interface HubPromotion {
  id: string
  hub_id: string
  created_by: string
  type: 'announcement' | 'promotion' | 'commercial' | 'campaign'
  title: string
  body?: string
  links?: { label: string; url: string }[]
  campaign_code?: string
  start_date?: string
  end_date?: string
  frequency_hours: number
  is_active: boolean
  allow_suppress: boolean
  created_at: string
  updated_at: string
}

export async function getHubPromotions(hubId: string): Promise<HubPromotion[]> {
  const supabase = await createClient()
  const { data, error } = await (supabase.from('hub_promotions' as never) as any)
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return data || []
}

export async function createHubPromotion(hubId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const linksRaw = formData.get('links') as string
  let links: { label: string; url: string }[] = []
  try { links = JSON.parse(linksRaw || '[]') } catch { links = [] }

  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const { error } = await (supabase.from('hub_promotions' as never) as any).insert({
    hub_id: hubId,
    created_by: user.id,
    type: formData.get('type') as string,
    title: formData.get('title') as string,
    body: formData.get('body') as string || null,
    links,
    campaign_code: formData.get('campaign_code') as string || null,
    start_date: start_date || null,
    end_date: end_date || null,
    frequency_hours: parseInt(formData.get('frequency_hours') as string) || 24,
    is_active: true,
    allow_suppress: formData.get('allow_suppress') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function updateHubPromotion(id: string, formData: FormData) {
  const supabase = await createClient()
  const linksRaw = formData.get('links') as string
  let links: { label: string; url: string }[] = []
  try { links = JSON.parse(linksRaw || '[]') } catch { links = [] }

  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  const { error } = await (supabase.from('hub_promotions' as never) as any)
    .update({
      type: formData.get('type') as string,
      title: formData.get('title') as string,
      body: formData.get('body') as string || null,
      links,
      campaign_code: formData.get('campaign_code') as string || null,
      start_date: start_date || null,
      end_date: end_date || null,
      frequency_hours: parseInt(formData.get('frequency_hours') as string) || 24,
      allow_suppress: formData.get('allow_suppress') === 'true',
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function toggleHubPromotion(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await (supabase.from('hub_promotions' as never) as any)
    .update({ is_active })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function deleteHubPromotion(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('hub_promotions' as never) as any)
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function purgePublications(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('publications' as never)
    .update({ status: 'purged' } as never)
    .in('id', ids)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
