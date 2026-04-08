import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

type Params = { params: Promise<{ id: string }> }

/**
 * DELETE /api/v1/identity/:id
 * Unlinks a messenger identity from the current user's account.
 * Sets consumer_id to NULL (returns to shadow state) rather than deleting the row.
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()

    // Verify ownership before unlinking
    const { data: identity } = await admin
      .from('messenger_identities' as never)
      .select('id, consumer_id')
      .eq('id', id)
      .single()

    if (!identity) {
      return NextResponse.json({ error: 'Identity not found' }, { status: 404 })
    }

    const identityRecord = identity as { id: string; consumer_id: string | null }

    if (identityRecord.consumer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Unlink: set consumer_id to null (returns to shadow state)
    const { error } = await admin
      .from('messenger_identities' as never)
      .update({
        consumer_id: null,
        is_verified: false,
        linked_at: null,
      } as never)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
