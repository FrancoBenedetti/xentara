import { NextResponse } from 'next/server'
// The client you created in Step 2
import { createClient } from '@/utils/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  let isSuccess = false;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      isSuccess = true;
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      isSuccess = true;
    }
  }

  if (isSuccess) {
    const forwardedHost = request.headers.get('x-forwarded-host') // LDAP etc.
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) {
      // we can be sure that there is no proxy between localhost and us
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
