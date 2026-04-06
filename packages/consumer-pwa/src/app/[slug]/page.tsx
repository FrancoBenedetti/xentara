import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getHubBySlug, getPublishedFeed } from '@xentara/api-client'
import Nav from '@/components/Nav'
import FeedCard from '@/components/FeedCard'

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

  return (
    <>
      <Nav />
      <main className="container">
        <header className="feed-header">
          <Link href="/" className="feed-back">← All Hubs</Link>
          <h1 className="feed-hub-name">{hub.name}</h1>
          <p className="feed-hub-meta">
            {publications.length} Published{publications.length !== 1 ? ' Items' : ' Item'}
            {hub.strictness && ` · ${hub.strictness === 'strict' ? '🎯 Strict Mode' : '🔭 Exploratory'}`}
          </p>
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
