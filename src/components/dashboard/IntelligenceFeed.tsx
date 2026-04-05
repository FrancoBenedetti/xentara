import { getRecentPublications, Publication } from '@/app/dashboard/actions'
import PublicationCard from './PublicationCard'
import styles from '@/app/dashboard/dashboard.module.css'

interface IntelligenceFeedProps {
  hubId: string
  sourceId?: string
}

export default async function IntelligenceFeed({ hubId, sourceId }: IntelligenceFeedProps) {
  const publications = await getRecentPublications(hubId, sourceId) 

  const readyCount = publications.filter(p => p.status === 'ready').length;

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <h4 className={styles.feedTitle}>
          {sourceId ? 'Source Intelligence' : 'Unified Collective Feed'}
          {sourceId && <span className={styles.feedFilterBadge}> (FILTERED)</span>}
        </h4>
        <div className={styles.feedMeta}>
          <span className={styles.feedStatusActive}>{readyCount} READY</span>
        </div>
      </div>

      {publications.length === 0 ? (
        <div className={styles.feedEmpty}>
           <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>Channel is currently silent.</p>
           <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--indigo)', marginTop: '0.25rem' }}>Synapse activity pending...</p>
        </div>
      ) : (
        <div className={styles.feedScrollArea} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {publications.map((pub: Publication) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      )}
    </div>
  )
}
