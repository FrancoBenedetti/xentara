import styles from './dashboard.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardLayout}>
      <aside className={styles.sidebar}>
        <h2>XENTARA</h2>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ marginBottom: '1rem', color: '#6366f1', fontWeight: 600 }}>Hubs</li>
            <li style={{ marginBottom: '1rem', color: '#9ca3af', cursor: 'not-allowed' }}>Boards (Locked)</li>
            <li style={{ marginBottom: '1rem', color: '#9ca3af', cursor: 'not-allowed' }}>Settings</li>
          </ul>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
