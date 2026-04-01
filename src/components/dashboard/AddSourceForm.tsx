'use client'

import { addSource } from '@/app/dashboard/actions'
import { useState, useActionState, useTransition } from 'react'

export default function AddSourceForm({ hubId }: { hubId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        await addSource(hubId, formData)
        setShowForm(false)
      } catch (err: any) {
        setError(err.message || 'Failed to add source')
      }
    })
  }

  if (!showForm) {
    return (
      <button 
        style={{ 
            padding: '0.4rem 0.8rem', 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            background: 'var(--indigo-soft)', 
            color: 'var(--indigo)', 
            border: '1px solid var(--indigo)', 
            borderRadius: '0.4rem', 
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginTop: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}
        onClick={() => setShowForm(true)}
      >
        + ADD SOURCE CHANNEL
      </button>
    )
  }

  return (
    <div style={{ 
      background: 'var(--bg-surface)', 
      padding: '1.25rem', 
      borderRadius: '0.75rem',
      border: '1px solid var(--border)',
      marginTop: '1rem',
      boxShadow: 'var(--card-shadow)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Source Name</label>
          <input 
            name="name" 
            placeholder="e.g. Andrei Jikh" 
            required 
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Source Type</label>
          <select name="type" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem', appearance: 'none' }}>
            <option value="youtube">YouTube</option>
            <option value="rss">RSS Feed</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>URL or Handle</label>
          <input 
            name="url" 
            placeholder="https://... or @handle" 
            required 
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }}
          />
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
            {isPending ? 'ADDING...' : 'SAVE SOURCE'}
          </button>
          <button type="button" onClick={() => setShowForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  )
}
