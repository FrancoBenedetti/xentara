import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  const headerList = await headers()
  
  // Check for Authorization: Bearer <token>
  const authHeader = headerList.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your Vercel project settings."
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
