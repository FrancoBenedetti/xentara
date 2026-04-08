'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface SubscribeButtonProps {
  hubSlug: string
  hubId: string
  apiBase: string
}

export default function SubscribeButton({ hubSlug, hubId, apiBase }: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkState = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      if (user) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch(`${apiBase}/api/v1/consumers/me/subscriptions`, {
            headers: { Authorization: `Bearer ${session?.access_token}` },
          })
          if (res.ok) {
            const data = await res.json()
            const subs = data.subscriptions ?? []
            setSubscribed(subs.some((s: { hub_id: string }) => s.hub_id === hubId))
          }
        } catch { /* ignore */ }
      }
      setLoading(false)
    }
    checkState()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async () => {
    setToggling(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const method = subscribed ? 'DELETE' : 'POST'
      const res = await fetch(`${apiBase}/api/v1/hubs/${hubSlug}/subscribe`, {
        method,
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok || res.status === 409) {
        setSubscribed(!subscribed)
      }
    } catch { /* ignore */ } finally {
      setToggling(false)
    }
  }

  if (loading) return null

  if (!userId) {
    return (
      <a href="/auth" className="btn btn-ghost subscribe-btn">
        Sign in to subscribe
      </a>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={toggling}
      className={`btn subscribe-btn ${subscribed ? 'btn-subscribed' : 'btn-subscribe'}`}
    >
      {toggling ? '...' : subscribed ? '✓ Subscribed' : '+ Subscribe'}
    </button>
  )
}
