import { getHubs } from './actions'
import { logout } from '@/app/login/actions'
import styles from './dashboard.module.css'
import CreateHubForm from '@/components/dashboard/CreateHubForm'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardPage() {
  const hubs = await getHubs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Community Intelligence Hubs</h1>
          {user ? (
            <p className={styles.textMuted}>Logged in as {user.email}</p>
          ) : (
            <p style={{ color: '#fbbf24' }}>Warning: No active session. Please log in to manage hubs.</p>
          )}
        </div>
        <div>
           <form action={logout}>
             <button type="submit" className={styles.secondary} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
               Log Out
             </button>
           </form>
        </div>
      </div>

      <CreateHubForm />

      <div className={styles.hubGrid}>
        {hubs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            <p>No hubs found. Create your first community hub above.</p>
          </div>
        ) : (
          hubs.map((hub) => (
            <div key={hub.id} className={styles.hubCard}>
              <h3>{hub.name}</h3>
              <p>Slug: {hub.slug}</p>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: 0.6 }}>
                ID: {hub.id}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
