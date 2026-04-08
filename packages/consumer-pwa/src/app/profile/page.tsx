'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface LinkedIdentity {
  id: string
  platform: string
  platform_username?: string
  is_verified: boolean
  linked_at?: string
}

interface ConsumerProfile {
  display_alias?: string
  is_anonymous: boolean
  preferences: Record<string, unknown>
}

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<ConsumerProfile | null>(null)
  const [identities, setIdentities] = useState<LinkedIdentity[]>([])
  const [alias, setAlias] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      setEmail(session.user.email ?? '')
      const token = session.access_token

      try {
        // Fetch profile
        const profRes = await fetch(`${API_BASE}/api/v1/consumers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (profRes.ok) {
          const data = await profRes.json()
          setProfile(data.profile)
          setAlias(data.profile.display_alias ?? '')
          setIsAnonymous(data.profile.is_anonymous ?? true)
        }

        // Fetch identities
        const idRes = await fetch(`${API_BASE}/api/v1/consumers/me/identities`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (idRes.ok) {
          const data = await idRes.json()
          setIdentities(data.identities ?? [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const res = await fetch(`${API_BASE}/api/v1/consumers/me`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          display_alias: alias || null,
          is_anonymous: isAnonymous,
        }),
      })
      if (res.ok) {
        setMessage('Profile updated successfully.')
        const data = await res.json()
        setProfile(data.profile)
      }
    } catch { /* ignore */ }
    setSaving(false)
  }

  const handleUnlink = async (identityId: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    try {
      const res = await fetch(`${API_BASE}/api/v1/identity/${identityId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        setIdentities(prev => prev.filter(i => i.id !== identityId))
      }
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <>
        <nav className="nav"><div className="nav-inner"><Link href="/" className="nav-brand">Xentara</Link></div></nav>
        <main className="container"><div className="empty-state"><p className="empty-state-title">Loading...</p></div></main>
      </>
    )
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">Xentara</Link>
          <div className="nav-actions">
            <Link href="/subscriptions" className="nav-link">My Hubs</Link>
            <Link href="/" className="nav-link">Discover</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <header className="profile-header">
          <Link href="/" className="feed-back">← Back to Hubs</Link>
          <h1 className="profile-title">Your Profile</h1>
          <p className="profile-email">{email}</p>
        </header>

        {/* Profile Settings */}
        <section className="profile-section">
          <h2 className="profile-section-title">Identity</h2>
          <div className="profile-form">
            <div className="auth-field">
              <label htmlFor="alias">Display Alias</label>
              <input
                id="alias"
                type="text"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                className="auth-input"
                placeholder="How curators see you (optional)"
              />
              <p className="profile-hint">
                If set, this alias is shown instead of your email when interacting with hubs.
              </p>
            </div>

            <div className="profile-toggle-row">
              <div>
                <label className="profile-toggle-label">Anonymous Mode</label>
                <p className="profile-hint">
                  When enabled, your identity is hidden from hub curators. They only see aggregate statistics.
                </p>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`profile-toggle ${isAnonymous ? 'active' : ''}`}
              >
                {isAnonymous ? 'ON' : 'OFF'}
              </button>
            </div>

            {message && (
              <p className="profile-success">{message}</p>
            )}

            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </section>

        {/* Linked Identities */}
        <section className="profile-section">
          <h2 className="profile-section-title">Linked Accounts</h2>
          <p className="profile-section-desc">
            Link your messenger accounts to consolidate your Xentara identity across platforms.
          </p>

          {identities.length === 0 ? (
            <div className="profile-empty-identities">
              <p>No accounts linked yet.</p>
            </div>
          ) : (
            <div className="identity-list">
              {identities.map(identity => (
                <div key={identity.id} className="identity-card">
                  <div className="identity-info">
                    <span className="identity-platform">{identity.platform}</span>
                    {identity.platform_username && (
                      <span className="identity-handle">@{identity.platform_username}</span>
                    )}
                    <span className={`identity-status ${identity.is_verified ? 'verified' : ''}`}>
                      {identity.is_verified ? '✓ Verified' : 'Pending'}
                    </span>
                  </div>
                  <button onClick={() => handleUnlink(identity.id)} className="btn btn-danger btn-sm">
                    Unlink
                  </button>
                </div>
              ))}
            </div>
          )}

          <Link href="/profile/link" className="btn btn-ghost" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
            + Link a Messenger Account
          </Link>
        </section>
      </main>
    </>
  )
}
