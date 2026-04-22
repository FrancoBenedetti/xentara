import styles from './dashboard.module.css';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { getHubs, getUserProfile } from './actions';
import HelpSystem from '@/components/dashboard/HelpSystem';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hubs, profile] = await Promise.all([getHubs(), getUserProfile()]);
  const isStaff = profile?.is_staff === true;

  return (
    <div className={styles.dashboardLayout}>
      <DashboardNav hubs={hubs} isStaff={isStaff} />
      
      <main className={styles.mainContent}>
        {children}
      </main>

      <HelpSystem />
    </div>
  );
}
