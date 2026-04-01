'use client'

import { refreshSource } from '@/app/dashboard/actions'
import { useState } from 'react'

export default function RefreshSourceButton({ id, url, type }: { id: string, url: string, type: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleRefresh = async () => {
    setIsPending(true)
    try {
      await refreshSource(id, url, type)
      // Feedback delay
      setTimeout(() => setIsPending(false), 2000)
    } catch (e) {
      console.error("Scan trigger failed", e)
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleRefresh}
      disabled={isPending}
      title={isPending ? "Scanning..." : "Manually trigger a sync"}
      style={{
        background: isPending ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.05)',
        border: '1px solid rgba(52, 211, 153, 0.2)',
        color: '#34d399',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '0.4rem',
        borderRadius: '0.4rem',
        transition: 'all 0.2s',
        opacity: isPending ? 0.7 : 1
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: isPending ? 'spin 1s linear infinite' : 'none' }}>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 16h5v5" />
      </svg>
      {isPending && <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>}
    </button>
  )
}
