import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/session'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle CORS for /api/v1
  if (pathname.startsWith('/api/v1')) {
    const origin = request.headers.get('origin')
    // In production, you'd restrict this. On localhost, we allow it.
    const isAllowedOrigin = origin && (
      origin.includes('localhost:3001') || 
      origin.includes('vercel.app') // Allow xentara-pwa.vercel.app etc
    )

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    const isPublicApi = pathname.startsWith('/api/inngest') || pathname.startsWith('/api/v1/webhooks')
    
    const response = isPublicApi 
      ? NextResponse.next() 
      : await updateSession(request)

    // Add CORS to the actual response
    if (isAllowedOrigin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    }
    
    return response
  }

  // 1. Explicitly bypass public API routes and internal assets (fallback)
  if (
    pathname.startsWith('/api/inngest') ||
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
