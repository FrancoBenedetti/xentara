'use client'

import { useState } from 'react'
import styles from '@/app/dashboard/dashboard.module.css'
import { reprocessPublication } from '@/app/dashboard/actions'

export default function IngestionFailuresManager({ initialFailures }: { initialFailures: any[] }) {
  const [failures, setFailures] = useState(initialFailures)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleReprocess = async (id: string, url: string) => {
    setIsProcessing(id)
    try {
      await reprocessPublication(id, url)
      // Optimistically remove from list
      setFailures(prev => prev.filter(f => f.id !== id))
    } catch (err) {
      console.error("Failed to reprocess:", err)
      alert("Failed to reprocess the item. Please try again.")
    } finally {
      setIsProcessing(null)
    }
  }

  if (failures.length === 0) {
    return (
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '0.75rem',
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h3>No Ingestion Failures</h3>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>All systems are operating normally. No failed items found.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {failures.map(failure => (
        <div key={failure.id} style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem',
                  textTransform: 'uppercase'
                }}>
                  {failure.monitored_sources?.type || 'Unknown Source'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Hub: {failure.hubs?.name || 'Unknown Hub'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(failure.created_at).toLocaleString()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {failure.title || 'Untitled Content'}
              </h3>
              <a 
                href={failure.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.875rem', color: '#6366f1', textDecoration: 'none', display: 'inline-block', marginBottom: '0.5rem' }}
              >
                {failure.source_url}
              </a>
            </div>
            
            <button
              onClick={() => handleReprocess(failure.id, failure.source_url)}
              disabled={isProcessing === failure.id}
              className={styles.actionBtn}
              style={{ minWidth: '100px', display: 'flex', justifyContent: 'center' }}
            >
              {isProcessing === failure.id ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg className={styles.spin} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="2" x2="12" y2="6"></line>
                    <line x1="12" y1="18" x2="12" y2="22"></line>
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                    <line x1="2" y1="12" x2="6" y2="12"></line>
                    <line x1="18" y1="12" x2="22" y2="12"></line>
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                  </svg>
                  Processing
                </span>
              ) : (
                'Reprocess'
              )}
            </button>
          </div>

          <div style={{ 
            background: 'rgba(239, 68, 68, 0.05)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            borderRadius: '0.5rem', 
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            color: '#f87171',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}>
            <strong>Error:</strong><br/>
            {failure.error_message || 'No specific error message recorded.'}
          </div>
        </div>
      ))}
    </div>
  )
}
