'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getHubChannels(hubId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hub_channels')
    .select('*')
    .eq('hub_id', hubId)
    .order('created_at', { ascending: false })
  
  return data || []
}

export async function addHubChannel(hubId: string, formData: FormData) {
  const supabase = await createClient()
  
  const platform = formData.get('platform') as string
  const channel_id = formData.get('channel_id') as string
  const channel_name = formData.get('channel_name') as string

  const { data: user } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('hub_channels')
    .insert({
      hub_id: hubId,
      platform,
      channel_id,
      channel_name,
      is_active: true,
      added_by: user.user?.id
    })
    
  if (error) throw new Error(error.message)
  
  revalidatePath(`/dashboard/settings`)
  revalidatePath(`/dashboard/hubs/[slug]/settings`, 'page')
}

export async function toggleHubChannel(id: string, isActive: boolean) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('hub_channels')
    .update({ is_active: isActive })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath(`/dashboard/settings`)
  revalidatePath(`/dashboard/hubs/[slug]/settings`, 'page')
}

export async function deleteHubChannel(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('hub_channels')
    .delete()
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath(`/dashboard/settings`)
  revalidatePath(`/dashboard/hubs/[slug]/settings`, 'page')
}

export async function getDistributionLogs(hubId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('distribution_log')
    .select(`
      *,
      publication:publications!inner ( title, hub_id ),
      channel:hub_channels ( channel_name )
    `)
    .eq('publication.hub_id', hubId)
    .order('created_at', { ascending: false })
    .limit(50)
  
  return data || []
}
