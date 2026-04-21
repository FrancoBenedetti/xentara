import { getHubs } from '../actions'
import { fetchTaxonomy } from './actions'
import TaxonomyStudio from '@/components/dashboard/TaxonomyStudio'
import styles from '../dashboard.module.css'
import { createClient } from '@/utils/supabase/server'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import { logout } from '@/app/login/actions'

export const dynamic = 'force-dynamic'

export default async function TaxonomyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const hubs = await getHubs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  
  // For now, load taxonomy for the first hub
  const selectedHubId = (params.hubId as string) || hubs[0]?.id
  const taxonomy = selectedHubId ? await fetchTaxonomy(selectedHubId) : { confirmed: [], unconfirmed: [] }

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
            <h1 className={styles.headerTitle}>TAXONOMY STUDIO</h1>
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
        {hubs.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyStateText}>No hubs found. Initialize a hub to begin building your taxonomy.</p>
          </div>
        ) : (
          <TaxonomyStudio 
             key={selectedHubId}
             initialHubs={hubs.map(h => ({ id: h.id, name: h.name }))}
             initialTaxonomy={taxonomy}
             selectedHubId={selectedHubId}
          />
        )}
      </div>
    </div>
  )
}
