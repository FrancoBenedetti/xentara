'use client'

import { createHub } from '@/app/dashboard/actions'
import styles from '@/app/dashboard/dashboard.module.css'
import { useState, useActionState } from 'react'

export default function CreateHubForm({ isEmailConfirmed = false }: { isEmailConfirmed?: boolean }) {
  const [showForm, setShowForm] = useState(false)
  
  // React 19 / Next 15 Pattern
  const [error, action, isPending] = useActionState(
    async (prev: any, formData: FormData) => {
      try {
        await createHub(formData)
        setShowForm(false)
        return null
      } catch (err: any) {
        return err.message
      }
    },
    null
  )

  if (!showForm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          className={styles.btnPrimary}
          onClick={() => isEmailConfirmed ? setShowForm(true) : null}
          disabled={!isEmailConfirmed}
          style={!isEmailConfirmed ? { opacity: 0.5, cursor: 'not-allowed', filter: 'grayscale(1)' } : {}}
        >
          + Add New Hub
        </button>
        {!isEmailConfirmed && (
          <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 800, textTransform: 'uppercase' }}>
            Verification Required
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.05)', 
      padding: '2rem', 
      borderRadius: '1rem',
      border: '1px solid var(--border)',
      marginBottom: '2rem'
    }}>
      <form action={action}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Hub Name</label>
          <input 
            id="name"
            name="name"
            type="text" 
            className={styles.input} 
            placeholder="E.g. Bio-Tech Community"
            required
            disabled={isPending}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="slug">Slug (Unique URL identifier)</label>
          <input 
            id="slug"
            name="slug"
            type="text" 
            className={styles.input} 
            placeholder="e.g. biotech"
            required
            pattern="^[a-z0-9-]+$"
            title="Only lowercase letters, numbers, and hyphens"
            disabled={isPending}
          />
        </div>
        
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            className={styles.btnPrimary}
            disabled={isPending}
          >
            {isPending ? 'Creating...' : 'Create Hub'}
          </button>
          <button 
            type="button" 
            className={styles.input} 
            style={{ width: 'auto' }}
            onClick={() => setShowForm(false)}
            disabled={isPending}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
