'use client'

import { reprocessPublication } from '@/app/dashboard/actions'
import { useTransition } from 'react'

export default function ReprocessButton({ id, url }: { id: string, url: string }) {
  const [isPending, startTransition] = useTransition()

  const handleReprocess = () => {
    // Basic confirmation to prevent accidental clicks
    if (!window.confirm("Are you sure you want to regenerate the AI summary and tags?")) return

    startTransition(async () => {
      try {
        await reprocessPublication(id, url)
      } catch (e) {
        console.error("Reprocess error:", e)
        alert("Failed to queue re-processing. Check console for details.")
      }
    })
  }

  return (
    <button 
      onClick={handleReprocess}
      disabled={isPending}
      title="Force AI to regenerate summary and tags"
      style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        color: '#8183ff',
        fontSize: '0.6rem',
        cursor: isPending ? 'wait' : 'pointer',
        padding: '0.15rem 0.4rem',
        borderRadius: '0.25rem',
        opacity: isPending ? 0.6 : 1,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        transition: 'all 0.2s ease'
      }}
    >
      {isPending ? 'Processing...' : 'Regenerate AI'}
    </button>
  )
}
