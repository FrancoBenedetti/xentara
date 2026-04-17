'use client'

import { addSource, updateSource, createRouteRequest, searchRSSHubRoutesAction, previewRSSHubRouteAction } from '@/app/dashboard/actions'
import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { RSSHubRouteSuggestion } from '@/utils/sourcing/rsshub'
import type { MonitoredSource } from '@/app/dashboard/actions'

interface SourceFormPanelProps {
  hubId: string
  /** If provided, the panel is in edit mode and pre-fills with this source */
  source?: MonitoredSource
  onClose: () => void
}

export default function SourceFormPanel({ hubId, source, onClose }: SourceFormPanelProps) {
  const isEditing = Boolean(source)

  // Only render the portal after hydration (document is available)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [type, setType] = useState(source?.type ?? 'rsshub')

  // Request-a-route sub-form
  const [showRequestForm, setShowRequestForm] = useState(false)

  // RSSHub search state
  const [searchTerm, setSearchTerm] = useState(() => {
    // In edit mode, seed the search field with the existing URL/route
    return source?.type === 'rsshub' ? (source?.url ?? '') : ''
  })
  const [suggestions, setSuggestions] = useState<RSSHubRouteSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // RSSHub preview state
  const [previewRoute, setPreviewRoute] = useState<string | null>(() => {
    // In edit mode with rsshub type, pre-set the preview route so Save is enabled immediately
    return source?.type === 'rsshub' ? (source?.url ?? null) : null
  })
  const [previewItems, setPreviewItems] = useState<any[]>([])
  const [isPreviewing, setIsPreviewing] = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Debounced RSSHub search
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
      } catch {
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
      setError(e.message || 'Preview failed')
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
        if (isEditing && source) {
          await updateSource(source.id, formData)
        } else {
          await addSource(hubId, formData)
        }
        onClose()
      } catch (err: any) {
        setError(err.message || 'Failed to save source')
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
        onClose()
      } catch (err: any) {
        setError(err.message || 'Failed to request route')
      }
    })
  }

  const isSaveDisabled = isPending || (type === 'rsshub' && !previewRoute)

  // ── Shared field styles (uses only CSS variables — works in light + dark) ──
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    padding: '0.55rem 0.75rem',
    borderRadius: '0.5rem',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.65rem',
    fontWeight: 900,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom: '0.4rem',
  }
  const sectionStyle: React.CSSProperties = { marginBottom: '1.1rem' }

  if (!mounted) return null

  const content = (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Slide-over panel */}
      <div
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border)',
          zIndex: 201,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Panel header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>
              {isEditing ? 'Edit Source Channel' : 'Add Source Channel'}
            </div>
            {isEditing && source && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                {source.name}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              borderRadius: '0.4rem',
              cursor: 'pointer',
              width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem',
              lineHeight: 1,
            }}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        {/* Scrollable form body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

          {/* ── Request-a-route sub-form ── */}
          {showRequestForm ? (
            <form onSubmit={handleRequestSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Can't find a route? Submit a request and we'll build it for you.
                </p>
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Target Website URL</label>
                <input name="target_url" required style={fieldStyle} placeholder="https://example.com" />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Instructions</label>
                <textarea name="instructions" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} placeholder="What content do you want from this site?" />
              </div>
              <div style={sectionStyle}>
                <label style={labelStyle}>Access Notes / API Keys</label>
                <input name="access_notes" style={fieldStyle} placeholder="Any credentials or access notes" />
              </div>
              {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>{error}</p>}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" disabled={isPending} style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', opacity: isPending ? 0.6 : 1 }}>
                  {isPending ? 'SUBMITTING…' : 'SUBMIT REQUEST'}
                </button>
                <button type="button" onClick={() => setShowRequestForm(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '0.6rem 1.2rem', borderRadius: '0.4rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
                  BACK
                </button>
              </div>
            </form>
          ) : (

          /* ── Main source form ── */
          <form onSubmit={handleSubmit}>

            {/* Source Type */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Source Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setSearchTerm('')
                  setSuggestions([])
                  setPreviewRoute(null)
                  setPreviewItems([])
                }}
                style={{ ...fieldStyle, colorScheme: 'dark' }}
              >
                <option value="rsshub">RSSHub Managed Route</option>
                <option value="rss">Standard RSS Feed</option>
                <option value="youtube">YouTube</option>
              </select>
              {isEditing && source?.type !== type && (
                <p style={{ fontSize: '0.65rem', color: '#f59e0b', marginTop: '0.4rem', fontWeight: 700 }}>
                  ⚠ Changing the type will require re-specifying the source URL.
                </p>
              )}
            </div>

            {/* Source Name */}
            <div style={sectionStyle}>
              <label style={labelStyle}>Source Name</label>
              <input
                name="name"
                defaultValue={source?.name ?? ''}
                placeholder={type === 'rsshub' ? 'Route name, e.g. MyBroadband Business' : 'e.g. Andrei Jikh'}
                required
                style={fieldStyle}
              />
            </div>

            {/* URL / RSSHub route */}
            <div style={sectionStyle}>
              <label style={labelStyle}>
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
                  placeholder={type === 'rsshub' ? '/maroelamedia/nuus or search…' : 'https://… or @handle'}
                  required
                  style={{ ...fieldStyle, flex: 1 }}
                />
                {type === 'rsshub' && !previewRoute && searchTerm.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handlePreview(searchTerm)}
                    style={{ background: 'var(--indigo)', color: 'white', border: 'none', padding: '0.55rem 1rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                  >
                    PREVIEW
                  </button>
                )}
              </div>

              {/* Helper text */}
              {type === 'rsshub' && !previewRoute && !searchTerm && (
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.6rem', lineHeight: 1.5 }}>
                  ℹ️ Search a website name or paste an exact route path. Browse the{' '}
                  <a href="https://docs.rsshub.app/routes/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--indigo)', textDecoration: 'underline' }}>
                    available routes directory
                  </a>.
                </div>
              )}

              {/* Suggestions dropdown */}
              {type === 'rsshub' && !previewRoute && searchTerm && (
                <div style={{ marginTop: '0.5rem' }}>
                  {isSearching && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching…</div>}
                  {suggestions.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', maxHeight: '260px', overflowY: 'auto' }}>
                      {suggestions.map((s, index) => (
                        <li
                          key={`${s.path}-${index}`}
                          style={{ padding: '0.6rem 0.75rem', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                          onClick={() => {
                            let targetPath = s.path
                            if (s.example) {
                              try {
                                const url = new URL(s.example)
                                targetPath = url.pathname + url.search
                              } catch {}
                            }
                            setSearchTerm(targetPath)
                            handlePreview(targetPath)
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {s.example ? new URL(s.example).pathname + new URL(s.example).search : s.path}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchTerm.length > 2 && suggestions.length === 0 && !isSearching && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.4rem', color: 'var(--text-muted)' }}>
                      No match found.{' '}
                      <span
                        style={{ color: 'var(--indigo)', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setShowRequestForm(true)}
                      >
                        Request a new route?
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RSSHub Preview panel */}
            {previewRoute && type === 'rsshub' && (
              <div style={{ marginBottom: '1.25rem', padding: '0.9rem', background: 'var(--bg-surface)', borderRadius: '0.6rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--indigo)' }}>
                    ✓ Feed Preview
                  </span>
                  <button
                    type="button"
                    onClick={() => { setPreviewRoute(null); setPreviewItems([]) }}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', flexShrink: 0 }}
                  >
                    ✕
                  </button>
                </div>
                {isPreviewing ? (
                  <div style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', padding: '1rem 0' }}>Loading preview…</div>
                ) : previewItems.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {previewItems.map((item, i) => (
                      <div key={i} style={{ paddingBottom: '0.6rem', borderBottom: i < previewItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <strong style={{ fontSize: '0.8rem', lineHeight: 1.3, display: 'block', color: 'var(--text-main)', marginBottom: '0.15rem' }}>{item.title}</strong>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>{item.pubDate || item.date_modified || 'No date'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Empty or invalid feed</div>
                )}
              </div>
            )}

            {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>{error}</p>}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isSaveDisabled}
                style={{
                  background: 'var(--indigo)', color: 'white', border: 'none',
                  padding: '0.65rem 1.4rem', borderRadius: '0.5rem',
                  fontSize: '0.75rem', fontWeight: 900, cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                  opacity: isSaveDisabled ? 0.5 : 1, transition: 'opacity 0.2s',
                }}
              >
                {isPending ? (isEditing ? 'SAVING…' : 'ADDING…') : (isEditing ? 'SAVE CHANGES' : 'ADD SOURCE')}
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', padding: '0.65rem 1.2rem',
                  borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer',
                }}
              >
                CANCEL
              </button>
            </div>

            {type === 'rsshub' && !previewRoute && (
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 700 }}>
                A preview is required before saving an RSSHub route.
              </p>
            )}
          </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  )

  return createPortal(content, document.body)
}
