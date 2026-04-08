import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ slug: string }> }

/**
 * POST /api/v1/hubs/:slug/subscribe
 * Subscribe the current user to a hub.
 */
export async function POST(_request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Resolve hub by slug
    const { data: hub } = await admin
      .from('hubs' as never)
      .select('id')
      .eq('slug', slug)
      .single()

    if (!hub) return NextResponse.json({ error: 'Hub not found' }, { status: 404 })

    const hubRecord = hub as { id: string }

    // Ensure consumer profile exists (lazy-create)
    const { data: existingProfile } = await admin
      .from('consumer_profiles' as never)
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await admin
        .from('consumer_profiles' as never)
        .insert({ id: user.id } as never)
    }

    // Create subscription
    const { data: subscription, error } = await admin
      .from('hub_subscriptions' as never)
      .insert({ consumer_id: user.id, hub_id: hubRecord.id } as never)
      .select('id, hub_id, notification_preference, subscribed_at')
      .single()

    if (error) {
      // Handle duplicate subscription gracefully
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Already subscribed' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ subscription }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/hubs/:slug/subscribe
 * Unsubscribe the current user from a hub.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Resolve hub by slug
    const { data: hub } = await admin
      .from('hubs' as never)
      .select('id')
      .eq('slug', slug)
      .single()

    if (!hub) return NextResponse.json({ error: 'Hub not found' }, { status: 404 })

    const hubRecord = hub as { id: string }

    const { error } = await admin
      .from('hub_subscriptions' as never)
      .delete()
      .eq('consumer_id', user.id)
      .eq('hub_id', hubRecord.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
