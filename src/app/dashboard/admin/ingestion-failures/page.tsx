import { redirect } from 'next/navigation'
import { getIngestionFailures, getUserProfile } from '@/app/dashboard/actions'
import IngestionFailuresManager from '@/components/dashboard/IngestionFailuresManager'
import styles from '@/app/dashboard/dashboard.module.css'
import { createClient } from '@/utils/supabase/server'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import { logout } from '@/app/login/actions'

export const dynamic = 'force-dynamic'

export default async function IngestionFailuresPage() {
  // Gate: only staff can access this page
  const profile = await getUserProfile()
  if (!profile?.is_staff) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const failures = await getIngestionFailures()

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className={styles.headerTitle}>INGESTION FAILURES</h1>
            {user && (
              <p className={styles.headerUser}>{user.email} · Staff</p>
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
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', letterSpacing: '0.08em' }}>
            🔒 XENTARA STAFF ONLY
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            System-wide view of all publications that failed during the ingestion and intelligence pipeline.
          </span>
        </div>

        <div className={styles.taxonomyStudio}>
          <header style={{ marginBottom: '1.75rem' }}>
            <h2 className={styles.mainTitle}>Ingestion Failures</h2>
            <p className={styles.mainSubtitle}>
              Monitor, analyze, and reprocess failed items across all hubs.
            </p>
          </header>

          <IngestionFailuresManager initialFailures={failures} />
        </div>
      </div>
    </div>
  )
}
