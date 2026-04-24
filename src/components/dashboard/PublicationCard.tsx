'use client'

import { useState } from 'react'
import { Publication } from '@/app/dashboard/actions'
import ReprocessButton from './ReprocessButton'
import RepublishModal from './RepublishModal'
import styles from '@/app/dashboard/dashboard.module.css'

interface PublicationCardProps {
  pub: Publication
  selectable?: boolean
  isSelected?: boolean
  onSelect?: () => void
  hubRole?: string
}

export default function PublicationCard({ pub, selectable, isSelected, onSelect, hubRole }: PublicationCardProps) {
  const [showModal, setShowModal] = useState(false)

  const isProcessing = ['raw', 'transcribing', 'summarizing'].includes(pub.status)

  const getStatusBadge = (status: string) => {
    const commonStyles = { 
      padding: '0.2rem 0.5rem', 
      borderRadius: '4px', 
      fontSize: '0.7rem', 
      fontWeight: 900, 
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'currentColor' 
    }
    switch (status) {
      case 'published':
        return <span style={{ ...commonStyles, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo)' }}>PUBLISHED</span>
      case 'ready':
        return <span style={{ ...commonStyles, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--text-main)', borderColor: '#10b981' }}>READY</span>
      case 'failed':
        return <span style={{ ...commonStyles, background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-main)', borderColor: '#ef4444' }}>FAILED</span>
      case 'raw':
      case 'transcribing':
      case 'summarizing':
        const statusLabel = status === 'transcribing' ? 'TRANSCRIBING...' : status === 'summarizing' ? 'SUMMARIZING...' : 'AI IS WORKING...';
        return <span style={{ ...commonStyles, background: 'rgba(245, 158, 11, 0.1)', color: 'var(--text-main)', borderColor: '#f59e0b', animation: 'pulse 2s infinite' }}>{statusLabel}</span>
      default:
        return <span style={{ ...commonStyles, background: 'rgba(156, 163, 175, 0.1)', color: 'var(--text-muted)' }}>{status?.toUpperCase() || 'UNKNOWN'}</span>
    }
  }

  const getSentimentColor = (score: number | null) => {
    if (score === null) return 'var(--text-muted)';
    if (score > 0.3) return '#10b981';
    if (score < -0.3) return '#ef4444';
    return '#f59e0b';
  }

  return (
    <div key={pub.id} className={`${styles.pubCard} ${isProcessing ? styles.pubCardProcessing : ''}`}>
      
      <div className={styles.pubCardHeader}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           {selectable && (
             <input 
                type="checkbox" 
                checked={isSelected}
                onChange={onSelect}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--indigo)' }}
                onClick={(e) => e.stopPropagation()}
             />
           )}
           <div style={{ display: 'flex', flexDirection: 'column' }}>
             <div className={styles.pubCardSource}>
                {pub.monitored_sources?.name || 'MEDIA ITEM'}
             </div>
             {(() => {
               const dateStr = pub.metadata?.date || pub.metadata?.pubDate || pub.published_at || pub.created_at;
               if (!dateStr) return null;
               try {
                 return (
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                     {new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                   </div>
                 );
               } catch (e) {
                 return null;
               }
             })()}
           </div>
         </div>
         {getStatusBadge(pub.status)}
      </div>

      <div className={`${styles.pubCardTitle} ${isProcessing ? styles.pubCardProcessingTitle : ''}`}>
        {isProcessing ? (
          <>
            <span style={{ fontSize: '0.65rem', display: 'block', marginBottom: '0.25rem', opacity: 0.8 }}>NEURAL REGENERATION IN PROGRESS...</span>
            {pub.title}
          </>
        ) : pub.title}
      </div>

      {pub.status === 'failed' && pub.error_message && (
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
          <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 800 }}>NEURAL FAULT:</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>{pub.error_message}</p>
        </div>
      )}

      {!isProcessing && pub.byline && (
        <div className={styles.pubCardByline}>
           {pub.byline}
        </div>
      )}

      {!isProcessing && pub.synopsis && (
        <div className={styles.pubCardInsight} style={{ background: 'transparent', border: 'none', padding: '0 1rem', marginTop: '-0.5rem' }}>
          <p className={styles.pubCardInsightText} style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            {pub.synopsis}
          </p>
        </div>
      )}

      {!isProcessing && pub.curator_commentary && (
        <div className={styles.pubCardInsight}>
            <p className={styles.pubCardInsightTitle}>Curator Insight</p>
            <p className={styles.pubCardInsightText}>{pub.curator_commentary}</p>
        </div>
      )}

      <div className={styles.pubCardFooter}>
        <div className={styles.pubCardTags}>
          {!isProcessing && pub.tags?.slice(0, 5).map((tag: string) => (
            <span key={tag} className={styles.pubCardTag}>
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>
        
        <div className={styles.pubCardActions}>
           {pub.sentiment_score !== null && !isProcessing && (
              <span className={styles.pubCardSentiment} style={{ background: getSentimentColor(pub.sentiment_score), boxShadow: `0 0 10px ${getSentimentColor(pub.sentiment_score)}44` }}></span>
           )}
           
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             {!isProcessing && <ReprocessButton id={pub.id} url={pub.source_url} />}
             {['ready', 'published'].includes(pub.status) && !isProcessing && (
               <button 
                onClick={() => setShowModal(true)}
                style={{ padding: '0.4rem 0.8rem', background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)' }}
               >
                 {pub.status === 'published' ? 'RE-PUBLISH' : 'PUBLISH'}
               </button>
             )}
           </div>
        </div>
      </div>

      {pub.source_url && (
        <div className={styles.pubCardLinks}>
          <a href={pub.source_url} target="_blank" rel="noopener noreferrer" className={styles.pubCardLink}>
            ORIGINAL ↗
          </a>
        </div>
      )}

      {showModal && (
        <RepublishModal publication={pub} onClose={() => setShowModal(false)} hubRole={hubRole} />
      )}
    </div>
  )
}
