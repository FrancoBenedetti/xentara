'use client'

import { addSource, createRouteRequest, searchRSSHubRoutesAction, previewRSSHubRouteAction } from '@/app/dashboard/actions'
import { useState, useTransition, useEffect } from 'react'
import type { RSSHubRouteSuggestion } from '@/utils/sourcing/rsshub'

export default function AddSourceForm({ hubId }: { hubId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState('youtube')

  // Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<RSSHubRouteSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Preview State
  const [previewRoute, setPreviewRoute] = useState<string | null>(null)
  const [previewItems, setPreviewItems] = useState<any[]>([])
  const [isPreviewing, setIsPreviewing] = useState(false)

  useEffect(() => {
    if (type !== 'rsshub' || searchTerm.length < 3) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchRSSHubRoutesAction(searchTerm)
        setSuggestions(results)
      } catch (e) {
        setSuggestions([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, type])

  const handlePreview = async (routePath: string) => {
    setPreviewRoute(routePath)
    setIsPreviewing(true)
    setError(null)
    setPreviewItems([])

    try {
      const data = await previewRSSHubRouteAction(routePath)
      setPreviewItems(data.items?.slice(0, 3) || [])
    } catch (e: any) {
      setError(e.message || "Preview failed")
      setPreviewRoute(null)
    } finally {
      setIsPreviewing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      try {
        await addSource(hubId, formData)
        setShowForm(false)
        resetForm()
      } catch (err: any) {
        setError(err.message || 'Failed to add source')
      }
    })
  }

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const url = formData.get('target_url') as string
    const instructions = formData.get('instructions') as string
    const access = formData.get('access_notes') as string

    startTransition(async () => {
      try {
        await createRouteRequest(hubId, url, instructions, access)
        setShowRequestForm(false)
        setShowForm(false)
        resetForm()
      } catch (err: any) {
        setError(err.message || 'Failed to request route')
      }
    })
  }

  const resetForm = () => {
    setSearchTerm('')
    setSuggestions([])
    setPreviewRoute(null)
    setPreviewItems([])
    setType('youtube')
    setShowRequestForm(false)
  }

  if (!showForm) {
    return (
      <div style={{ position: 'relative' }}>
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
              letterSpacing: '0.05em'
          }}
          onClick={() => setShowForm(true)}
        >
          + ADD SOURCE CHANNEL
        </button>
      </div>
    )
  }

  if (showRequestForm) {
    return (
      <div style={{ position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 'calc(100% + 0.5rem)', 
        right: 0, 
        width: '320px', 
        zIndex: 50, 
        background: 'var(--bg-primary)', 
        padding: '1.25rem', 
        borderRadius: '0.75rem', 
        border: '1px solid var(--border)',
        boxShadow: 'var(--card-shadow)'
      }}>
        <h3 style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Request RSSHub Route</h3>
        <form onSubmit={handleRequestSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>Target URL</label>
            <input name="target_url" required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>Instructions</label>
            <textarea name="instructions" rows={3} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)' }}>Access Notes / API Keys</label>
            <input name="access_notes" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }} />
          </div>
          {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.75rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" disabled={isPending} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
              {isPending ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </button>
            <button type="button" onClick={() => setShowRequestForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
              BACK
            </button>
          </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
    <div style={{ 
      position: 'absolute',
      top: 'calc(100% + 0.5rem)',
      right: 0,
      width: '320px',
      zIndex: 50,
      background: 'var(--bg-primary)', 
      padding: '1.25rem', 
      borderRadius: '0.75rem',
      border: '1px solid var(--border)',
      boxShadow: 'var(--card-shadow)'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Source Type</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', background: 'var(--bg-surface)', colorScheme: 'dark', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }}>
            <option value="youtube">YouTube</option>
            <option value="rss">Standard RSS Feed</option>
            <option value="rsshub">RSSHub Managed Route</option>
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>Source Name</label>
          <input 
            name="name" 
            placeholder={type === 'rsshub' ? "Route Name" : "e.g. Andrei Jikh"} 
            required 
            style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            {type === 'rsshub' ? 'RSSHub Route Path / Search' : 'URL or Handle'}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              name="url" 
              value={previewRoute || searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                if (previewRoute) setPreviewRoute(null)
              }}
              placeholder={type === 'rsshub' ? "/maroelamedia/nuus or search..." : "https://... or @handle"} 
              required 
              style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.875rem' }}
            />
            {type === 'rsshub' && !previewRoute && searchTerm.length > 2 && (
              <button 
                type="button" 
                onClick={() => handlePreview(searchTerm)} 
                style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                PREVIEW
              </button>
            )}
          </div>

          {type === 'rsshub' && !previewRoute && !searchTerm && (
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: '1.4' }}>
              ℹ️ Try searching for a website name (e.g. YouTube) or browse the <a href="https://docs.rsshub.app/routes/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--indigo)', textDecoration: 'underline' }}>available routes directory</a>. You can also paste an exact route path if you know it.
            </div>
          )}
          
          {type === 'rsshub' && !previewRoute && searchTerm && (
            <div style={{ marginTop: '0.5rem' }}>
              {isSearching && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching...</div>}
              {suggestions.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: 'rgba(0,0,0,0.2)', borderRadius: '0.4rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {suggestions.map((s, index) => (
                    <li key={`${s.path}-${index}`} style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => {
                        let targetPath = s.path;
                        if (s.example) {
                          try {
                            const url = new URL(s.example);
                            targetPath = url.pathname + url.search;
                          } catch(e) {}
                        }
                        setSearchTerm(targetPath)
                        handlePreview(targetPath)
                      }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.example ? new URL(s.example).pathname + new URL(s.example).search : s.path}</div>
                    </li>
                  ))}
                </ul>
              )}
              {searchTerm.length > 2 && suggestions.length === 0 && !isSearching && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  No match found. <span style={{ color: 'var(--indigo)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowRequestForm(true)}>Request a new route?</span>
                </div>
              )}
            </div>
          )}
        </div>

        {previewRoute && type === 'rsshub' && (
          <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.1)', borderRadius: '0.4rem', border: '1px solid var(--border)' }}>
            <h4 style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feed Preview</span>
              <button type="button" onClick={() => setPreviewRoute(null)} style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✕</button>
            </h4>
            
            <style jsx>{`
              .rss-preview-content {
                max-height: 80px;
                overflow: hidden;
                position: relative;
                font-size: 0.7rem;
                line-height: 1.4;
              }
              .rss-preview-content img {
                max-width: 100% !important;
                max-height: 60px !important;
                object-fit: cover;
                border-radius: 4px;
                display: block;
                margin: 0.25rem 0;
              }
              .rss-preview-content iframe, 
              .rss-preview-content video {
                display: none !important;
              }
              .rss-preview-content::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0; right: 0;
                height: 25px;
                background: linear-gradient(transparent, rgba(0,0,0,0.4));
              }
            `}</style>
            
            {isPreviewing ? <div style={{ fontSize: '0.75rem', padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading preview...</div> : (
              previewItems.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {previewItems.map((item, i) => (
                    <div key={i} style={{ paddingBottom: '0.75rem', borderBottom: i < previewItems.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      <strong style={{ fontSize: '0.8rem', lineHeight: '1.2', display: 'block', marginBottom: '0.2rem' }}>{item.title}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem', display: 'block', marginBottom: '0.4rem' }}>{item.pubDate || item.date_modified || 'No date'}</span>
                      <div className="rss-preview-content" dangerouslySetInnerHTML={{ __html: item.summary || item.content_html || '' }} />
                    </div>
                  ))}
                </div>
              ) : <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Empty or invalid feed</div>
            )}
          </div>
        )}

        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" disabled={isPending || (type === 'rsshub' && !previewRoute)} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', opacity: isPending || (type === 'rsshub' && !previewRoute) ? 0.5 : 1 }}>
            {isPending ? 'ADDING...' : 'SAVE SOURCE'}
          </button>
          <button type="button" onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}
