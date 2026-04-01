import { getRecentPublications } from '@/app/dashboard/actions'
import ReprocessButton from './ReprocessButton'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function IntelligenceFeed({ hubId, searchParams }: { hubId: string, searchParams: any }) {
  const publications = await getRecentPublications(hubId) 

  // 1. Get visibility filters scoped to THIS HUB 
  const filterKey = `f_${hubId.slice(0, 8)}`
  const selectedSources = searchParams?.[filterKey]?.split(',').filter(Boolean) || []
  
  const filteredPublications = selectedSources.length > 0 
    ? publications.filter(p => selectedSources.includes(p.source_id))
    : publications;

  const getStatusBadge = (status: string) => {
    const commonStyles = { padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 900, border: '1px solid currentColor' }
    switch (status) {
      case 'ready':
        return <span style={{ ...commonStyles, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>READY</span>
      case 'awaiting_transcript':
        return <span style={{ ...commonStyles, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>AWAITING</span>
      case 'failed':
        return <span style={{ ...commonStyles, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>FAILED</span>
      default:
        return <span style={{ ...commonStyles, background: 'rgba(156, 163, 175, 0.1)', color: 'var(--text-muted)' }}>RAW</span>
    }
  }

  const getSentimentColor = (score: number | null) => {
    if (score === null) return 'var(--text-muted)';
    if (score > 0.3) return '#10b981';
    if (score < -0.3) return '#ef4444';
    return '#f59e0b';
  }

  const readyCount = filteredPublications.filter(p => p.status === 'ready').length;

  return (
    <div style={{ marginTop: '0.5rem', borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Intelligence Feed {selectedSources.length > 0 && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(FILTERED)</span>}
        </h4>
        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900 }}>
          <span style={{ color: '#10b981' }}>{readyCount} ACTIVE</span>
        </div>
      </div>

      {filteredPublications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-surface)', borderRadius: '0.5rem', border: '2px dashed var(--border)' }}>
           <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Hub is quiet for current filters.</p>
           <a href={`/dashboard`} style={{ color: 'var(--indigo)', fontSize: '0.65rem', fontWeight: 900, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem', textTransform: 'uppercase' }}>Reset Hub Filters</a>
        </div>
      ) : (
        <div className={styles.feedScrollArea} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPublications.map((pub: any) => (
            <div key={pub.id} style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', position: 'relative' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                 <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {pub.monitored_sources?.name || 'MEDIA ITEM'}
                 </div>
                 {getStatusBadge(pub.status)}
              </div>

              <div style={{ fontWeight: 900, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                {pub.title}
              </div>

              {pub.byline && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5, fontWeight: 600, borderLeft: '3px solid var(--indigo)', paddingLeft: '0.75rem' }}>
                   {pub.byline}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {pub.tags?.slice(0, 5).map((tag: string) => (
                    <span key={tag} style={{ fontSize: '0.6rem', color: 'var(--indigo)', background: 'var(--indigo-soft)', border: '1px solid var(--indigo)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900 }}>
                      #{tag.toUpperCase()}
                    </span>
                  ))}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                   {pub.sentiment_score !== null && (
                      <span style={{ display: 'block', height: '8px', width: '8px', borderRadius: '50%', background: getSentimentColor(pub.sentiment_score), boxShadow: `0 0 10px ${getSentimentColor(pub.sentiment_score)}44` }}></span>
                   )}
                   <ReprocessButton id={pub.id} url={pub.source_url} />
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
                <a href={pub.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
