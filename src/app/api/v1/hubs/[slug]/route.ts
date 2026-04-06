import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createAdminClient()

    const { data: hub, error } = await supabase
      .from('hubs' as never)
      .select('id, name, slug, brand_color, logo_url, strictness')
      .eq('slug', slug)
      .single()

    if (error || !hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 })
    }

    return NextResponse.json({ hub })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
