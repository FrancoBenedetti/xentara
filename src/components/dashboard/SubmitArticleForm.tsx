'use client'

import { useState } from 'react'
import { submitAdHocArticle } from '@/app/dashboard/actions'
import styles from '@/app/dashboard/dashboard.module.css'

interface SubmitArticleFormProps {
  hubId: string
  onSuccess?: () => void
}

export default function SubmitArticleForm({ hubId, onSuccess }: SubmitArticleFormProps) {
  const [url, setUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      await submitAdHocArticle(hubId, url)
      setSuccess(true)
      setUrl('')
      if (onSuccess) onSuccess()
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit article')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ 
      background: 'rgba(255, 255, 255, 0.03)', 
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px', 
      padding: '1.25rem',
      marginBottom: '1.5rem',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      backdropFilter: 'blur(4px)'
    }}>
      <h5 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
        📥 AD-HOC INTEL SUBMISSION
      </h5>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste article or video URL..."
            required
            className={styles.input}
            style={{ 
              width: '100%', 
              padding: '0.75rem 1rem', 
              background: 'rgba(0, 0, 0, 0.2)', 
              borderRadius: '8px', 
              fontSize: '0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !url}
          style={{
            padding: '0 1.5rem',
            background: 'var(--indigo)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 900,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: isSubmitting || !url ? 0.5 : 1,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
          }}
        >
          {isSubmitting ? 'PROCESSING...' : 'ANALYZE'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '0.75rem', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700 }}>
          ❌ {error.toUpperCase()}
        </div>
      )}

      {success && (
        <div style={{ marginTop: '0.75rem', color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>
          ✅ NEURAL LINK ESTABLISHED. PROCESSING STARTED.
        </div>
      )}
    </div>
  )
}
