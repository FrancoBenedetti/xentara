import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url || !key) {
    throw new Error('Supabase Service parameters missing in environment')
  }

  return createClient<Database>(url, key)
}
