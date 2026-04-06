import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

const PAGE_SIZE = 20

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') ?? '0', 10)
    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const supabase = createAdminClient()

    // Resolve slug → hub_id
    const { data: hub, error: hubError } = await supabase
      .from('hubs' as never)
      .select('id')
      .eq('slug', slug)
      .single()

    if (hubError || !hub) {
      return NextResponse.json({ error: 'Hub not found' }, { status: 404 })
    }

    const { data: publications, error } = await supabase
      .from('publications')
      .select('id, hub_id, title, byline, summary, curator_commentary, tags, sentiment_score, source_url, curator_published_at, monitored_sources(name)')
      .eq('hub_id', (hub as { id: string }).id)
      .eq('is_published', true)
      .order('curator_published_at', { ascending: false })
      .range(from, to)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      publications: publications ?? [],
      page,
      hasMore: (publications?.length ?? 0) === PAGE_SIZE,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
