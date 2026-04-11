import { getHubs, getRecentPublications, getSources, Hub, Publication } from './actions'
import styles from './dashboard.module.css'
import CreateHubForm from '@/components/dashboard/CreateHubForm'
import { createClient } from '@/utils/supabase/server'
import HubSummaryCard from '@/components/dashboard/HubSummaryCard'

export default async function DashboardPage() {
  const hubs = await getHubs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Pre-fetch data for all hubs to avoid staggered loading in children
  // (Since this is a Server Component, this happens on the server)
  const hubsWithData = await Promise.all(
    hubs.map(async (hub) => {
      const [publications, sources] = await Promise.all([
        getRecentPublications(hub.id),
        getSources(hub.id)
      ])
      return {
        ...hub,
        recentPublications: publications,
        sourceCount: sources.length
      }
    })
  )

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className={styles.headerTitle}>STUDIO OVERVIEW</h1>
            {user && (
              <p className={styles.headerUser}>{user.email}</p>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
           <CreateHubForm isEmailConfirmed={!!user?.email_confirmed_at} />
        </div>
      </div>

      {user && !user.email_confirmed_at && (
        <div className={styles.authWarning}>
           <p className={styles.authWarningText}>
              <strong>Notice:</strong> Your email address is not yet confirmed. Please verify your email to enable Hub creation.
           </p>
        </div>
      )}

      <div className={styles.contentWrapper}>
        <main>
          <div className={styles.mainHeader}>
             <h2 className={styles.mainTitle}>Active Collectives</h2>
             <p className={styles.mainSubtitle}>Monitoring {hubs.length} intelligence networks.</p>
          </div>

          <div className={styles.hubGrid}>
            {hubsWithData.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateText}>Intelligence network is currently empty. Initialize a Hub above.</p>
              </div>
            ) : (
              hubsWithData.map((hub) => (
                <HubSummaryCard 
                  key={hub.id} 
                  hub={hub} 
                  recentPublications={hub.recentPublications} 
                  sourceCount={hub.sourceCount} 
                />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
