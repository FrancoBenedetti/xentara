'use client'

import { useState, useEffect } from 'react'
import type { Publication } from '@xentara/api-client'

function getSentimentColor(score: number | null | undefined) {
  if (score == null) return 'var(--text-subtle)'
  if (score > 0.3) return 'var(--green)'
  if (score < -0.3) return 'var(--red)'
  return 'var(--amber)'
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function FeedCard({ pub }: { pub: Publication }) {
  const [isOpen, setIsOpen] = useState(false)

  // Handle Esc to close
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    // Prevent body scroll when open
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <>
      <article className="feed-card" onClick={() => setIsOpen(true)} style={{ cursor: 'pointer' }}>
        <div className="feed-card-meta">
          <span className="feed-card-source">
            {pub.monitored_sources?.name ?? 'Source'}
          </span>
          <span className="feed-card-date">{formatDate(pub.curator_published_at)}</span>
        </div>

        <h2 className="feed-card-title">{pub.title}</h2>

        {pub.byline && (
          <p className="feed-card-byline">{pub.byline}</p>
        )}

        <div className="feed-card-footer">
          <span className="feed-card-link">View Analysis →</span>
          {pub.sentiment_score != null && (
            <span
              className="feed-card-sentiment"
              style={{
                background: getSentimentColor(pub.sentiment_score),
                boxShadow: `0 0 8px ${getSentimentColor(pub.sentiment_score)}88`
              }}
              title={`Sentiment: ${pub.sentiment_score.toFixed(2)}`}
            />
          )}
        </div>
      </article>

      {isOpen && (
        <div className="detail-overlay" onClick={() => setIsOpen(false)}>
          <div className="detail-content" onClick={e => e.stopPropagation()}>
            <button className="detail-close" onClick={() => setIsOpen(false)}>✕</button>
            
            <header className="detail-header">
              <p className="detail-meta">
                {pub.monitored_sources?.name} · {formatDate(pub.curator_published_at)}
              </p>
              <h2 className="detail-title">{pub.title}</h2>
            </header>

            <div className="detail-section">
              <label className="detail-label">AI Compilation</label>
              <div className="detail-summary">
                {pub.summary || "Summary pending analysis..."}
              </div>
            </div>

            {pub.curator_commentary && (
              <div className="detail-section">
                <label className="detail-label">Curator Perspective</label>
                <div className="detail-commentary">
                  <p className="detail-commentary-text">
                    &quot;{pub.curator_commentary}&quot;
                  </p>
                </div>
              </div>
            )}

            <footer className="detail-footer">
              <a 
                href={pub.source_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                Read Original Article ↗
              </a>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
