'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Publication, publishPublication, getPublicationTags, setPublicationTagSuppression, updateHubTag, searchConfirmedTags, addPublicationTag } from '@/app/dashboard/actions'

const SimpleMarkdown = ({ children }: { children: string }) => {
  if (!children) return null;

  // Render markdown tables
  let parsingTable = false;
  let tableRows: string[] = [];
  const lines = children.split('\n');
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
    
    if (isTableLine) {
      if (!parsingTable) parsingTable = true;
      if (/^\|[-:| ]+\|$/.test(line.trim())) {
        continue; // skip separator row
      }
      
      const isHeader = tableRows.length === 0;
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      const rowContent = cells.map(c => 
        isHeader ? `<th style="padding: 0.5rem; border-bottom: 2px solid var(--border); text-align: left; background: rgba(99, 102, 241, 0.05);">${c}</th>`
                 : `<td style="padding: 0.5rem; border-bottom: 1px solid var(--border);">${c}</td>`
      ).join('');
      
      tableRows.push(`<tr>${rowContent}</tr>`);
    } else {
      if (parsingTable) {
        processedLines.push(`<div style="overflow-x: auto; margin-bottom: 1rem;"><table style="width: 100%; border-collapse: collapse; border: 1px solid var(--border); font-size: 0.8rem;"><tbody>${tableRows.join('')}</tbody></table></div>`);
        parsingTable = false;
        tableRows = [];
      }
      processedLines.push(line);
    }
  }

  if (parsingTable) {
    processedLines.push(`<div style="overflow-x: auto; margin-bottom: 1rem;"><table style="width: 100%; border-collapse: collapse; border: 1px solid var(--border); font-size: 0.8rem;"><tbody>${tableRows.join('')}</tbody></table></div>`);
  }

  // Naive markdown parser for other elements
  let html = processedLines.join('\n')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.1rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 900; margin-top: 1rem; margin-bottom: 1rem;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--indigo); text-decoration: underline;">$1</a>')
    .replace(/^\*(.+)/gm, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>')
    .replace(/^-(.+)/gm, '<li style="margin-left: 1.5rem; list-style-type: disc;">$1</li>');

  const paragraphs = html.split(/\n\n+/).map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<li') || p.trim().startsWith('<ul') || p.trim().startsWith('<div')) return p;
    return `<p style="margin-bottom: 1rem;">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');

  return <div style={{ color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} dangerouslySetInnerHTML={{ __html: paragraphs }} />;
}

interface Props {
  publication: Publication;
  onClose: () => void;
  hubRole?: string;
}

export default function RepublishModal({ publication, onClose, hubRole }: Props) {
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'markdown' | 'html'>('markdown')
  const [formData, setFormData] = useState({
    title: publication.title,
    byline: publication.byline || '',
    synopsis: publication.synopsis || '',
    summary: publication.summary || '',
    curator_commentary: publication.curator_commentary || ''
  })
  type TagEntry = { id: string; name: string; tag_id: string; is_suppressed: boolean; description?: string }
  const [tags, setTags] = useState<TagEntry[]>([])

  useEffect(() => {
    getPublicationTags(publication.id).then(setTags).catch(console.error)
  }, [publication.id])

  // R2 – inline flavor label edit
  const [editingTagId, setEditingTagId] = useState<string | null>(null)
  const [editingTagName, setEditingTagName] = useState('')
  const [savingTagEdit, setSavingTagEdit] = useState(false)

  const handleTagLabelSave = async (tag: TagEntry) => {
    const trimmed = editingTagName.trim()
    if (!trimmed || trimmed === tag.name) { setEditingTagId(null); return }
    setSavingTagEdit(true)
    try {
      await updateHubTag(tag.tag_id, trimmed, tag.description || '')
      setTags(prev => prev.map(t => t.id === tag.id ? { ...t, name: trimmed } : t))
      setEditingTagId(null)
    } catch (e) { console.error(e) }
    finally { setSavingTagEdit(false) }
  }

  // R3 – add-flavor combobox
  const [showAddFlavor, setShowAddFlavor] = useState(false)
  const [flavorQuery, setFlavorQuery] = useState('')
  const [flavorResults, setFlavorResults] = useState<{ id: string; name: string; description: string }[]>([])
  const [searchingFlavors, setSearchingFlavors] = useState(false)

  const handleFlavorSearch = async (q: string) => {
    setFlavorQuery(q)
    if (!q.trim()) { setFlavorResults([]); return }
    setSearchingFlavors(true)
    try {
      const excludeIds = tags.map(t => t.tag_id)
      setFlavorResults(await searchConfirmedTags(publication.hub_id, q, excludeIds))
    } catch (e) { console.error(e) }
    finally { setSearchingFlavors(false) }
  }

  const handleAddFlavor = async (flavor: { id: string; name: string; description: string }) => {
    try {
      await addPublicationTag(publication.id, flavor.id)
      setTags(prev => [...prev, { id: `opt-${flavor.id}`, tag_id: flavor.id, name: flavor.name, description: flavor.description, is_suppressed: false }])
      setFlavorResults([]); setFlavorQuery(''); setShowAddFlavor(false)
    } catch (e) { console.error(e); alert('Failed to add flavor') }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('byline', formData.byline)
      data.append('synopsis', formData.synopsis)
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

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const modalContent = (
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
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 800 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Refined Byline (One-sentence punch)</label>
            <textarea 
              value={formData.byline} 
              onChange={e => setFormData({...formData, byline: e.target.value})}
              rows={2}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600, resize: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Refined Synopsis (AI Generated)</label>
            <textarea 
              value={formData.synopsis} 
              onChange={e => setFormData({...formData, synopsis: e.target.value})}
              rows={3}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600, resize: 'none' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirmed Hub Flavors
              </label>
              <button
                type="button"
                onClick={() => { setShowAddFlavor(v => !v); setFlavorQuery(''); setFlavorResults([]) }}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 900, borderRadius: '1rem', border: '1px solid var(--indigo)', background: showAddFlavor ? 'rgba(99,102,241,0.15)' : 'transparent', color: 'var(--indigo)', cursor: 'pointer' }}
              >
                {showAddFlavor ? '✕ CANCEL' : '+ ADD FLAVOR'}
              </button>
            </div>

            {tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {tags.map(tag => (
                  <div key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {editingTagId === tag.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid var(--indigo)', borderRadius: '2rem', padding: '0.25rem 0.6rem', background: 'rgba(99,102,241,0.08)' }}>
                        <input
                          autoFocus
                          value={editingTagName}
                          onChange={e => setEditingTagName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleTagLabelSave(tag); if (e.key === 'Escape') setEditingTagId(null) }}
                          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--indigo)', fontWeight: 800, fontSize: '0.75rem', width: `${Math.max(editingTagName.length, 4)}ch` }}
                        />
                        <button type="button" onClick={() => handleTagLabelSave(tag)} disabled={savingTagEdit} style={{ background: 'none', border: 'none', color: 'var(--indigo)', cursor: 'pointer', fontWeight: 900, fontSize: '0.7rem', padding: 0 }}>✓</button>
                        <button type="button" onClick={() => setEditingTagId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}>✕</button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          const newSuppressed = !tag.is_suppressed
                          setTags(tags.map(t => t.id === tag.id ? { ...t, is_suppressed: newSuppressed } : t))
                          await setPublicationTagSuppression([tag.id], newSuppressed)
                        }}
                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: `1px solid ${tag.is_suppressed ? 'var(--border)' : 'var(--indigo)'}`, background: tag.is_suppressed ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.1)', color: tag.is_suppressed ? 'var(--text-muted)' : 'var(--indigo)', cursor: 'pointer', transition: 'all 0.2s', opacity: tag.is_suppressed ? 0.6 : 1 }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tag.is_suppressed ? 'var(--text-muted)' : 'var(--indigo)', boxShadow: tag.is_suppressed ? 'none' : '0 0 8px var(--indigo)' }}></span>
                        {tag.name.toUpperCase()}
                        {tag.is_suppressed && <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>(EXCLUDED)</span>}
                      </button>
                    )}
                    {editingTagId !== tag.id && (hubRole === 'owner' || hubRole === 'editor') && (
                      <button
                        type="button"
                        title="Edit label"
                        onClick={() => { setEditingTagId(tag.id); setEditingTagName(tag.name) }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', padding: '0.1rem 0.2rem', lineHeight: 1, opacity: 0.6, transition: 'opacity 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      >
                        ✎
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem', background: 'var(--bg-input)', borderRadius: '0.75rem', border: '1px dotted var(--border)' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                  No confirmed hub flavors linked to this item. {publication.tags?.length > 0 ? `(Raw keywords: ${publication.tags.join(', ')})` : ''}
                </p>
              </div>
            )}

            {showAddFlavor && (
              <div style={{ marginTop: '0.85rem', background: 'var(--bg-input)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search hub flavors…"
                  value={flavorQuery}
                  onChange={e => handleFlavorSearch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.9rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                />
                {searchingFlavors && <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Searching…</p>}
                {flavorResults.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {flavorResults.map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => handleAddFlavor(f)}
                        style={{ textAlign: 'left', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.55rem 0.8rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--indigo)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-main)' }}>#{f.name.toUpperCase()}</div>
                        {f.description && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', lineHeight: 1.4 }}>{f.description}</div>}
                      </button>
                    ))}
                  </div>
                )}
                {!searchingFlavors && flavorQuery.trim() && flavorResults.length === 0 && (
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No matching flavors found.</p>
                )}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--indigo)' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: 'var(--indigo)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Curator Insight (Human Added Value)</label>
            <textarea 
              value={formData.curator_commentary} 
              onChange={e => setFormData({...formData, curator_commentary: e.target.value})}
              placeholder="What makes this content significant right now? Add your professional lens..."
              rows={4}
              style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Modern Markdown Summary</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('markdown')}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: '1px solid ' + (viewMode === 'markdown' ? 'var(--indigo)' : 'var(--border)'),
                    background: viewMode === 'markdown' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: viewMode === 'markdown' ? 'var(--indigo)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  EDIT
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('html')}
                  style={{
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    borderRadius: '4px',
                    border: '1px solid ' + (viewMode === 'html' ? 'var(--indigo)' : 'var(--border)'),
                    background: viewMode === 'html' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    color: viewMode === 'html' ? 'var(--indigo)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  PREVIEW
                </button>
              </div>
            </div>
            {viewMode === 'markdown' ? (
              <textarea 
                value={formData.summary} 
                onChange={e => setFormData({...formData, summary: e.target.value})}
                rows={8}
                style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', fontFamily: 'monospace', lineHeight: 1.6 }}
              />
            ) : (
              <div className="markdown-preview" style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.75rem', color: 'var(--text-main)', fontSize: '0.875rem', lineHeight: 1.6, overflowY: 'auto', maxHeight: '400px' }}>
                <SimpleMarkdown>{formData.summary}</SimpleMarkdown>
              </div>
            )}
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

  return createPortal(modalContent, document.body)
}
