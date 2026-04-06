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
  return (
    <article className="feed-card">
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

      {pub.curator_commentary && (
        <div className="feed-card-commentary">
          <p className="feed-card-commentary-label">Curator Insight</p>
          <p className="feed-card-commentary-text">{pub.curator_commentary}</p>
        </div>
      )}

      {pub.tags?.length > 0 && (
        <div className="feed-card-tags">
          {pub.tags.slice(0, 6).map(tag => (
            <span key={tag} className="feed-card-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="feed-card-footer">
        <a
          href={pub.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="feed-card-link"
        >
          Original Source ↗
        </a>
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
  )
}
