'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
