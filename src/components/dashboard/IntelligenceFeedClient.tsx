'use client'

import { useState } from 'react'
import { Publication, purgePublications } from '@/app/dashboard/actions'
import PublicationCard from './PublicationCard'
import styles from '@/app/dashboard/dashboard.module.css'

interface IntelligenceFeedClientProps {
  initialPublications: Publication[]
  hubId: string
  sourceId?: string
}

export default function IntelligenceFeedClient({ 
  initialPublications,
  hubId,
  sourceId 
}: IntelligenceFeedClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPurging, setIsPurging] = useState(false)

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    )
  }

  const handleBulkPurge = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to purge ${selectedIds.length} publications?`)) return

    setIsPurging(true)
    try {
      await purgePublications(selectedIds)
      setSelectedIds([])
    } catch (error) {
      console.error('Failed to purge publications:', error)
      alert('Failed to purge publications')
    } finally {
      setIsPurging(false)
    }
  }

  const readyCount = initialPublications.filter(p => p.status === 'ready').length
  const unPublishedPublications = initialPublications.filter(p => !p.is_published)
  const allSelected = unPublishedPublications.length > 0 && selectedIds.length === unPublishedPublications.length

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(unPublishedPublications.map(p => p.id))
    }
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {unPublishedPublications.length > 0 && (
                <input 
                    type="checkbox" 
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    title="Select all un-published"
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--indigo)' }}
                />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <h4 className={styles.feedTitle}>
                    {sourceId ? 'Source Intelligence' : 'Unified Collective Feed'}
                    {sourceId && <span className={styles.feedFilterBadge}> (FILTERED)</span>}
                </h4>
                <div className={styles.feedMeta}>
                    <span className={styles.feedStatusActive}>{readyCount} READY</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{initialPublications.length} TOTAL</span>
                </div>
            </div>
        </div>
        
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkPurge}
            disabled={isPurging}
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#ef4444', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '0.75rem', 
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            🗑️ PURGE {selectedIds.length}
          </button>
        )}
      </div>

      {initialPublications.length === 0 ? (
        <div className={styles.feedEmpty}>
           <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>Channel is currently silent.</p>
           <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--indigo)', marginTop: '0.25rem' }}>Synapse activity pending...</p>
        </div>
      ) : (
        <div className={styles.feedScrollArea}>
          {initialPublications.map((pub: Publication) => (
            <div key={pub.id} style={{ position: 'relative' }}>
              <PublicationCard pub={pub} />
              {!pub.is_published && (
                <div style={{ 
                    position: 'absolute', 
                    top: '1.25rem', 
                    right: '1.25rem',
                    zIndex: 10
                }}>
                    <input 
                        type="checkbox" 
                        checked={selectedIds.includes(pub.id)}
                        onChange={() => toggleSelection(pub.id)}
                        style={{ 
                            width: '18px', 
                            height: '18px', 
                            cursor: 'pointer',
                            accentColor: 'var(--indigo)'
                        }}
                    />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
