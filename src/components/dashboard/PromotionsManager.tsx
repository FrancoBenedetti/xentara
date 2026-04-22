'use client'

import { useState, useTransition } from 'react'
import {
  HubPromotion,
  createHubPromotion,
  updateHubPromotion,
  toggleHubPromotion,
  deleteHubPromotion,
} from '@/app/dashboard/actions'

const TYPE_LABELS: Record<HubPromotion['type'], string> = {
  announcement: '📢 Announcement',
  promotion: '🎁 Promotion',
  commercial: '💼 Commercial',
  campaign: '🚀 Campaign',
}

const TYPE_COLORS: Record<HubPromotion['type'], string> = {
  announcement: '#10b981',
  promotion: '#f59e0b',
  commercial: '#6366f1',
  campaign: '#ec4899',
}

const EMPTY_FORM = {
  type: 'announcement' as HubPromotion['type'],
  title: '',
  body: '',
  campaign_code: '',
  start_date: '',
  end_date: '',
  frequency_hours: 24,
  allow_suppress: true,
  links: [] as { label: string; url: string }[],
}

interface Props {
  hubId: string
  initialPromotions: HubPromotion[]
}

export default function PromotionsManager({ hubId, initialPromotions }: Props) {
  const [promos, setPromos] = useState<HubPromotion[]>(initialPromotions)
  const [isPending, startTransition] = useTransition()

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setPanelOpen(true)
  }

  const openEdit = (p: HubPromotion) => {
    setEditingId(p.id)
    setForm({
      type: p.type,
      title: p.title,
      body: p.body || '',
      campaign_code: p.campaign_code || '',
      start_date: p.start_date ? p.start_date.slice(0, 10) : '',
      end_date: p.end_date ? p.end_date.slice(0, 10) : '',
      frequency_hours: p.frequency_hours,
      allow_suppress: p.allow_suppress,
      links: p.links || [],
    })
    setError(null)
    setPanelOpen(true)
  }

  const closePanel = () => { setPanelOpen(false); setEditingId(null) }

  const addLink = () => setForm(f => ({ ...f, links: [...f.links, { label: '', url: '' }] }))
  const removeLink = (i: number) => setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  const updateLink = (i: number, field: 'label' | 'url', val: string) =>
    setForm(f => ({ ...f, links: f.links.map((l, idx) => idx === i ? { ...l, [field]: val } : l) }))

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.set('type', form.type)
      fd.set('title', form.title)
      fd.set('body', form.body)
      fd.set('campaign_code', form.campaign_code)
      fd.set('start_date', form.start_date)
      fd.set('end_date', form.end_date)
      fd.set('frequency_hours', String(form.frequency_hours))
      fd.set('allow_suppress', String(form.allow_suppress))
      fd.set('links', JSON.stringify(form.links.filter(l => l.url.trim())))

      if (editingId) {
        await updateHubPromotion(editingId, fd)
        setPromos(prev => prev.map(p => p.id === editingId ? {
          ...p, ...form,
          links: form.links.filter(l => l.url.trim()),
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
          campaign_code: form.campaign_code || undefined,
          updated_at: new Date().toISOString(),
        } : p))
      } else {
        await createHubPromotion(hubId, fd)
        // re-fetch optimistically by appending a placeholder — parent will revalidate
        const optimistic: HubPromotion = {
          id: crypto.randomUUID(),
          hub_id: hubId,
          created_by: '',
          type: form.type,
          title: form.title,
          body: form.body || undefined,
          links: form.links.filter(l => l.url.trim()),
          campaign_code: form.campaign_code || undefined,
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
          frequency_hours: form.frequency_hours,
          is_active: true,
          allow_suppress: form.allow_suppress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setPromos(prev => [optimistic, ...prev])
      }
      closePanel()
    } catch (err: any) {
      setError(err.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle / Delete ───────────────────────────────────────────────────────────

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleHubPromotion(id, !current)
      setPromos(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
    })
  }

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    startTransition(async () => {
      await deleteHubPromotion(id)
      setPromos(prev => prev.filter(p => p.id !== id))
    })
  }

  // ── Shared styles ─────────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.65rem 0.9rem', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: '0.6rem',
    color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: 600,
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.68rem', fontWeight: 900,
    color: 'var(--text-muted)', textTransform: 'uppercase',
    letterSpacing: '0.06em', marginBottom: '0.4rem',
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>Promotions & Announcements</h3>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Inject curator content into the publication stream.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: '0.5rem 1.1rem', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '0.6rem', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}
        >
          + NEW PROMOTION
        </button>
      </div>

      {/* List */}
      {promos.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', margin: 0 }}>No promotions yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {promos.map(p => {
            const color = TYPE_COLORS[p.type]
            const now = new Date()
            const started = !p.start_date || new Date(p.start_date) <= now
            const ended = !!p.end_date && new Date(p.end_date) < now
            const statusLabel = !p.is_active ? 'INACTIVE' : ended ? 'EXPIRED' : !started ? 'SCHEDULED' : 'LIVE'
            const statusColor = !p.is_active ? 'var(--text-muted)' : ended ? '#ef4444' : !started ? '#f59e0b' : '#10b981'

            return (
              <div
                key={p.id}
                style={{ background: 'var(--bg-surface)', border: `1px solid var(--border)`, borderLeft: `3px solid ${color}`, borderRadius: '0.75rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: isPending ? 0.6 : 1 }}
              >
                {/* Type badge */}
                <span style={{ fontSize: '0.65rem', fontWeight: 900, padding: '0.25rem 0.6rem', borderRadius: '1rem', background: `${color}18`, color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                  {TYPE_LABELS[p.type]}
                </span>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ color: statusColor, fontWeight: 900 }}>{statusLabel}</span>
                    {p.start_date && <span>From {new Date(p.start_date).toLocaleDateString()}</span>}
                    {p.end_date && <span>Until {new Date(p.end_date).toLocaleDateString()}</span>}
                    <span>Every {p.frequency_hours}h</span>
                    {p.allow_suppress && <span style={{ color: 'var(--text-muted)' }}>Suppressible</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    onClick={() => handleToggle(p.id, p.is_active)}
                    disabled={isPending}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 900, border: `1px solid ${p.is_active ? '#10b981' : 'var(--border)'}`, borderRadius: '0.4rem', background: p.is_active ? 'rgba(16,185,129,0.1)' : 'var(--bg-input)', color: p.is_active ? '#10b981' : 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {p.is_active ? 'LIVE' : 'OFF'}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 900, border: '1px solid var(--border)', borderRadius: '0.4rem', background: 'var(--bg-input)', color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    disabled={isPending}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.65rem', fontWeight: 900, border: '1px solid rgba(239,68,68,0.35)', borderRadius: '0.4rem', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Slide-out panel overlay */}
      {panelOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) closePanel() }}
        >
          <div style={{ width: '100%', maxWidth: '480px', height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', boxShadow: '-20px 0 60px rgba(0,0,0,0.4)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {/* Panel header */}
            <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {editingId ? 'EDIT PROMOTION' : 'NEW PROMOTION'}
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.68rem', color: 'var(--indigo)', fontWeight: 800, textTransform: 'uppercase' }}>
                  Curator Broadcast
                </p>
              </div>
              <button onClick={closePanel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1 }}>

              {/* Type */}
              <div>
                <label style={labelStyle}>Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as HubPromotion['type'] }))} style={{ ...inputStyle, colorScheme: 'dark' }}>
                  {(Object.keys(TYPE_LABELS) as HubPromotion['type'][]).map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Promotion headline…"
                  style={inputStyle}
                />
              </div>

              {/* Body */}
              <div>
                <label style={labelStyle}>Body (markdown supported)</label>
                <textarea
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  rows={4}
                  placeholder="Promotion details, call-to-action…"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
                />
              </div>

              {/* Campaign code (conditional) */}
              {form.type === 'campaign' && (
                <div>
                  <label style={labelStyle}>Campaign Code</label>
                  <input
                    type="text"
                    value={form.campaign_code}
                    onChange={e => setForm(f => ({ ...f, campaign_code: e.target.value }))}
                    placeholder="e.g. LAUNCH2026"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label style={labelStyle}>Re-inject every (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={form.frequency_hours}
                  onChange={e => setForm(f => ({ ...f, frequency_hours: parseInt(e.target.value) || 24 }))}
                  style={inputStyle}
                />
              </div>

              {/* Allow suppress */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={form.allow_suppress}
                  onChange={e => setForm(f => ({ ...f, allow_suppress: e.target.checked }))}
                  style={{ width: '1rem', height: '1rem', accentColor: 'var(--indigo)', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Allow readers to suppress this promotion
                </span>
              </label>

              {/* Links builder */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Links</label>
                  <button type="button" onClick={addLink} style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ ADD LINK</button>
                </div>
                {form.links.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {form.links.map((link, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Label"
                          value={link.label}
                          onChange={e => updateLink(i, 'label', e.target.value)}
                          style={{ ...inputStyle, flex: '0 0 35%' }}
                        />
                        <input
                          type="text"
                          placeholder="URL or #hashtag"
                          value={link.url}
                          onChange={e => updateLink(i, 'url', e.target.value)}
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button type="button" onClick={() => removeLink(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0, padding: '0 0.2rem' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No links yet. Add web URLs, hashtags, or anything the reader should tap.</p>
                )}
              </div>

              {error && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>{error}</p>
              )}

              {/* Footer */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={closePanel} style={{ padding: '0.65rem 1.25rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer' }}>
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.65rem 1.75rem', background: 'var(--indigo)', border: 'none', borderRadius: '0.6rem', color: '#fff', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 8px 16px rgba(99,102,241,0.35)', opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? 'SAVING…' : editingId ? 'SAVE CHANGES' : 'CREATE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
