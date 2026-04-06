import { createServerClient } from '@supabase/ssr'

/**
 * Service-role client for server-side public API routes.
 * Uses @supabase/ssr (no realtime/WebSocket) — safe in Next.js route handlers.
 * NEVER expose this client or its key to the browser.
 * RLS is bypassed — only select non-sensitive, public-facing columns.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase admin environment variables are not configured.')
  }

  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
