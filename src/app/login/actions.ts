'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getURL } from '@/utils/url'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      return error.message
    }
  } catch (err: unknown) {
    // If it's a redirect error, re-throw it so Next.js handles it
    if (err && typeof err === 'object' && 'digest' in err && (err.digest as string).startsWith('NEXT_REDIRECT')) {
      throw err
    }
    return err instanceof Error ? err.message : 'An unknown error occurred'
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signUp({
      ...data,
      options: {
        emailRedirectTo: `${getURL()}/auth/callback`,
      },
    })

    if (error) {
      return error.message
    }
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'digest' in err && (err.digest as string).startsWith('NEXT_REDIRECT')) {
      throw err
    }
    return err instanceof Error ? err.message : 'An unknown error occurred'
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
