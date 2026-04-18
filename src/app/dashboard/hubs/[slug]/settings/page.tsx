import { getHubBySlug } from '@/app/dashboard/actions'
import { getHubChannels, getDistributionLogs, getEngagementConfig } from '@/app/dashboard/hubs/settings-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'
import DistributionSettings from '@/components/dashboard/DistributionSettings'
import EngagementSettings from '@/components/dashboard/EngagementSettings'

export default async function HubSettingsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  
  const hub = await getHubBySlug(slug)
  if (!hub) notFound()

  const channels = await getHubChannels(hub.id)
  const logs = await getDistributionLogs(hub.id)
  const engagementConfig = await getEngagementConfig(hub.id)

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
           <Link href={`/dashboard/hubs/${hub.slug}`} className={styles.logoIcon} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <path d="M19 12H5M12 19l-7-7 7-7" />
             </svg>
           </Link>
           <div>
             <h1 className={styles.headerTitle}>{hub.name} Settings</h1>
             <p className={styles.headerUser}>DISTRIBUTION & CHANNELS</p>
           </div>
        </div>
        <div className={styles.headerRight}>
           <Link href={`/dashboard/hubs/${hub.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
             Back to Hub
           </Link>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <DistributionSettings hubId={hub.id} initialChannels={channels} logs={logs} />
          <EngagementSettings hubId={hub.id} initialConfig={engagementConfig} />
        </div>
      </div>
    </div>
  )
}
