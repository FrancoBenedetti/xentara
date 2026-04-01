'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'

export async function createHub(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = formData.get('slug') as string

  // Simple validation
  if (!name || !slug) {
    throw new Error('Name and Slug are required')
  }

  // Auth session check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Not authenticated')
  }

  // Insert hub
  const { error } = await supabase.from('hubs').insert({
    name,
    slug,
    owner_id: user.id
  })

  if (error) {
    console.error('Error creating hub:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function addSource(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual'
  const hubId = formData.get('hubId') as string

  // Simple validation
  if (!name || !url || !hubId) {
    throw new Error('Name, URL, and Hub are required')
  }

  // 1. DUPLICATE CHECK
  const { data: existing } = await supabase
    .from('monitored_sources')
    .select('id')
    .eq('hub_id', hubId)
    .eq('url', url)
    .single()

  if (existing) {
    throw new Error('This source is already added to this hub')
  }

  // 2. INSERT (Explicitly active)
  const { data: source, error } = await supabase.from('monitored_sources').insert({
    name,
    url,
    type,
    hub_id: hubId,
    is_active: true
  }).select().single()

  if (error) {
    console.error('Error adding source:', error)
    throw new Error(error.message)
  }

  // TRIGGER INITIAL DISCOVERY!
  await inngest.send({
    name: "xentara/source.added",
    data: {
      sourceId: source.id,
      url: url,
      type: type
    }
  })

  revalidatePath('/dashboard')
}


export async function deleteSource(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('monitored_sources')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting source:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function updateSource(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as 'youtube' | 'rss' | 'rumble' | 'twitter' | 'manual'

  if (!name || !url) {
    throw new Error('Name and URL are required')
  }

  const { error } = await supabase
    .from('monitored_sources')
    .update({ name, url, type })
    .eq('id', id)

  if (error) {
    console.error('Error updating source:', error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function refreshSource(id: string, url: string, type: string) {
  await inngest.send({
    name: "xentara/source.added",
    data: {
      sourceId: id,
      url: url,
      type: type
    }
  })
}



export async function getSources(hubId: string) {
  const supabase = await createClient()

  const { data: sources, error } = await supabase
    .from('monitored_sources')
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching sources:', error)
    return []
  }

  return sources || []
}

export async function getHubs() {
  const supabase = await createClient()

  const { data: hubs, error } = await supabase
    .from('hubs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching hubs:', error)
    return []
  }

  return hubs || []
}

export async function getRecentPublications(hubId: string, limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('publications')
    .select('*, monitored_sources(name)')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching publications:', error)
    return []
  }

  return data || []
}

export async function reprocessPublication(id: string, url: string) {
  const supabase = await createClient()

  // 1. Reset status
  await supabase
    .from('publications')
    .update({ status: 'raw' })
    .eq('id', id)

  // 2. Re-send Inngest event
  await inngest.send({
    name: "xentara/publication.detected",
    data: {
      publicationId: id,
      sourceUrl: url
    }
  })

  revalidatePath('/dashboard')
}

