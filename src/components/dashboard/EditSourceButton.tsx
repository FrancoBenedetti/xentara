'use client'

import { useState } from 'react'
import SourceFormPanel from './SourceFormPanel'
import type { MonitoredSource } from '@/app/dashboard/actions'

export default function EditSourceButton({ source }: { source: MonitoredSource }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Edit this monitored source"
        style={{
          background: 'rgba(96, 165, 250, 0.05)',
          border: '1px solid rgba(96, 165, 250, 0.2)',
          color: 'var(--indigo)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: '0.4rem',
          borderRadius: '0.4rem',
          transition: 'all 0.2s',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      {open && (
        <SourceFormPanel
          hubId={source.hub_id}
          source={source}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
