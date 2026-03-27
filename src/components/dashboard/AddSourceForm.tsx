'use client'

import { addSource } from '@/app/dashboard/actions'
import styles from '@/app/dashboard/dashboard.module.css'
import { useState, useActionState } from 'react'

export default function AddSourceForm({ hubId }: { hubId: string }) {
  const [showForm, setShowForm] = useState(false)
  
  const [error, action, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      try {
        await addSource(formData)
        setShowForm(false)
        return null
      } catch (err: unknown) {
        if (err instanceof Error) return err.message
        return 'Unknown error'
      }
    },
    null
  )

  if (!showForm) {
    return (
      <button 
        className={styles.secondaryButton}
        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        onClick={() => setShowForm(true)}
      >
        + Add Source
      </button>
    )
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '1.5rem', 
      borderRadius: '0.75rem',
      border: '1px solid var(--border)',
      marginTop: '1rem'
    }}>
      <form action={action}>
        <input type="hidden" name="hubId" value={hubId} />
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Source Name</label>
          <input 
            name="name" 
            className={styles.input} 
            placeholder="e.g. My Favorite Channel" 
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Source Type</label>
          <select name="type" className={styles.input} style={{ appearance: 'auto' }}>
            <option value="youtube">YouTube</option>
            <option value="rss">RSS Feed</option>
            <option value="rumble">Rumble</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>URL</label>
          <input 
            name="url" 
            className={styles.input} 
            placeholder="https://..." 
            required 
          />
        </div>

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className={styles.btnPrimary} style={{ padding: '0.5rem 1rem' }} disabled={isPending}>
            {isPending ? 'Adding...' : 'Save Source'}
          </button>
          <button type="button" className={styles.secondaryButton} style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
