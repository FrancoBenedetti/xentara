'use client'

import { useState, useRef, useCallback } from 'react'
import { Publication, purgePublications, getRecentPublications } from '@/app/dashboard/actions'
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
  const [publications, setPublications] = useState<Publication[]>(initialPublications)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPurging, setIsPurging] = useState(false)
  
  // Pagination State
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialPublications.length >= 50)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoadingMore, hasMore])

  const loadMore = async () => {
    setIsLoadingMore(true)
    try {
      const nextPage = page + 1
      const newPubs = await getRecentPublications(hubId, sourceId, nextPage)
      if (newPubs.length < 50) {
        setHasMore(false)
      }
      // Filter out duplicates just in case
      setPublications(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNew = newPubs.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNew]
      })
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more publications:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

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
      setPublications(prev => prev.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
    } catch (error) {
      console.error('Failed to purge publications:', error)
      alert('Failed to purge publications')
    } finally {
      setIsPurging(false)
    }
  }

  const readyCount = publications.filter(p => p.status === 'ready').length
  const unPublishedPublications = publications.filter(p => !p.is_published)
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
                    <span>{publications.length} TOTAL</span>
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

      {publications.length === 0 ? (
        <div className={styles.feedEmpty}>
           <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>Channel is currently silent.</p>
           <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--indigo)', marginTop: '0.25rem' }}>Synapse activity pending...</p>
        </div>
      ) : (
        <div className={styles.feedScrollArea}>
          {publications.map((pub: Publication, index: number) => {
            const isLast = index === publications.length - 1
            return (
              <div 
                key={pub.id} 
                ref={isLast ? lastElementRef : null}
              >
                <PublicationCard 
                    pub={pub} 
                    selectable={!pub.is_published}
                    isSelected={selectedIds.includes(pub.id)}
                    onSelect={() => toggleSelection(pub.id)}
                />
              </div>
            )
          })}
          {isLoadingMore && (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800 }}>
              LOADING MORE ARCHIVES...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
