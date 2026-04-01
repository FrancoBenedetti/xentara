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
      setTimeout(() => setIsPending(false), 3000)
    } catch (e) {
      alert("Failed to trigger scan")
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleRefresh}
      disabled={isPending}
      title="Manually trigger a scan for new content"
      style={{
        background: 'transparent',
        border: 'none',
        color: '#10b981',
        fontSize: '0.7rem',
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        fontWeight: 600,
        textDecoration: 'underline'
      }}
    >
      {isPending ? 'Scanning...' : 'Scan Now'}
    </button>
  )
}
