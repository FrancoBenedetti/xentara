'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Publication, publishPublication } from '@/app/dashboard/actions'

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
}

export default function RepublishModal({ publication, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'markdown' | 'html'>('markdown')
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
