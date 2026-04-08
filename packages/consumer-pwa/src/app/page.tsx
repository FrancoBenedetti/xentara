import type { Metadata } from 'next'
import Link from 'next/link'
import { getPublicHubs, getMySubscriptions, type Hub } from '@xentara/api-client'
import { createClient } from '@/utils/supabase/server'
import Nav from '@/components/Nav'
import HubGrid from '@/components/HubGrid'

export const metadata: Metadata = {
  title: 'Xentara — Discover Intelligence Hubs',
  description: 'Explore curated intelligence collectives powered by Xentara.',
}

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let allHubs: Hub[] = []
  let myHubs: Hub[] = []

  try {
    const [hubsRes, subsRes] = await Promise.all([
      getPublicHubs(API_BASE).catch(() => []),
      session ? getMySubscriptions(API_BASE, session.access_token).catch(() => []) : Promise.resolve([]),
    ])

    allHubs = hubsRes
    if (subsRes.length > 0) {
      myHubs = subsRes.map((sub: { hub: Hub }) => sub.hub).filter(Boolean)
    }
  } catch (err) {
    console.error('Failed to load home page data:', err)
  }

  // Filter out myHubs from allHubs for the discover section
  const myHubIds = new Set(myHubs.map(h => h.id))
  const discoverHubs = allHubs.filter(h => !myHubIds.has(h.id))

  return (
    <>
      <Nav />
      <main className="container">
        <section className="landing-hero">
          <span className="landing-eyebrow">Intelligence Collectives</span>
          <h1 className="landing-title">
            Curated, not<br />aggregated.
          </h1>
          <p className="landing-subtitle">
            Every publication you see has been reviewed, refined, and approved
            by a human curator. Signal without noise.
          </p>
        </section>

        {myHubs.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 className="profile-section-title" style={{ marginBottom: 0 }}>Your Hubs</h2>
              <Link href="/subscriptions" className="feed-card-link">Manage →</Link>
            </div>
            <HubGrid hubs={myHubs} />
          </section>
        )}

        <section>
          <h2 className="profile-section-title">Discover Hubs</h2>
          {discoverHubs.length > 0 ? (
            <HubGrid hubs={discoverHubs} />
          ) : (
            <div className="empty-state" style={{ padding: '3rem 0' }}>
              <p className="empty-state-text">No new hubs to discover right now.</p>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
