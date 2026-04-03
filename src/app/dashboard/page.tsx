import { getHubs, Hub } from './actions'
import { logout } from '@/app/login/actions'
import styles from './dashboard.module.css'
import CreateHubForm from '@/components/dashboard/CreateHubForm'
import { createClient } from '@/utils/supabase/server'
import SourceList from '@/components/dashboard/SourceList'
import IntelligenceFeed from '@/components/dashboard/IntelligenceFeed'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import AddSourceForm from '@/components/dashboard/AddSourceForm'


export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const hubs = await getHubs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

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
            <h1 className={styles.headerTitle}>XENTARA HUBS</h1>
            {user && (
              <p className={styles.headerUser}>{user.email}</p>
            )}
          </div>
        </div>
        <div className={styles.headerRight}>
           <ThemeToggle />
           <form action={logout}>
             <button type="submit" className={styles.logoutBtn}>
               LOG OUT
             </button>
           </form>
        </div>
      </div>

      <div className={styles.contentWrapper}>
        {/* ADD NEW HUB AREA (PRIORITIZED AT THE TOP) */}
        <section className={styles.sectionArea}>
             <h2 className={styles.sectionTitle}>Structure New Intelligence Hub</h2>
             <div className={styles.formWrapper}>
                <CreateHubForm />
             </div>
        </section>

        {/* ACTIVE HUB GRID */}
        <main>
          <div className={styles.mainHeader}>
             <h2 className={styles.mainTitle}>Active Collectives</h2>
             <p className={styles.mainSubtitle}>Monitoring {hubs.length} active communities.</p>
          </div>

          <div className={styles.hubGrid}>
            {hubs.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateText}>Intelligence network is currently empty. Initialize a Hub above.</p>
              </div>
            ) : (
              hubs.map((hub: Hub) => (
                <div key={hub.id} className={styles.hubCard}>
                  <header className={styles.hubCardHeader}>
                    <div className={styles.hubCardTitleRow}>
                      <h3 className={styles.hubCardTitle}>{hub.name}</h3>
                      <div className={styles.hubCardRef}>REF: {hub.id.slice(0, 8)}</div>
                    </div>
                    <p className={styles.hubCardSlug}>/communities/{hub.slug}</p>
                  </header>
                  
                  {/* ADD SOURCE FORM (RESTORED) */}
                  <AddSourceForm hubId={hub.id} />

                  {/* SOURCE LIST & FEED */}
                  <div className={styles.hubCardContent}>
                    <SourceList hubId={hub.id} />
                    <IntelligenceFeed hubId={hub.id} searchParams={params} />
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
