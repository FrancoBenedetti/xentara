'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Nav() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="nav-brand">Xentara</Link>
        <div className="nav-actions">
          {user ? (
            <>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {user.email}
              </span>
              <button onClick={handleSignOut} className="btn btn-danger">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="btn btn-primary">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
