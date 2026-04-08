import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * POST /api/v1/identity/claim
 * Claims a link token — validates the 6-digit code, links the messenger
 * identity to the current user, and marks the token as claimed.
 *
 * For Phase 7, this doubles as the "manual admin testing endpoint" since
 * there is no bot yet. The authenticated user claims their own token.
 *
 * Body: { token: "482910" }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required.' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Find the link token
    const { data: linkToken, error: findErr } = await admin
      .from('link_tokens' as never)
      .select('id, messenger_identity_id, expires_at, claimed_by')
      .eq('token', token)
      .single()

    if (findErr || !linkToken) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 404 })
    }

    const tokenRecord = linkToken as {
      id: string
      messenger_identity_id: string
      expires_at: string
      claimed_by: string | null
    }

    // Check if already claimed
    if (tokenRecord.claimed_by) {
      return NextResponse.json({ error: 'Token has already been claimed.' }, { status: 409 })
    }

    // Check expiry
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Token has expired.' }, { status: 410 })
    }

    // Claim the token
    await admin
      .from('link_tokens' as never)
      .update({
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      } as never)
      .eq('id', tokenRecord.id)

    // Link the messenger identity to this user
    await admin
      .from('messenger_identities' as never)
      .update({
        consumer_id: user.id,
        is_verified: true,
        linked_at: new Date().toISOString(),
      } as never)
      .eq('id', tokenRecord.messenger_identity_id)

    // Fetch the updated identity for the response
    const { data: identity } = await admin
      .from('messenger_identities' as never)
      .select('id, platform, platform_username, is_verified, linked_at')
      .eq('id', tokenRecord.messenger_identity_id)
      .single()

    return NextResponse.json({ identity })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
