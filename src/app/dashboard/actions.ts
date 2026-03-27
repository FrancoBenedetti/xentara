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

  // Insert source
  const { data: source, error } = await supabase.from('monitored_sources').insert({
    name,
    url,
    type,
    hub_id: hubId
  }).select().single()

  if (error) {
    console.error('Error adding source:', error)
    throw new Error(error.message)
  }

  // Create a pending publication to start the pipeline
  const { data: publication, error: pubError } = await supabase.from('publications').insert({
    hub_id: hubId,
    source_id: source.id,
    title: `Initial Scan: ${name}`,
    status: 'raw',
    source_url: url
  }).select().single()

  if (pubError) {
    console.error('Error creating initial publication:', pubError)
  } else {
    // TRIGGER THE INNGEST PIPELINE!
    await inngest.send({
      name: "xentara/publication.detected",
      data: {
        publicationId: publication.id,
        hubId: hubId,
        sourceUrl: url
      }
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
