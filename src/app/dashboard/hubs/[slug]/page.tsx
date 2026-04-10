import { getHubBySlug, getSources } from '@/app/dashboard/actions'
import { notFound } from 'next/navigation'
import styles from '@/app/dashboard/dashboard.module.css'
import AddSourceForm from '@/components/dashboard/AddSourceForm'
import SourceList from '@/components/dashboard/SourceList'
import IntelligenceFeed from '@/components/dashboard/IntelligenceFeed'
import SourceFilter from '@/components/dashboard/SourceFilter'
import Link from 'next/link'

export default async function HubDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ s?: string }>
}) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  const resolvedSearchParams = await searchParams
  const sourceId = resolvedSearchParams.s
  
  const hub = await getHubBySlug(slug)
  if (!hub) notFound()

  const sources = await getSources(hub.id)

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
           <Link href="/dashboard" className={styles.logoIcon} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
               <path d="M19 12H5M12 19l-7-7 7-7" />
             </svg>
           </Link>
           <div>
             <h1 className={styles.headerTitle}>{hub.name}</h1>
             <p className={styles.headerUser}>COLLECTIVE INTELLIGENCE PORTAL</p>
           </div>
        </div>
        <div className={styles.headerRight} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <AddSourceForm hubId={hub.id} />
          <Link href={`/dashboard/hubs/${hub.slug}/settings`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
             ⚙️ Settings
          </Link>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <div className={styles.hubDetailLayout}>
          <div>
            <SourceFilter sources={sources} activeSourceId={sourceId} />
            <IntelligenceFeed hubId={hub.id} sourceId={sourceId} />
          </div>
          
          <aside className={styles.hubDetailAside}>
            <h3 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Source Registry</h3>
            <SourceList hubId={hub.id} />
          </aside>
        </div>
      </div>
    </div>
  )
}
