'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface HubSubscription {
  id: string
  hub_id: string
  hub?: {
    id: string
    name: string
    slug: string
    brand_color?: string
    strictness?: string
  }
  notification_preference: string
  subscribed_at: string
}

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

export default function SubscriptionsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState<HubSubscription[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }

      try {
        const res = await fetch(`${API_BASE}/api/v1/consumers/me/subscriptions`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setSubscriptions(data.subscriptions ?? [])
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnsubscribe = async (slug: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const res = await fetch(`${API_BASE}/api/v1/hubs/${slug}/subscribe`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        setSubscriptions(prev => prev.filter(s => s.hub?.slug !== slug))
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
            <Link href="/profile" className="nav-link">Profile</Link>
            <Link href="/" className="nav-link">Discover</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        <header className="profile-header">
          <Link href="/" className="feed-back">← Back to Hubs</Link>
          <h1 className="profile-title">My Hubs</h1>
          <p className="feed-hub-meta">
            {subscriptions.length} Subscription{subscriptions.length !== 1 ? 's' : ''}
          </p>
        </header>

        {subscriptions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p className="empty-state-title">No subscriptions yet</p>
            <p className="empty-state-text">
              Discover and subscribe to intelligence hubs to see them here.
            </p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Discover Hubs
            </Link>
          </div>
        ) : (
          <div className="subscription-list">
            {subscriptions.map(sub => (
              <div key={sub.id} className="subscription-card">
                <Link href={`/${sub.hub?.slug}`} className="subscription-info">
                  <div
                    className="subscription-accent"
                    style={{ background: sub.hub?.brand_color ?? 'var(--indigo)' }}
                  />
                  <div>
                    <h3 className="subscription-name">{sub.hub?.name ?? 'Unknown Hub'}</h3>
                    <p className="subscription-meta">
                      {sub.hub?.strictness === 'strict' ? '🎯 Strict' : '🔭 Exploratory'}
                      {' · '}
                      Subscribed {new Date(sub.subscribed_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => sub.hub?.slug && handleUnsubscribe(sub.hub.slug)}
                  className="btn btn-danger btn-sm"
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
