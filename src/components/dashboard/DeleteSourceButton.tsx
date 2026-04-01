'use client'

import { removeSource } from '@/app/dashboard/actions'
import { useState } from 'react'

export default function DeleteSourceButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this source?")) return
    setIsPending(true)
    try {
      await removeSource(id)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      title="Delete this monitored source"
      style={{
        background: 'rgba(239, 68, 68, 0.05)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        color: '#f87171',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0.4rem',
        borderRadius: '0.4rem',
        transition: 'all 0.2s',
        opacity: isPending ? 0.5 : 1
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  )
}
