import styles from './dashboard.module.css';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { getHubs, getUserProfile } from './actions';
import HelpSystem from '@/components/dashboard/HelpSystem';
import fs from 'fs/promises';
import path from 'path';

const HELP_ARTICLES = [
  {
    slug: 'taxonomy-guide',
    title: 'Understanding Taxonomy',
    description: 'Learn about the difference between tags, flavors, and how to manage your hub taxonomy.',
  },
  {
    slug: 'publishing-workflow',
    title: 'Publishing Workflow',
    description: 'How to use the Republish Modal to refine and distribute content.',
  },
  {
    slug: 'telegram-distribution',
    title: 'Adding a Telegram Channel',
    description: 'Step-by-step guide to configuring a Telegram channel for automated content distribution.',
  }
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hubs, profile] = await Promise.all([getHubs(), getUserProfile()]);
  const isStaff = profile?.is_staff === true;

  const articles = await Promise.all(
    HELP_ARTICLES.map(async (meta) => {
      try {
        const filePath = path.join(process.cwd(), 'src', 'content', 'help', `${meta.slug}.md`);
        const content = await fs.readFile(filePath, 'utf-8');
        return { ...meta, content };
      } catch (e) {
        console.error(`Failed to load help article: ${meta.slug}`, e);
        return { ...meta, content: '# Error\nCould not load content.' };
      }
    })
  );

  return (
    <div className={styles.dashboardLayout}>
      <DashboardNav hubs={hubs} isStaff={isStaff} />
      
      <main className={styles.mainContent}>
        {children}
      </main>

      <HelpSystem articles={articles} />
    </div>
  );
}
