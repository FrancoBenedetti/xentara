'use client'

import { useState } from 'react'
import { Publication } from '@/app/dashboard/actions'
import ReprocessButton from './ReprocessButton'
import RepublishModal from './RepublishModal'
import styles from '@/app/dashboard/dashboard.module.css'

export default function PublicationCard({ pub }: { pub: Publication }) {
  const [showModal, setShowModal] = useState(false)

  const isProcessing = ['raw', 'transcribing', 'summarizing'].includes(pub.status)

  const getStatusBadge = (status: string) => {
    const commonStyles = { padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 900, border: '1px solid currentColor' }
    switch (status) {
      case 'published':
        return <span style={{ ...commonStyles, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo)' }}>PUBLISHED</span>
      case 'ready':
        return <span style={{ ...commonStyles, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>READY</span>
      case 'failed':
        return <span style={{ ...commonStyles, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>FAILED</span>
      case 'raw':
      case 'transcribing':
      case 'summarizing':
        return <span style={{ ...commonStyles, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', animation: 'pulse 2s infinite' }}>AI IS WORKING...</span>
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
         <div className={styles.pubCardSource}>
            {pub.monitored_sources?.name || 'MEDIA ITEM'}
         </div>
         {getStatusBadge(pub.status)}
      </div>

      <div className={`${styles.pubCardTitle} ${isProcessing ? styles.pubCardProcessingTitle : ''}`}>
        {isProcessing ? 'Curating latest insights...' : pub.title}
      </div>

      {!isProcessing && pub.byline && (
        <div className={styles.pubCardByline}>
           {pub.byline}
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
             {pub.status === 'ready' && !isProcessing && (
               <button 
                onClick={() => setShowModal(true)}
                style={{ padding: '0.3rem 0.75rem', background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)' }}
               >
                 PUBLISH
               </button>
             )}
           </div>
        </div>
      </div>

      <div className={styles.pubCardLinks}>
        <a href={pub.source_url} target="_blank" rel="noopener noreferrer" className={styles.pubCardLink}>
          ORIGINAL ↗
        </a>
      </div>

      {showModal && (
        <RepublishModal publication={pub} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
