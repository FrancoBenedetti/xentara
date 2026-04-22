import { redirect } from 'next/navigation'
import { getPlatformPromotions, getUserProfile } from '@/app/dashboard/actions'
import PlatformPromotionsManager from '@/components/dashboard/PlatformPromotionsManager'
import styles from '@/app/dashboard/dashboard.module.css'
import { createClient } from '@/utils/supabase/server'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import { logout } from '@/app/login/actions'

export const dynamic = 'force-dynamic'

export default async function PlatformPromotionsPage() {
  // Gate: only staff can access this page
  const profile = await getUserProfile()
  if (!profile?.is_staff) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const promotions = await getPlatformPromotions()

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className={styles.headerTitle}>PLATFORM PROMOTIONS</h1>
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
        {/* Staff-only warning banner */}
        <div style={{
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '0.75rem',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#6366f1', letterSpacing: '0.08em' }}>
            🔒 XENTARA STAFF ONLY
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Platform promotions are injected into all reader feeds at the configured frequency. Signup CTAs are only shown to unauthenticated visitors.
          </span>
        </div>

        <div className={styles.taxonomyStudio}>
          <header style={{ marginBottom: '1.75rem' }}>
            <h2 className={styles.mainTitle}>Platform Promotions</h2>
            <p className={styles.mainSubtitle}>
              Manage Xentara-wide CTAs, announcements and campaigns injected into hub reader streams.
            </p>
          </header>

          <PlatformPromotionsManager initialPromotions={promotions} />
        </div>
      </div>
    </div>
  )
}
