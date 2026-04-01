import { getHubs } from './actions'
import { logout } from '@/app/login/actions'
import styles from './dashboard.module.css'
import CreateHubForm from '@/components/dashboard/CreateHubForm'
import { createClient } from '@/utils/supabase/server'
import SourceList from '@/components/dashboard/SourceList'
import IntelligenceFeed from '@/components/dashboard/IntelligenceFeed'
import ThemeToggle from '@/components/dashboard/ThemeToggle'
import AddSourceForm from '@/components/dashboard/AddSourceForm'
import { Hub } from '@/types/database'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const hubs = await getHubs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* HEADER */}
      <div className={styles.header} style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-header)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.4rem', background: 'var(--indigo-soft)', borderRadius: '0.5rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, letterSpacing: '0.05em', color: 'var(--text-main)' }}>XENTARA HUBS</h1>
            {user && (
              <p style={{ fontSize: '0.65rem', color: 'var(--indigo)', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>{user.email}</p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
           <ThemeToggle />
           <form action={logout}>
             <button type="submit" style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 2)', padding: '0.3rem 0.6rem', fontSize: '0.65rem', fontWeight: 800, borderRadius: '0.3rem', cursor: 'pointer' }}>
               LOG OUT
             </button>
           </form>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* ADD NEW HUB AREA (PRIORITIZED AT THE TOP) */}
        <section style={{ marginBottom: '3rem', paddingBottom: '2.5rem', borderBottom: '2px solid var(--border)' }}>
             <h2 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Structure New Intelligence Hub</h2>
             <div style={{ maxWidth: '400px' }}>
                <CreateHubForm />
             </div>
        </section>

        {/* ACTIVE HUB GRID */}
        <main>
          <div style={{ marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Collectives</h2>
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>Monitoring {hubs.length} active communities.</p>
          </div>

          <div className={styles.hubGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '2rem' }}>
            {hubs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '1rem', border: '2px dashed var(--border)', gridColumn: '1 / -1' }}>
                <p style={{ fontWeight: 800 }}>Intelligence network is currently empty. Initialize a Hub above.</p>
              </div>
            ) : (
              hubs.map((hub: Hub) => (
                <div key={hub.id} className={styles.hubCard} style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', gap: '1.5rem', transition: 'transform 0.2s' }}>
                  <header style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>{hub.name}</h3>
                      <div style={{ fontSize: '0.65rem', color: 'var(--indigo)', fontWeight: 900, opacity: 0.5 }}>REF: {hub.id.slice(0, 8)}</div>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--indigo)', fontWeight: 800, textTransform: 'uppercase' }}>/communities/{hub.slug}</p>
                  </header>
                  
                  {/* ADD SOURCE FORM (RESTORED) */}
                  <AddSourceForm hubId={hub.id} />

                  {/* SOURCE LIST & FEED */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
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
