'use client'

import { useState } from 'react'
import { Publication } from '@/app/dashboard/actions'
import ReprocessButton from './ReprocessButton'
import RepublishModal from './RepublishModal'
import styles from '@/app/dashboard/dashboard.module.css'

export default function PublicationCard({ pub }: { pub: Publication }) {
  const [showModal, setShowModal] = useState(false)

  const getStatusBadge = (status: string) => {
    const commonStyles = { padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 900, border: '1px solid currentColor' }
    switch (status) {
      case 'published':
        return <span style={{ ...commonStyles, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--indigo)' }}>PUBLISHED</span>
      case 'ready':
        return <span style={{ ...commonStyles, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>READY</span>
      case 'failed':
        return <span style={{ ...commonStyles, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>FAILED</span>
      default:
        return <span style={{ ...commonStyles, background: 'rgba(156, 163, 175, 0.1)', color: 'var(--text-muted)' }}>RAW</span>
    }
  }

  const getSentimentColor = (score: number | null) => {
    if (score === null) return 'var(--text-muted)';
    if (score > 0.3) return '#10b981';
    if (score < -0.3) return '#ef4444';
    return '#f59e0b';
  }

  return (
    <div key={pub.id} style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
         <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {pub.monitored_sources?.name || 'MEDIA ITEM'}
         </div>
         {getStatusBadge(pub.status)}
      </div>

      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
        {pub.title}
      </div>

      {pub.byline && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6, fontWeight: 600, borderLeft: '4px solid var(--indigo)', paddingLeft: '1rem' }}>
           {pub.byline}
        </div>
      )}

      {pub.curator_commentary && (
        <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--indigo)', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Curator Insight</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.5 }}>{pub.curator_commentary}</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {pub.tags?.slice(0, 5).map((tag: string) => (
            <span key={tag} style={{ fontSize: '0.6rem', color: 'var(--indigo)', background: 'var(--indigo-soft)', border: '1px solid var(--indigo)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 900 }}>
              #{tag.toUpperCase()}
            </span>
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           {pub.sentiment_score !== null && (
              <span style={{ display: 'block', height: '10px', width: '10px', borderRadius: '50%', background: getSentimentColor(pub.sentiment_score), boxShadow: `0 0 10px ${getSentimentColor(pub.sentiment_score)}44` }}></span>
           )}
           
           <div style={{ display: 'flex', gap: '0.5rem' }}>
             <ReprocessButton id={pub.id} url={pub.source_url} />
             {pub.status === 'ready' && (
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

      <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <a href={pub.source_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ORIGINAL ↗
        </a>
      </div>

      {showModal && (
        <RepublishModal publication={pub} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
