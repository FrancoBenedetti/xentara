'use client'

import { useState, useTransition, useEffect } from 'react'
import { getHubTags, updateHubStrictness, confirmHubTag, removeHubTag, addHubTag, updateHubTag } from '@/app/dashboard/actions'

export default function TaxonomyManager({ hubId, initialStrictness }: { hubId: string, initialStrictness: string }) {
  const [tags, setTags] = useState<any[]>([])
  const [strictness, setStrictness] = useState(initialStrictness)
  const [isPending, startTransition] = useTransition()
  const [newTag, setNewTag] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ name: '', description: '' })

  const loadTags = () => {
    getHubTags(hubId).then(setTags)
  }

  useEffect(() => {
    loadTags()
  }, [hubId])

  const handleToggleStrictness = async () => {
    const next = strictness === 'exploratory' ? 'strict' : 'exploratory'
    startTransition(async () => {
        await updateHubStrictness(hubId, next)
        setStrictness(next)
    })
  }

  const handleConfirm = async (tagId: string) => {
    startTransition(async () => {
        await confirmHubTag(tagId)
        loadTags()
    })
  }

  const handleEditInit = (tag: any) => {
    setEditingId(tag.id)
    setEditValues({ name: tag.name, description: tag.description || '' })
  }

  const handleUpdate = async (tagId: string) => {
    startTransition(async () => {
        await updateHubTag(tagId, editValues.name, editValues.description)
        setEditingId(null)
        loadTags()
    })
  }

  const handleRemove = async (tagId: string) => {
    if (!confirm("Remove this flavor Lens?")) return
    startTransition(async () => {
        await removeHubTag(tagId)
        loadTags()
    })
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name) return
    startTransition(async () => {
        await addHubTag(hubId, newTag.name, newTag.description)
        setNewTag({ name: '', description: '' })
        loadTags()
    })
  }

  return (
    <div style={{ marginTop: '3rem', borderTop: '2px solid var(--border)', paddingTop: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>INTEL FLAVORS</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Manage intelligence lenses and AI discovery rules.</p>
        </div>
        
        <button 
           onClick={handleToggleStrictness}
           disabled={isPending}
           style={{ 
             background: strictness === 'strict' ? 'var(--indigo)' : 'var(--bg-input)', 
             color: strictness === 'strict' ? '#ffffff' : 'var(--indigo)',
             border: '1px solid var(--indigo)',
             padding: '0.4rem 1.25rem',
             borderRadius: '2rem',
             fontSize: '0.65rem',
             fontWeight: 900,
             cursor: 'pointer',
           }}
        >
          MODE: {strictness.toUpperCase()}
        </button>
      </header>

      {/* ADD FORM */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
         <input 
            placeholder="New Tag Name..." 
            value={newTag.name} onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '0.4rem', flex: 1, fontWeight: 700 }}
         />
         <input 
            placeholder="Semantic Description..." 
            value={newTag.description} onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.5rem', borderRadius: '0.4rem', flex: 2, fontWeight: 600 }}
         />
         <button type="submit" style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.4rem 1.25rem', borderRadius: '0.4rem', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}>+ ADD</button>
      </form>

      {/* FLAVOR LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {tags.map(tag => (
          <div key={tag.id} style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: '1rem', border: `1px solid ${tag.is_confirmed ? 'var(--border)' : '#ef4444'}`, boxShadow: 'var(--card-shadow)' }}>
            {editingId === tag.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   <input 
                      value={editValues.name} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--indigo)', color: 'var(--text-main)', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '0.4rem', fontWeight: 900 }}
                   />
                   <textarea 
                      value={editValues.description} onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--indigo)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.6rem', borderRadius: '0.4rem', fontWeight: 600, minHeight: '60px', fontFamily: 'inherit' }}
                   />
                   <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleUpdate(tag.id)} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}>SAVE CHANGES</button>
                      <button onClick={() => setEditingId(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.4rem 1rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}>CANCEL</button>
                   </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)' }}>#{tag.name.toUpperCase()}</span>
                    {!tag.is_confirmed && (
                      <span style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.5rem', fontWeight: 900, padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #ef4444' }}>UNCONFIRMED AI DRAFT</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>{tag.description}</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!tag.is_confirmed ? (
                    <button onClick={() => handleConfirm(tag.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}>APPROVE</button>
                  ) : null}
                  <button onClick={() => handleEditInit(tag)} style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.3rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}>EDIT</button>
                  <button onClick={() => handleRemove(tag.id)} style={{ background: 'transparent', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}>PURGE</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
