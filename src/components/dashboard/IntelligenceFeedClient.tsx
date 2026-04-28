'use client'

import { useState, useRef, useCallback } from 'react'
import { Publication, HubPromotion, purgePublications, getRecentPublications } from '@/app/dashboard/actions'
import PublicationCard from './PublicationCard'
import PromotionCard from './PromotionCard'
import styles from '@/app/dashboard/dashboard.module.css'
import SubmitArticleForm from './SubmitArticleForm'

interface IntelligenceFeedClientProps {
  initialPublications: Publication[]
  hubId: string
  sourceId?: string
  hubRole?: string
  promotions?: HubPromotion[]
  curatorTakeLabel?: string
  /** BCP-47 or short language code from hub settings */
  hubLanguage?: string
}

export default function IntelligenceFeedClient({ 
  initialPublications,
  hubId,
  sourceId,
  hubRole,
  promotions = [],
  curatorTakeLabel,
  hubLanguage
}: IntelligenceFeedClientProps) {
  const [publications, setPublications] = useState<Publication[]>(initialPublications)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPurging, setIsPurging] = useState(false)
  const [suppressedPromoIds, setSuppressedPromoIds] = useState<Set<string>>(new Set())
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  
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

  // Build the interleaved list of publication + promotion nodes
  const renderFeedItems = () => {
    const items: React.ReactNode[] = []
    const activePromos = promotions.filter(p => !suppressedPromoIds.has(p.id))

    publications.forEach((pub: Publication, index: number) => {
      const isLast = index === publications.length - 1
      items.push(
        <div key={pub.id} ref={isLast ? lastElementRef : null}>
          <PublicationCard
            pub={pub}
            selectable={!pub.is_published}
            isSelected={selectedIds.includes(pub.id)}
            onSelect={() => toggleSelection(pub.id)}
            hubRole={hubRole}
            curatorTakeLabel={curatorTakeLabel}
            hubLanguage={hubLanguage}
          />
        </div>
      )

      // After each publication, check if any promotion should be injected here.
      // Use frequency_hours as "inject every N items", staggered by promo index
      // so multiple promos don't all appear at the same position.
      activePromos.forEach((promo, promoIdx) => {
        const interval = Math.max(1, promo.frequency_hours)
        const offset = promoIdx * Math.ceil(interval / 2) // stagger
        if ((index + 1 + offset) % interval === 0) {
          items.push(
            <PromotionCard
              key={`promo-${promo.id}-at-${index}`}
              promotion={promo}
              onSuppress={(id) => setSuppressedPromoIds(prev => new Set(prev).add(id))}
            />
          )
        }
      })
    })

    return items
  }

  return (
    <div className={styles.feedContainer}>
      {(hubRole === 'owner' || hubRole === 'editor') && (
        <div style={{ marginBottom: showSubmitForm ? '0' : '1rem' }}>
          {showSubmitForm && (
            <SubmitArticleForm hubId={hubId} onSuccess={() => {}} />
          )}
        </div>
      )}

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
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(hubRole === 'owner' || hubRole === 'editor') && (
            <button 
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              style={{
                background: showSubmitForm ? 'rgba(255, 255, 255, 0.1)' : 'var(--indigo)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: showSubmitForm ? 'none' : '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
              }}
              title="Submit ad-hoc article"
            >
              <span style={{ fontSize: '1.2rem', lineHeight: 1, transform: showSubmitForm ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease', display: 'inline-block' }}>+</span>
            </button>
          )}
          
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
      </div>

      {publications.length === 0 ? (
        <div className={styles.feedEmpty}>
           <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>Channel is currently silent.</p>
           <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--indigo)', marginTop: '0.25rem' }}>Synapse activity pending...</p>
        </div>
      ) : (
        <div className={styles.feedScrollArea}>
          {renderFeedItems()}
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
