import { getHubBySlug, getHubSubscriberCount, getHubPromotions } from '@/app/dashboard/actions'
import { getHubChannels, getDistributionLogs, getEngagementConfig } from '@/app/dashboard/hubs/settings-actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'
import HubSettingsTabs from '@/components/dashboard/HubSettingsTabs'

export const dynamic = 'force-dynamic'

export default async function HubSettingsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  
  const hub = await getHubBySlug(slug)
  if (!hub) notFound()

  const subscriberCount = await getHubSubscriberCount(hub.id)
  const channels = await getHubChannels(hub.id)
  const logs = await getDistributionLogs(hub.id)
  const engagementConfig = await getEngagementConfig(hub.id)
  const promotions = await getHubPromotions(hub.id)

  const hubData = { ...hub, subscriberCount }

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
             <p className={styles.headerUser}>INTELLIGENCE CONTROL</p>
           </div>
        </div>
        <div className={styles.headerRight}>
           <Link href={`/dashboard/hubs/${hub.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
             Back to Hub
           </Link>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          <HubSettingsTabs 
            hub={hubData as any} 
            channels={channels} 
            logs={logs} 
            promotions={promotions}
            engagementConfig={engagementConfig}
          />
        </div>
      </div>
    </div>
  )
}
