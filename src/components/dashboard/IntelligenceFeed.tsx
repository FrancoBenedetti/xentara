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
          {filteredPublications.map((pub: Publication) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      )}
    </div>
  )
}
