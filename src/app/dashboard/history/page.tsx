import { getHubs, getPublicationHistory, getConfirmedTagNames } from '../actions'
import PublicationsExplorer from '@/components/dashboard/PublicationsExplorer'
import styles from '../dashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function HistoryPage({
  searchParams
}: {
  searchParams: Promise<{ 
    hub?: string; 
    q?: string; 
    flavor?: string; 
    from?: string; 
    to?: string; 
    sort?: string 
  }>
}) {
  const hubs = await getHubs()
  if (hubs.length === 0) {
    return (
      <div className={styles.historyPage}>
        <header className={styles.historyHeader}>
          <h1 className={styles.historyTitle}>PUBLICATION HISTORY</h1>
          <p className={styles.historySubtitle}>Archived intelligence curated by your team.</p>
        </header>
        <div className={styles.historyEmpty}>
          <p className={styles.historyEmptyText}>No hubs found. Curate content in the feed to build your history.</p>
        </div>
      </div>
    )
  }

  const resolvedSearchParams = await searchParams
  const selectedHubId = resolvedSearchParams.hub || hubs[0].id
  
  // Initial fetch based on URL params
  const initialPublications = await getPublicationHistory(selectedHubId, 0, {
    search: resolvedSearchParams.q,
    flavor: resolvedSearchParams.flavor,
    dateFrom: resolvedSearchParams.from,
    dateTo: resolvedSearchParams.to,
    sortAsc: resolvedSearchParams.sort === 'asc'
  })

  // Fetch all confirmed flavors (tags) from all hubs for the filter
  // In a large system, we might only fetch for the active hub, but this is fine for now
  const allFlavorsResults = await Promise.all(hubs.map(h => getConfirmedTagNames(h.id)))
  const uniqueFlavors = Array.from(new Set(allFlavorsResults.flat().map(t => t.name))).sort()

  return (
    <div className={styles.historyPage}>
      <header className={styles.historyHeader}>
        <h1 className={styles.historyTitle}>PUBLICATION HISTORY</h1>
        <p className={styles.historySubtitle}>Archived intelligence curated by your team.</p>
      </header>

      <PublicationsExplorer 
        hubs={hubs}
        initialPublications={initialPublications}
        initialHubId={selectedHubId}
        flavors={uniqueFlavors}
      />
    </div>
  )
}
