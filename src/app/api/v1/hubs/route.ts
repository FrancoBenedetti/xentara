import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: hubs, error } = await supabase
      .from('hubs' as never)
      .select('id, name, slug, brand_color, logo_url, strictness')
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ hubs: hubs ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
