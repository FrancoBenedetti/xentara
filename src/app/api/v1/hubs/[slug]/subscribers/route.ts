import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ slug: string }> }

/**
 * GET /api/v1/hubs/:slug/subscribers
 * Returns anonymized subscriber count only. Public endpoint.
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const admin = createAdminClient()

    // Resolve hub by slug
    const { data: hub } = await admin
      .from('hubs' as never)
      .select('id')
      .eq('slug', slug)
      .single()

    if (!hub) return NextResponse.json({ error: 'Hub not found' }, { status: 404 })

    const hubRecord = hub as { id: string }

    // Get count via service role (bypasses RLS)
    const { count, error } = await admin
      .from('hub_subscriptions' as never)
      .select('*', { count: 'exact', head: true })
      .eq('hub_id', hubRecord.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
