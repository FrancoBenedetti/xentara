import { getRecentPublications, Publication } from '@/app/dashboard/actions'
import PublicationCard from './PublicationCard'
import styles from '@/app/dashboard/dashboard.module.css'

export default async function IntelligenceFeed({ hubId, searchParams }: { hubId: string, searchParams: any }) {
  const publications = await getRecentPublications(hubId) 

  // 1. Get visibility filters scoped to THIS HUB 
  const filterKey = `f_${hubId.slice(0, 8)}`
  const selectedSources = searchParams?.[filterKey]?.split(',').filter(Boolean) || []
  
  const filteredPublications = selectedSources.length > 0 
    ? publications.filter(p => selectedSources.includes(p.source_id))
    : publications;

  const readyCount = filteredPublications.filter(p => p.status === 'ready').length;

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <h4 className={styles.feedTitle}>
          Intelligence Feed {selectedSources.length > 0 && <span className={styles.feedFilterBadge}>(FILTERED)</span>}
        </h4>
        <div className={styles.feedMeta}>
          <span className={styles.feedStatusActive}>{readyCount} ACTIVE</span>
        </div>
      </div>

      {filteredPublications.length === 0 ? (
        <div className={styles.feedEmpty}>
           <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>Hub is quiet for current filters.</p>
           <a href={`/dashboard`} className={styles.feedEmptyLink}>Reset Hub Filters</a>
        </div>
      ) : (
        <div className={styles.feedScrollArea} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredPublications.map((pub: Publication) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      )}
    </div>
  )
}
