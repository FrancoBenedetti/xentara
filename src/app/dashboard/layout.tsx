import styles from './dashboard.module.css';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { getHubs } from './actions';
import HelpSystem from '@/components/dashboard/HelpSystem';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hubs = await getHubs();

  return (
    <div className={styles.dashboardLayout}>
      <DashboardNav hubs={hubs} />
      
      <main className={styles.mainContent}>
        {children}
      </main>

      <HelpSystem />
    </div>
  );
}
