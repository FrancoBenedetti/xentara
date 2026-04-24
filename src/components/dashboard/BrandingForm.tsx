'use client'

import { updateHubBranding } from '@/app/dashboard/actions'
import { useState, useTransition } from 'react'

export default function BrandingForm({ hub }: { hub: any }) {
  const [isPending, startTransition] = useTransition()
  const [color, setColor] = useState(hub.brand_color || '#6366f1')

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
          await updateHubBranding(hub.id, formData)
        })
      }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}
    >
      <div>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Hub Name</label>
        <input 
          name="name" 
          defaultValue={hub.name} 
          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }} 
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Presentation Base Color</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="color" 
            name="brand_color" 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ width: '40px', height: '40px', border: '1px solid var(--border)', background: 'var(--bg-input)', cursor: 'pointer', borderRadius: '4px' }} 
          />
          <input 
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700, width: '100px' }} 
          />
        </div>
      </div>

      <div>
        <input 
          name="logo_url" 
          defaultValue={hub.logo_url} 
          placeholder="https://..."
          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }} 
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>Curator Commentary Label</label>
        <input 
          name="curator_take_label" 
          defaultValue={hub.curator_take_label ?? ''} 
          placeholder="e.g. Curator's Take, Wat dink ek?"
          style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700 }} 
        />
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Leave blank to use the default label "Curator's Take".
        </p>
      </div>

      <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button 
           type="submit" 
           disabled={isPending}
           style={{ 
             background: 'var(--indigo)', 
             color: '#ffffff', 
             border: 'none', 
             padding: '0.75rem 2rem', 
             borderRadius: '0.75rem', 
             fontSize: '0.8rem', 
             fontWeight: 900, 
             cursor: 'pointer',
             boxShadow: 'var(--card-shadow)',
             transition: 'all 0.2s',
             textTransform: 'uppercase',
             letterSpacing: '0.1em'
           }}
         >
           {isPending ? 'Syncing...' : 'SAVE BRANDING'}
         </button>
      </div>
    </form>
  )
}
