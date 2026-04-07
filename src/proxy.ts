import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Explicitly bypass public API routes and internal assets
  if (
    pathname.startsWith('/api/inngest') ||
    pathname.startsWith('/api/v1') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 2. Run session management for all other routes
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all routes except files (assets with extensions)
     * This ensures the proxy runs for all pages but doesn't block API routing
     */
    '/((?!.*\\..*$).*)',
    '/api/v1/:path*',
  ],
}
