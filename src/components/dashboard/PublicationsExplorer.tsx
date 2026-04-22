'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Publication, Hub, getPublicationHistory } from '@/app/dashboard/actions'
import PublicationCard from './PublicationCard'
import styles from '@/app/dashboard/dashboard.module.css'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface PublicationsExplorerProps {
  hubs: Hub[]
  initialPublications: Publication[]
  initialHubId: string
  flavors: string[]
}

export default function PublicationsExplorer({
  hubs,
  initialPublications,
  initialHubId,
  flavors
}: PublicationsExplorerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Filter State from URL or Defaults
  const [selectedHubId, setSelectedHubId] = useState(initialHubId)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [flavor, setFlavor] = useState(searchParams.get('flavor') || '')
  const [dateFrom, setDateFrom] = useState(searchParams.get('from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('to') || '')
  const [sortAsc, setSortAsc] = useState(searchParams.get('sort') === 'asc')

  // List State
  const [publications, setPublications] = useState<Publication[]>(initialPublications)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(initialPublications.length >= 20)
  const [isLoading, setIsLoading] = useState(false)

  // Update URL when filters change
  const updateUrl = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    if (selectedHubId) params.set('hub', selectedHubId)
    if (search) params.set('q', search); else params.delete('q');
    if (flavor) params.set('flavor', flavor); else params.delete('flavor');
    if (dateFrom) params.set('from', dateFrom); else params.delete('from');
    if (dateTo) params.set('to', dateTo); else params.delete('to');
    if (sortAsc) params.set('sort', 'asc'); else params.delete('sort');
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [selectedHubId, search, flavor, dateFrom, dateTo, sortAsc, pathname, router, searchParams])

  // Reload data when filters change
  useEffect(() => {
    const reload = async () => {
      setIsLoading(true)
      setPage(0)
      const data = await getPublicationHistory(selectedHubId, 0, {
        search,
        flavor,
        dateFrom,
        dateTo,
        sortAsc
      })
      setPublications(data)
      setHasMore(data.length >= 20)
      setIsLoading(false)
      updateUrl()
    }
    
    // Debounce search input
    const timer = setTimeout(reload, 300)
    return () => clearTimeout(timer)
  }, [selectedHubId, search, flavor, dateFrom, dateTo, sortAsc])

  // Infinite Scroll Logic
  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, hasMore])

  const loadMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    try {
      const nextPage = page + 1
      const newPubs = await getPublicationHistory(selectedHubId, nextPage, {
        search,
        flavor,
        dateFrom,
        dateTo,
        sortAsc
      })
      if (newPubs.length < 20) {
        setHasMore(false)
      }
      setPublications(prev => {
        const existingIds = new Set(prev.map(p => p.id))
        const uniqueNew = newPubs.filter(p => !existingIds.has(p.id))
        return [...prev, ...uniqueNew]
      })
      setPage(nextPage)
    } catch (error) {
      console.error('Error loading more publications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.explorerContainer}>
      <div className={styles.explorerFilters} style={{ 
        background: 'var(--bg-surface)', 
        padding: '1.5rem', 
        borderRadius: '1rem', 
        border: '1px solid var(--border)',
        marginBottom: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        {/* Hub Selector */}
        <div className={styles.filterGroup}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Collective Hub</label>
          <select 
            value={selectedHubId} 
            onChange={(e) => setSelectedHubId(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700 }}
          >
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className={styles.filterGroup}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Search Term</label>
          <input 
            type="text" 
            placeholder="Filter by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700 }}
          />
        </div>

        {/* Flavor Selector */}
        <div className={styles.filterGroup}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Intelligence Flavor</label>
          <select 
            value={flavor} 
            onChange={(e) => setFlavor(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700 }}
          >
            <option value="">All Flavors</option>
            {flavors.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className={styles.filterGroup}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>From Date</label>
          <input 
            type="date" 
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700 }}
          />
        </div>

        {/* Date To */}
        <div className={styles.filterGroup}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>To Date</label>
          <input 
            type="date" 
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700 }}
          />
        </div>

        {/* Sort Toggle */}
        <div className={styles.filterGroup}>
          <button 
            onClick={() => setSortAsc(!sortAsc)}
            style={{ 
              width: '100%', 
              padding: '0.6rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border)', 
              background: 'var(--bg-main)', 
              color: 'var(--indigo)', 
              fontWeight: 800, 
              cursor: 'pointer',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            {sortAsc ? '↑ Oldest First' : '↓ Newest First'}
          </button>
        </div>
      </div>

      <div className={styles.historyGrid}>
        {publications.length === 0 && !isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
            <p style={{ fontWeight: 800 }}>NO PUBLICATIONS MATCH THE CURRENT SYNAPSE FILTERS.</p>
          </div>
        ) : (
          publications.map((pub, index) => {
            const isLast = index === publications.length - 1
            return (
              <div key={pub.id} ref={isLast ? lastElementRef : null}>
                <PublicationCard pub={pub} />
              </div>
            )
          })
        )}
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontWeight: 900, letterSpacing: '0.1em', fontSize: '0.7rem' }}>
          SCANNING ARCHIVES...
        </div>
      )}
    </div>
  )
}
