import styles from './dashboard.module.css';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>XENTARA</h2>
          <p style={{ fontSize: '0.6rem', color: 'var(--indigo)', fontWeight: 800, marginTop: '0.25rem', letterSpacing: '0.1em' }}>AGGREGATOR V1.0</p>
        </div>
        
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1.5rem' }}>
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', fontWeight: 700, fontSize: '0.9rem' }}>
                 <span style={{ color: 'var(--indigo)' }}>⬢</span> Hubs
              </Link>
            </li>
            <li style={{ marginBottom: '1.5rem', opacity: 0.3, cursor: 'not-allowed' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.9rem' }}>
                 <span>⬡</span> Boards (Locked)
              </div>
            </li>
            <li style={{ marginBottom: '1.5rem' }}>
              <Link href="/dashboard/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', fontWeight: 700, fontSize: '0.9rem' }}>
                 <span style={{ color: 'var(--text-muted)' }}>⚙</span> Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
           <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phase 2: Stable Intel</div>
        </div>
      </aside>
      
      <main className={styles.mainContent} style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
