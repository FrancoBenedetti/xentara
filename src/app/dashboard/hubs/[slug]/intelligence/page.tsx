import { getHubBySlug } from '@/app/dashboard/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'
import { getHubEngagementSummary, getPublicationEngagement, getRecentComments } from '../../intelligence-actions'
import { BASE_REACTION_SET, ReactionKey } from '@/lib/engagement/reactions'

export const dynamic = 'force-dynamic'

export default async function HubIntelligencePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  const { slug } = resolvedParams
  
  const hub = await getHubBySlug(slug)
  if (!hub) notFound()

  const summary = await getHubEngagementSummary(hub.id)
  const pubStatsResult = await getPublicationEngagement(hub.id)
  const pubStats = pubStatsResult.rows
  const enabledReactions = pubStatsResult.enabledReactions as ReactionKey[]
  const recentComments = await getRecentComments(hub.id)

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
             <p className={styles.headerUser}>CURATOR PORTAL</p>
           </div>
        </div>
        <div className={styles.headerRight} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href={`/dashboard/hubs/${hub.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
             ← Back to Hub
          </Link>
        </div>
      </header>

      <div className={styles.contentWrapper}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>Intelligence & Engagement</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Track how your audience is reacting to publications.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{summary.reactions}</span>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reactions</span>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>{summary.comments}</span>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Comments</span>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <span style={{ fontSize: '2rem', fontWeight: 700, color: summary.avgSentiment > 0 ? 'var(--emerald)' : summary.avgSentiment < 0 ? 'var(--rose)' : 'var(--text-main)' }}>
                 {summary.avgSentiment > 0 ? '+' : ''}{summary.avgSentiment.toFixed(2)}
               </span>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Sentiment</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Reaction Breakdown */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Top Publications</h3>
               {pubStats.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No engagement data yet.</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {pubStats.slice(0, 5).map((stat) => (
                     <div key={stat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                       <div style={{ flex: 1, marginRight: '1rem' }}>
                         <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{stat.title}</div>
                       </div>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.85rem' }}>
                          {enabledReactions.map(r => (
                            <span key={r} title={BASE_REACTION_SET[r]?.label}>{BASE_REACTION_SET[r]?.emoji} {stat[r]}</span>
                          ))}
                          <span title="Comments">💬 {stat.comments}</span>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Comment Inbox */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1rem' }}>Qualitative Feedback</h3>
               {recentComments.length === 0 ? (
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments received yet.</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {recentComments.map((comment: any) => (
                     <div key={comment.id} style={{ background: 'var(--bg-inset)', padding: '1rem', borderRadius: '6px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                         <span>On: {(comment.publication as any)?.title || 'Unknown'}</span>
                         <span style={{ color: comment.sentiment_score > 0 ? 'var(--emerald)' : comment.sentiment_score < 0 ? 'var(--rose)' : 'inherit' }}>
                           Score: {comment.sentiment_score !== null ? comment.sentiment_score.toFixed(2) : 'Pending...'}
                         </span>
                       </div>
                       <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, fontStyle: 'italic' }}>"{comment.value}"</p>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
