import { getHubs, getPublicationHistory, Hub } from '../actions'
import PublicationCard from '@/components/dashboard/PublicationCard'
import styles from '../dashboard.module.css'

async function HistorySection({ hub }: { hub: Hub }) {
  const history = await getPublicationHistory(hub.id)
  if (history.length === 0) return null;

  return (
    <section key={hub.id} className={styles.historyHubSection}>
      <div className={styles.historyHubHeader}>
          <div className={styles.historyHubBadge}>{hub.name.toUpperCase()}</div>
          <div className={styles.historyHubCount}>{history.length} ITEMS ARCHIVED</div>
      </div>

      <div className={styles.historyGrid}>
        {history.map(pub => (
          <PublicationCard key={pub.id} pub={pub} />
        ))}
      </div>
    </section>
  )
}

export default async function HistoryPage() {
  const hubs = await getHubs()

  return (
    <div className={styles.historyPage}>
      <header className={styles.historyHeader}>
        <h1 className={styles.historyTitle}>PUBLICATION HISTORY</h1>
        <p className={styles.historySubtitle}>Archived intelligence curated by your team.</p>
      </header>

        {hubs.length === 0 ? (
          <div className={styles.historyEmpty}>
            <p className={styles.historyEmptyText}>No hubs found. Curate content in the feed to build your history.</p>
          </div>
        ) : (
          hubs.map((hub) => (
            <HistorySection key={hub.id} hub={hub} />
          ))
        )}
    </div>
  )
}
