'use client'

import { getSources } from '@/app/dashboard/actions'
import DeleteSourceButton from './DeleteSourceButton'
import EditSourceButton from './EditSourceButton'
import RefreshSourceButton from './RefreshSourceButton'
import { useEffect, useState } from 'react'

export default function SourceList({ hubId }: { hubId: string }) {
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Load sources
  useEffect(() => {
    getSources(hubId).then(data => {
      setSources(data)
      setLoading(false)
    })
  }, [hubId])

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, padding: '1rem' }}>SYNCHRONIZING SOURCES...</div>

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Monitored Sources
        </h4>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 900 }}>{sources.length} CHANNELS</div>
      </div>

      {sources.length === 0 ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '0.5rem', textAlign: 'center' }}>No sources connected.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sources.map((source: any) => {
            return (
              <li 
                key={source.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.25rem',
                  padding: '1rem',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: 'var(--card-shadow)',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {source.name}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>
                      {source.url}
                    </div>
                  </div>
                  <span style={{ color: 'var(--indigo)', fontSize: '0.55rem', fontWeight: 900, background: 'var(--indigo-soft)', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', marginLeft: '0.5rem', border: '1px solid var(--indigo)' }}>
                    {source.type}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '0.5rem', gap: '0.75rem' }}>
                    <RefreshSourceButton id={source.id} url={source.url} type={source.type} />
                    <EditSourceButton source={source} />
                    <DeleteSourceButton id={source.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )
}
