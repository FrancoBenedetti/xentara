'use client'

import { useState } from 'react'
import { confirmTag, deleteTag, mergeTags } from '@/app/dashboard/taxonomy/actions'
import styles from '@/app/dashboard/dashboard.module.css'

interface Tag {
  id: string
  name: string
  description: string
  is_confirmed: boolean
}

interface Hub {
  id: string
  name: string
}

export default function TaxonomyStudio({ 
  initialHubs, 
  initialTaxonomy 
}: { 
  initialHubs: Hub[], 
  initialTaxonomy: { confirmed: Tag[], unconfirmed: Tag[] } 
}) {
  const [hubs] = useState(initialHubs)
  const [selectedHubId, setSelectedHubId] = useState(hubs[0]?.id || '')
  const [taxonomy, setTaxonomy] = useState(initialTaxonomy)
  const [isMerging, setIsMerging] = useState<string | null>(null) // Tag ID being merged
  const [mergeTargetId, setMergeTargetId] = useState('')

  const handleConfirm = async (tagId: string) => {
    try {
      await confirmTag(tagId)
      // Local update for optimistic UI or just refresh
      setTaxonomy(prev => {
        const tag = prev.unconfirmed.find(t => t.id === tagId)
        if (!tag) return prev
        return {
          confirmed: [...prev.confirmed, { ...tag, is_confirmed: true }].sort((a, b) => a.name.localeCompare(b.name)),
          unconfirmed: prev.unconfirmed.filter(t => t.id !== tagId)
        }
      })
    } catch (err) {
      alert('Failed to confirm tag')
    }
  }

  const handleDelete = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this flavor? This will remove it from all publications.')) return
    try {
      await deleteTag(tagId)
      setTaxonomy(prev => ({
        confirmed: prev.confirmed.filter(t => t.id !== tagId),
        unconfirmed: prev.unconfirmed.filter(t => t.id !== tagId)
      }))
    } catch (err) {
      alert('Failed to delete tag')
    }
  }

  const handleMerge = async (sourceId: string) => {
    if (!mergeTargetId) return
    try {
      await mergeTags(sourceId, mergeTargetId)
      setTaxonomy(prev => ({
        confirmed: prev.confirmed.filter(t => t.id !== sourceId),
        unconfirmed: prev.unconfirmed.filter(t => t.id !== sourceId)
      }))
      setIsMerging(null)
      setMergeTargetId('')
    } catch (err) {
      alert('Failed to merge tags')
    }
  }

  return (
    <div className={styles.taxonomyStudio}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className={styles.mainTitle}>Taxonomy Studio</h2>
          <p className={styles.mainSubtitle}>Manage the intelligence lenses for your collectives.</p>
        </div>
        
        <select 
          value={selectedHubId} 
          onChange={(e) => setSelectedHubId(e.target.value)}
          className={styles.input}
          style={{ width: '200px' }}
        >
          {hubs.map(hub => (
            <option key={hub.id} value={hub.id}>{hub.name}</option>
          ))}
        </select>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* AI SUGGESTIONS SECTION */}
        <section className={styles.sectionArea} style={{ borderBottom: 'none' }}>
          <h3 className={styles.sectionTitle} style={{ color: 'var(--indigo)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span> AI Suggested Flavors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {taxonomy.unconfirmed.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No new suggestions from the pipeline.</p>
            ) : (
              taxonomy.unconfirmed.map(tag => (
                <div key={tag.id} className={styles.hubCard} style={{ cursor: 'default', padding: '1.25rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)' }}>{tag.name}</h4>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{tag.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => handleConfirm(tag.id)} className={styles.btnPrimary} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>CONFIRM</button>
                         <button onClick={() => setIsMerging(tag.id)} style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', fontSize: '0.7rem', borderRadius: '0.5rem', fontWeight: 800 }}>MERGE</button>
                         <button onClick={() => handleDelete(tag.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--text-main)', border: '1px solid #ef4444', padding: '0.4rem 0.8rem', fontSize: '0.7rem', borderRadius: '0.5rem', fontWeight: 800 }}>DELETE</button>
                      </div>
                   </div>

                   {isMerging === tag.id && (
                     <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>MERGE INTO:</span>
                       <select 
                         value={mergeTargetId} 
                         onChange={(e) => setMergeTargetId(e.target.value)}
                         className={styles.input}
                         style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}
                       >
                         <option value="">Select Target...</option>
                         {taxonomy.confirmed.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                       </select>
                       <button onClick={() => handleMerge(tag.id)} disabled={!mergeTargetId} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.7rem', borderRadius: '0.5rem', opacity: mergeTargetId ? 1 : 0.5 }}>GO</button>
                       <button onClick={() => setIsMerging(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}>CANCEL</button>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* CONFIRMED FLAVORS SECTION */}
        <section className={styles.sectionArea} style={{ borderBottom: 'none' }}>
          <h3 className={styles.sectionTitle}>Confirmed Lenses</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {taxonomy.confirmed.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No confirmed flavors yet. Review suggestions or add manually.</p>
            ) : (
              taxonomy.confirmed.map(tag => (
                <div key={tag.id} className={styles.hubCard} style={{ cursor: 'default', padding: '1.25rem', borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontWeight: 900, fontSize: '0.9rem', color: 'var(--text-main)' }}>{tag.name} <span style={{ color: 'var(--indigo)', marginLeft: '0.5rem', fontWeight: 400 }}>✓</span></h4>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{tag.description}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => handleDelete(tag.id)} style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid #ef4444', padding: '0.4rem 0.8rem', fontSize: '0.7rem', borderRadius: '0.5rem', fontWeight: 800 }}>DELETE</button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
