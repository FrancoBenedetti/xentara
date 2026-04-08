import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * GET /api/v1/consumers/me
 * Returns the current user's consumer profile (lazy-creates if missing).
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Try to fetch existing consumer profile
    let { data: profile } = await admin
      .from('consumer_profiles' as never)
      .select('*')
      .eq('id', user.id)
      .single()

    // Lazy-create if it doesn't exist
    if (!profile) {
      const { data: created, error: createErr } = await admin
        .from('consumer_profiles' as never)
        .insert({ id: user.id } as never)
        .select()
        .single()

      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
      profile = created
    }

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/v1/consumers/me
 * Updates the current user's consumer profile.
 * Allowed fields: display_alias, is_anonymous, preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const allowed = ['display_alias', 'is_anonymous', 'preferences']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: profile, error } = await admin
      .from('consumer_profiles' as never)
      .update(updates as never)
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
