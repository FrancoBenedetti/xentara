'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'

/**
 * HUB MANAGEMENT
 */
export async function createHub(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/\s+/g, '-')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('hubs').insert({
    name,
    slug,
    owner_id: user.id
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}

export async function getHubs() {
  try {
    const supabase = await createClient()
    const { data: hubs, error } = await supabase
      .from('hubs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return []
    return hubs || []
  } catch (e) {
    return []
  }
}

/**
 * SOURCE MANAGEMENT
 */
export async function addSource(hubId: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as any

  const { error, data: source } = await supabase
    .from('monitored_sources')
    .insert({
      hub_id: hubId,
      name,
      url,
      type,
      is_active: true
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  if (source) {
    await inngest.send({
      name: "xentara/source.added",
      data: { sourceId: source.id, url: source.url, type: source.type }
    })
  }

  revalidatePath('/dashboard')
}

export async function getSources(hubId: string) {
  const supabase = await createClient()
  const { data: sources, error } = await supabase
    .from('monitored_sources')
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })

  return sources || []
}

export async function updateSource(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as any

  const { error } = await supabase
    .from('monitored_sources')
    .update({ name, url, type })
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
  await inngest.send({
    name: "xentara/source.added",
    data: { sourceId: id, url: url, type: type }
  })
}

/**
 * INTELLIGENCE & PUBLICATIONS
 */
export async function getRecentPublications(hubId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })
    .limit(20)

  return data || []
}

export async function updateHubBranding(id: string, formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string
  const brand_color = formData.get('brand_color') as string
  const logo_url = formData.get('logo_url') as string
  const strictness = formData.get('strictness') as string

  const { error } = await supabase
    .from('hubs')
    .update({ name, brand_color, logo_url, strictness })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')
}

/**
 * TAXONOMY MANAGEMENT
 */
export async function getHubTags(hubId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hub_tags')
    .select('*')
    .eq('hub_id', hubId)
    .order('is_confirmed', { ascending: true })
    .order('created_at', { ascending: false })

  return data || []
}

export async function updateHubStrictness(id: string, strictness: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hubs')
    .update({ strictness })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function confirmHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags')
    .update({ is_confirmed: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function updateHubTag(id: string, name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('hub_tags')
    .update({ name, description, is_confirmed: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function removeHubTag(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('hub_tags').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function addHubTag(hubId: string, name: string, description: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('hub_tags').insert({
    hub_id: hubId,
    name,
    description,
    is_confirmed: true
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/settings')
}

export async function reprocessPublication(id: string, url: string) {
  const supabase = await createClient()
  
  await supabase
    .from('publications')
    .update({ status: 'raw' })
    .eq('id', id)

  const { data: pub } = await supabase
    .from('publications')
    .select('monitored_sources(type)')
    .eq('id', id)
    .single();

  const sourceType = (pub as any)?.monitored_sources?.type || 'youtube';

  await inngest.send({
    name: "xentara/publication.detected",
    data: { 
        publicationId: id, 
        sourceUrl: url,
        type: sourceType
    }
  })

  revalidatePath('/dashboard')
}
