'use client'

import { useState } from 'react'
import { updateSource } from '@/app/dashboard/actions'

export default function EditSourceButton({ source }: { source: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (isEditing) {
    return (
      <form 
        onSubmit={async (e) => {
          e.preventDefault()
          setIsLoading(true)
          try {
            await updateSource(source.id, new FormData(e.currentTarget))
            setIsEditing(false)
          } finally {
            setIsLoading(false)
          }
        }}
        style={{ display: 'flex', gap: '0.4rem', width: '100%', marginTop: '0.5rem' }}
      >
        <input name="name" defaultValue={source.name} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #4b5563', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', color: 'white', flex: 1, fontSize: '0.8rem' }} />
        <input name="url" defaultValue={source.url} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #4b5563', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', color: 'white', flex: 1, fontSize: '0.8rem' }} />
        <button type="submit" disabled={isLoading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Save</button>
        <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#4b5563', color: 'white', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>Cancel</button>
      </form>
    )
  }

  return (
    <button 
      onClick={() => setIsEditing(true)}
      title="Edit this monitored source"
      style={{
        background: 'rgba(96, 165, 250, 0.05)',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        color: 'var(--indigo)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0.4rem',
        borderRadius: '0.4rem',
        transition: 'all 0.2s'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>
  )
}
