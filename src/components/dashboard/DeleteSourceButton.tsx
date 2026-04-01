'use client'

import { deleteSource } from '@/app/dashboard/actions'
import { useTransition } from 'react'

export default function DeleteSourceButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to remove this source? All detected publications will remain in the system but no new ones will be scanned.')) {
        startTransition(async () => {
            try {
                await deleteSource(id)
            } catch (err) {
                alert('Failed to delete source')
                console.error(err)
            }
        })
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{
        background: 'transparent',
        border: 'none',
        color: '#ef4444',
        fontSize: '0.75rem',
        cursor: 'pointer',
        padding: '0.25rem 0.5rem',
        borderRadius: '0.25rem',
        opacity: isPending ? 0.5 : 1,
        textDecoration: 'underline'
      }}
    >
      {isPending ? 'Removing...' : 'Remove'}
    </button>
  )
}
