import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Generates a cryptographically random 6-digit code.
 */
function generate6DigitCode(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String(array[0] % 1000000).padStart(6, '0')
}

/**
 * POST /api/v1/identity/link
 * Generates a 6-digit link token for a specified platform.
 * The user then provides this code to the bot on the target platform.
 *
 * Body: { platform: "telegram" | "whatsapp", platform_user_id?: string }
 *
 * If platform_user_id is provided, it will attempt to find or create
 * a messenger_identity for that platform+id pair. For Phase 7 testing,
 * the platform_user_id is required since there's no bot to auto-detect it.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { platform, platform_user_id, platform_username } = body

    if (!platform || !['telegram', 'whatsapp'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform. Must be "telegram" or "whatsapp".' }, { status: 400 })
    }

    if (!platform_user_id) {
      return NextResponse.json({ error: 'platform_user_id is required for linking.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Find or create the messenger identity
    let { data: identity } = await admin
      .from('messenger_identities' as never)
      .select('id, consumer_id')
      .eq('platform', platform)
      .eq('platform_user_id', platform_user_id)
      .single()

    if (!identity) {
      // Create a new shadow identity
      const { data: created, error: createErr } = await admin
        .from('messenger_identities' as never)
        .insert({
          platform,
          platform_user_id,
          platform_username: platform_username ?? null,
        } as never)
        .select('id, consumer_id')
        .single()

      if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 })
      identity = created
    }

    const identityRecord = identity as unknown as { id: string; consumer_id: string | null }

    // Check if already linked to someone else
    if (identityRecord.consumer_id && identityRecord.consumer_id !== user.id) {
      return NextResponse.json(
        { error: 'This messenger account is already linked to another user.' },
        { status: 409 }
      )
    }

    // Generate a 6-digit token
    const token = generate6DigitCode()

    const { error: tokenErr } = await admin
      .from('link_tokens' as never)
      .insert({
        messenger_identity_id: identityRecord.id,
        token,
      } as never)

    if (tokenErr) return NextResponse.json({ error: tokenErr.message }, { status: 500 })

    return NextResponse.json({
      token,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      platform,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
