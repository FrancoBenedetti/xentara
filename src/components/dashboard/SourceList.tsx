'use client'

import { getSources } from '@/app/dashboard/actions'
import DeleteSourceButton from './DeleteSourceButton'
import EditSourceButton from './EditSourceButton'
import RefreshSourceButton from './RefreshSourceButton'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export default function SourceList({ hubId }: { hubId: string }) {
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Load sources
  useEffect(() => {
    getSources(hubId).then(data => {
      setSources(data)
      setLoading(false)
    })
  }, [hubId])

  // Get active filters scoped to THIS HUB 
  const filterKey = `f_${hubId.slice(0, 8)}`
  const selectedSources = searchParams.get(filterKey)?.split(',').filter(Boolean) || []

  const toggleFilter = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    let newSelected = [...selectedSources]
    
    if (newSelected.includes(id)) {
      newSelected = newSelected.filter(s => s !== id)
    } else {
      newSelected.push(id)
    }

    if (newSelected.length === 0) {
      params.delete(filterKey)
    } else {
      params.set(filterKey, newSelected.join(','))
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>SYNCHRONIZING SOURCES...</div>

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Monitored Sources
        </h4>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900 }}>{sources.length} CHANNELS</div>
      </div>

      {sources.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No sources connected.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {sources.map((source: any) => {
            const isHidden = selectedSources.length > 0 && !selectedSources.includes(source.id)
            
            return (
              <li 
                key={source.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.25rem',
                  padding: '0.875rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.6rem',
                  backgroundColor: isHidden ? 'rgba(255, 255, 255, 0.01)' : 'var(--bg-surface)',
                  boxShadow: 'var(--card-shadow)',
                  opacity: isHidden ? 0.35 : 1,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {source.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
                      {source.url}
                    </div>
                  </div>
                  <span style={{ color: 'var(--indigo)', fontSize: '0.6rem', fontWeight: 900, background: 'var(--indigo-soft)', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', ml: '0.5rem', border: '1px solid var(--indigo)' }}>
                    {source.type}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.6rem', borderTop: '1px solid var(--border)', marginTop: '0.35rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <RefreshSourceButton id={source.id} url={source.url} type={source.type} />
                    <EditSourceButton source={source} />
                    <DeleteSourceButton id={source.id} />
                  </div>

                  <button 
                    onClick={() => toggleFilter(source.id)}
                    title={isHidden ? "Show in feed" : "Hide in feed"}
                    style={{
                      background: isHidden ? 'transparent' : 'var(--indigo-soft)',
                      border: '1px solid var(--indigo)',
                      color: isHidden ? 'var(--text-muted)' : 'var(--indigo)',
                      cursor: 'pointer',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      transition: 'all 0.2s'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {isHidden ? (
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                    {isHidden ? 'HIDDEN' : 'VISIBLE'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )
}
