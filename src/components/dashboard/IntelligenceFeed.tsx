import { getRecentPublications } from '@/app/dashboard/actions'
import ReprocessButton from './ReprocessButton'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function IntelligenceFeed({ hubId }: { hubId: string }) {
  const publications = await getRecentPublications(hubId, 25) 

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>READY</span>
      case 'awaiting_transcript':
        return <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>AWAITING</span>
      case 'failed':
        return <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>FAILED</span>
      default:
        return <span style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#9ca3af', padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>RAW</span>
    }
  }

  const getSentimentColor = (score: number | null) => {
    if (score === null) return '#4b5563';
    if (score > 0.3) return '#10b981';
    if (score < -0.3) return '#ef4444';
    return '#f59e0b';
  }

  const readyCount = publications.filter(p => p.status === 'ready').length;
  const awaitingCount = publications.filter(p => p.status === 'awaiting_transcript').length;

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Intelligence Feed
        </h4>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.6rem', color: '#6b7280', fontWeight: 800 }}>
          <span style={{ color: '#10b981' }}>{readyCount} ACTIVE</span>
          <span style={{ opacity: 0.3 }}>•</span>
          <span style={{ color: '#3b82f6' }}>{awaitingCount} AWAITING</span>
        </div>
      </div>

      {publications.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: '#4b5563', fontStyle: 'italic', padding: '1rem 0' }}>No intelligence recorded.</p>
      ) : (
        <div className={styles.feedScrollArea}>
          {publications.map((pub: any) => (
            <div key={pub.id} style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.03)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                 <div style={{ fontSize: '0.6rem', color: '#4b5563', fontWeight: 700 }}>
                   SOURCE: {pub.monitored_sources?.name || 'YOUTUBE'}
                 </div>
                 {getStatusBadge(pub.status)}
              </div>

              <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#e5e7eb', marginBottom: '0.25rem', lineHeight: 1.4 }}>
                {pub.title}
              </div>

              {pub.byline && (
                <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.5rem', lineHeight: 1.4, opacity: 0.8 }}>
                  &ldquo;{pub.byline}&rdquo;
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {pub.tags?.map((tag: string) => (
                    <span key={tag} style={{ fontSize: '0.55rem', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '0.05rem 0.3rem', borderRadius: '2px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   {pub.sentiment_score !== null && (
                      <span style={{ display: 'block', height: '6px', width: '6px', borderRadius: '50%', background: getSentimentColor(pub.sentiment_score) }}></span>
                   )}
                   <ReprocessButton id={pub.id} url={pub.source_url} />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                <a href={pub.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.55rem', color: '#4b5563', textDecoration: 'none', fontWeight: 600 }}>
                  ORIGINAL CONTENT ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
