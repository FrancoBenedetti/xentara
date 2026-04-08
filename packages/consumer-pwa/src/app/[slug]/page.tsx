import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHubBySlug, getPublishedFeed } from '@xentara/api-client'
import Nav from '@/components/Nav'
import FeedCard from '@/components/FeedCard'
import SubscribeButton from '@/components/SubscribeButton'

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const hub = await getHubBySlug(API_BASE, slug)
  if (!hub) return { title: 'Hub Not Found' }
  return {
    title: `${hub.name} — Intelligence Feed`,
    description: `Curated intelligence from the ${hub.name} collective.`,
  }
}

export default async function HubFeedPage({ params }: Props) {
  const { slug } = await params

  const [hub, feedData] = await Promise.all([
    getHubBySlug(API_BASE, slug),
    getPublishedFeed(API_BASE, slug, 0),
  ])

  if (!hub) notFound()

  const { publications } = feedData

  // Fetch subscriber count
  let subscriberCount = 0
  try {
    const countRes = await fetch(`${API_BASE}/api/v1/hubs/${slug}/subscribers`, {
      next: { revalidate: 60 },
    })
    if (countRes.ok) {
      const data = await countRes.json()
      subscriberCount = data.count ?? 0
    }
  } catch { /* ignore */ }

  return (
    <>
      <Nav />
      <main className="container">
        <header className="feed-header">
          <Link href="/" className="feed-back">← All Hubs</Link>
          <div className="feed-header-row">
            <div>
              <h1 className="feed-hub-name">{hub.name}</h1>
              <p className="feed-hub-meta">
                {publications.length} Published{publications.length !== 1 ? ' Items' : ' Item'}
                {hub.strictness && ` · ${hub.strictness === 'strict' ? '🎯 Strict Mode' : '🔭 Exploratory'}`}
                {subscriberCount > 0 && ` · ${subscriberCount} Subscriber${subscriberCount !== 1 ? 's' : ''}`}
              </p>
            </div>
            <SubscribeButton hubSlug={slug} hubId={hub.id} apiBase={API_BASE} />
          </div>
        </header>

        {publications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p className="empty-state-title">No published intelligence yet</p>
            <p className="empty-state-text">
              The curator hasn&apos;t published any items to this hub yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="feed-list">
            {publications.map(pub => (
              <FeedCard key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
