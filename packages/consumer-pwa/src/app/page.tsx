import type { Metadata } from 'next'
import { getPublicHubs, type Hub } from '@xentara/api-client'
import Nav from '@/components/Nav'
import HubGrid from '@/components/HubGrid'

export const metadata: Metadata = {
  title: 'Discover Intelligence Hubs',
  description: 'Explore curated intelligence collectives powered by Xentara.',
}

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

export default async function HomePage() {
  let hubs: Hub[] = []
  try {
    hubs = await getPublicHubs(API_BASE)
  } catch (err) {
    console.error('Failed to load hubs:', err)
  }

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

        <HubGrid hubs={hubs} />
      </main>
    </>
  )
}
