'use client'

import { useState } from 'react'
import { Publication, publishPublication } from '@/app/dashboard/actions'

interface Props {
  publication: Publication;
  onClose: () => void;
}

export default function RepublishModal({ publication, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: publication.title,
    byline: publication.byline || '',
    summary: publication.summary || '',
    curator_commentary: publication.curator_commentary || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('byline', formData.byline)
      data.append('summary', formData.summary)
      data.append('curator_commentary', formData.curator_commentary)
      
      await publishPublication(publication.id, data)
      onClose()
    } catch (err) {
      alert('Failed to publish. Check console.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: '800px', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>REFINE & PUBLISH</h2>
            <p style={{ fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 800, textTransform: 'uppercase' }}>Human-in-the-loop Finalization</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </header>

        <form onSubmit={handleSubmit} style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Refined Title</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Refined Byline (One-sentence punch)</label>
            <textarea 
              value={formData.byline} 
              onChange={e => setFormData({...formData, byline: e.target.value})}
              rows={2}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600, resize: 'none' }}
            />
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--indigo)' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--indigo)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Curator Insight (Human Added Value)</label>
            <textarea 
              value={formData.curator_commentary} 
              onChange={e => setFormData({...formData, curator_commentary: e.target.value})}
              placeholder="What makes this content significant right now? Add your professional lens..."
              rows={4}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Modern Markdown Summary</label>
            <textarea 
              value={formData.summary} 
              onChange={e => setFormData({...formData, summary: e.target.value})}
              rows={8}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: 1.6 }}
            />
          </div>

          <footer style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, cursor: 'pointer' }}>CANCEL</button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ padding: '0.8rem 2.5rem', background: 'var(--indigo)', border: 'none', borderRadius: '0.75rem', color: 'white', fontWeight: 900, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)' }}
            >
              {loading ? 'PUBLISHING...' : 'CONFIRM & PUBLISH'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
