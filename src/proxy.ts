import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/inngest')) {
    return NextResponse.next()
  }
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/inngest        (Inngest webhook — no session needed)
     * - api/v1/*           (Public Headless Hub API — uses service role key)
     * - _next/static       (static assets)
     * - _next/image        (image optimisation)
     * - favicon.ico / image extensions
     */
    '/((?!api/inngest|api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
