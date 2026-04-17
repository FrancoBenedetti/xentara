'use client'

import { useState } from 'react'
import SourceFormPanel from './SourceFormPanel'

export default function AddSourceForm({ hubId }: { hubId: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
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
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
        onClick={() => setOpen(true)}
      >
        + ADD SOURCE CHANNEL
      </button>

      {open && (
        <SourceFormPanel hubId={hubId} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
