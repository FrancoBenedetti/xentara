import styles from './dashboard.module.css';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardLayout}>
      <DashboardNav />
      
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
