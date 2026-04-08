import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * GET /api/v1/consumers/me/subscriptions
 * Lists all hubs the current user is subscribed to, with hub details joined.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: subscriptions, error } = await admin
      .from('hub_subscriptions' as never)
      .select('id, hub_id, notification_preference, subscribed_at, hubs(id, name, slug, brand_color, logo_url, strictness)')
      .eq('consumer_id', user.id)
      .order('subscribed_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Flatten the joined hub data for cleaner API response
    const result = (subscriptions ?? []).map((sub: Record<string, unknown>) => ({
      id: sub.id,
      hub_id: sub.hub_id,
      hub: sub.hubs ?? null,
      notification_preference: sub.notification_preference,
      subscribed_at: sub.subscribed_at,
    }))

    return NextResponse.json({ subscriptions: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
