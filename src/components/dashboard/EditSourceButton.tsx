'use client'

import { useState } from 'react'
import { updateSource } from '@/app/dashboard/actions'
import styles from '@/app/dashboard/dashboard.module.css'

export default function EditSourceButton({ source }: { source: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isPending, setIsPending] = useState(false)

  if (isEditing) {
    return (
      <form 
        action={async (formData) => {
          setIsPending(true)
          try {
            await updateSource(source.id, formData)
            setIsEditing(false)
          } catch (e: any) {
            alert(e.message)
          } finally {
            setIsPending(false)
          }
        }}
        style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.75rem', marginTop: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '-0.25rem' }}>EDIT SOURCE</div>
          <input 
            name="name" 
            defaultValue={source.name} 
            className={styles.input} 
            placeholder="Display Name" 
            autoFocus
          />
          <input 
            name="url" 
            defaultValue={source.url} 
            className={styles.input} 
            placeholder="URL (Youtube/RSS)" 
          />
          <select name="type" defaultValue={source.type} className={styles.input}>
            <option value="youtube">YouTube</option>
            <option value="rss">RSS Feed</option>
            <option value="rumble">Rumble</option>
          </select>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="submit" disabled={isPending} className={styles.primary} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              {isPending ? 'Saving...' : 'Update Source'}
            </button>
            <button type="button" onClick={() => setIsEditing(false)} className={styles.secondary} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <button 
      onClick={() => setIsEditing(true)} 
      style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: '0.7rem', cursor: 'pointer', padding: '0.25rem 0.5rem', fontWeight: 600, textDecoration: 'underline' }}
    >
      Edit
    </button>
  )
}
