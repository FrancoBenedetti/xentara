'use client'

import { useState, useTransition } from 'react'
import {
  PlatformPromotion,
  createPlatformPromotion,
  updatePlatformPromotion,
  togglePlatformPromotion,
  deletePlatformPromotion,
} from '@/app/dashboard/actions'

// ── Type metadata ──────────────────────────────────────────────────────────

const TYPE_META: Record<PlatformPromotion['type'], { icon: string; label: string; color: string }> = {
  signup_cta:   { icon: '✨', label: 'Signup CTA',   color: '#6366f1' },
  announcement: { icon: '📢', label: 'Announcement', color: '#10b981' },
  campaign:     { icon: '🚀', label: 'Campaign',     color: '#ec4899' },
}

// ── Default form ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  type: 'signup_cta' as PlatformPromotion['type'],
  title: '',
  body: '',
  frequency_hours: 24,
  is_active: false,
  guests_only: true,
  links: [] as { label: string; url: string }[],
}

// ── Component ──────────────────────────────────────────────────────────────

interface Props {
  initialPromotions: PlatformPromotion[]
}

export default function PlatformPromotionsManager({ initialPromotions }: Props) {
  const [promos, setPromos] = useState<PlatformPromotion[]>(initialPromotions)
  const [isPending, startTransition] = useTransition()
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [linkDraft, setLinkDraft] = useState({ label: '', url: '' })

  // ── Style helpers ──────────────────────────────────────────────────────────

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: '0.8rem',
    padding: '0.45rem 0.75rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  const btn = (variant: 'primary' | 'ghost' | 'danger' | 'success'): React.CSSProperties => ({
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.3rem 0.7rem',
    fontSize: '0.65rem',
    fontWeight: 900,
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
    ...(variant === 'primary'  && { background: '#6366f1', color: '#fff' }),
    ...(variant === 'ghost'    && { background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border)' }),
    ...(variant === 'danger'   && { background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.45)' }),
    ...(variant === 'success'  && { background: '#059669', color: '#fff' }),
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPanelOpen(true)
  }

  const openEdit = (p: PlatformPromotion) => {
    setEditingId(p.id)
    setForm({
      type: p.type,
      title: p.title,
      body: p.body || '',
      frequency_hours: p.frequency_hours,
      is_active: p.is_active,
      guests_only: p.guests_only,
      links: p.links || [],
    })
    setPanelOpen(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      const payload = {
        ...form,
        body: form.body || undefined,
        links: form.links.length ? form.links : [],
      }
      if (editingId) {
        await updatePlatformPromotion(editingId, payload)
        setPromos(prev => prev.map(p => p.id === editingId ? { ...p, ...payload } : p))
      } else {
        await createPlatformPromotion(payload)
        // Add optimistic item
        const optimistic: PlatformPromotion = {
          id: crypto.randomUUID(),
          ...payload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setPromos(prev => [optimistic, ...prev])
      }
      setPanelOpen(false)
    })
  }

  const handleToggle = (p: PlatformPromotion) => {
    startTransition(async () => {
      await togglePlatformPromotion(p.id, !p.is_active)
      setPromos(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this platform promotion permanently?')) return
    startTransition(async () => {
      await deletePlatformPromotion(id)
      setPromos(prev => prev.filter(p => p.id !== id))
    })
  }

  const addLink = () => {
    if (!linkDraft.label.trim() || !linkDraft.url.trim()) return
    setForm(f => ({ ...f, links: [...f.links, { ...linkDraft }] }))
    setLinkDraft({ label: '', url: '' })
  }

  const removeLink = (i: number) => {
    setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.25rem' }}>
            {promos.filter(p => p.is_active).length} active · {promos.length} total
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ ...btn('primary'), padding: '0.5rem 1.1rem', fontSize: '0.7rem', borderRadius: '2rem' }}
        >
          + NEW PROMOTION
        </button>
      </div>

      {/* Create/Edit panel */}
      {panelOpen && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: '0.85rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <p style={{ fontSize: '0.62rem', fontWeight: 900, color: '#6366f1', letterSpacing: '0.1em', margin: 0 }}>
            {editingId ? '✎ EDIT PROMOTION' : '+ NEW PLATFORM PROMOTION'}
          </p>

          {/* Type */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {(Object.keys(TYPE_META) as PlatformPromotion['type'][]).map(t => {
              const m = TYPE_META[t]
              return (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  style={{
                    ...btn(form.type === t ? 'primary' : 'ghost'),
                    background: form.type === t ? m.color : undefined,
                    borderColor: form.type === t ? m.color : undefined,
                    fontSize: '0.65rem',
                    borderRadius: '2rem',
                    padding: '0.3rem 0.8rem',
                  }}
                >
                  {m.icon} {m.label}
                </button>
              )
            })}
          </div>

          {/* Title */}
          <input
            placeholder="Title…"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            style={{ ...inputStyle, fontWeight: 800 }}
          />

          {/* Body */}
          <textarea
            placeholder="Body copy (optional)…"
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.55 }}
          />

          {/* Frequency + Flags */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              Frequency
              <input
                type="number"
                min={1}
                value={form.frequency_hours}
                onChange={e => setForm(f => ({ ...f, frequency_hours: parseInt(e.target.value) || 1 }))}
                style={{ ...inputStyle, width: '70px' }}
              />
              items
            </label>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.guests_only}
                onChange={e => setForm(f => ({ ...f, guests_only: e.target.checked }))}
                style={{ accentColor: '#6366f1' }}
              />
              Guests only
            </label>
            <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', display: 'flex', gap: '0.4rem', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                style={{ accentColor: '#059669' }}
              />
              Active
            </label>
          </div>

          {/* Links */}
          <div>
            <p style={{ fontSize: '0.62rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>LINKS</p>
            {form.links.map((l, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>
                  {l.label} → {l.url}
                </span>
                <button style={btn('danger')} onClick={() => removeLink(i)}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              <input
                placeholder="Label…"
                value={linkDraft.label}
                onChange={e => setLinkDraft(v => ({ ...v, label: e.target.value }))}
                style={{ ...inputStyle, flex: '1 1 100px' }}
              />
              <input
                placeholder="URL…"
                value={linkDraft.url}
                onChange={e => setLinkDraft(v => ({ ...v, url: e.target.value }))}
                style={{ ...inputStyle, flex: '2 1 160px' }}
              />
              <button style={btn('ghost')} onClick={addLink}>+ ADD</button>
            </div>
          </div>

          {/* Form actions */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button style={btn('primary')} disabled={!form.title.trim() || isPending} onClick={handleSave}>
              {editingId ? 'SAVE CHANGES' : 'CREATE'}
            </button>
            <button style={btn('ghost')} onClick={() => setPanelOpen(false)}>CANCEL</button>
          </div>
        </div>
      )}

      {/* Promotions list */}
      {promos.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>No platform promotions yet.</p>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', marginTop: '0.35rem' }}>Create one above to start injecting CTAs into reader feeds.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {promos.map(p => {
            const meta = TYPE_META[p.type]
            return (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: `1px solid ${p.is_active ? `${meta.color}44` : 'var(--border)'}`,
                  borderLeft: `3px solid ${p.is_active ? meta.color : 'var(--border)'}`,
                  borderRadius: '0.75rem',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Status dot */}
                <span
                  title={p.is_active ? 'Active' : 'Inactive'}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.is_active ? meta.color : 'var(--border)', flexShrink: 0 }}
                />

                {/* Type badge */}
                <span style={{
                  fontSize: '0.58rem', fontWeight: 900, letterSpacing: '0.08em',
                  background: `${meta.color}18`, color: meta.color,
                  border: `1px solid ${meta.color}44`,
                  padding: '0.12rem 0.45rem', borderRadius: '2rem', flexShrink: 0
                }}>
                  {meta.icon} {meta.label}
                </span>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: '0.85rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Every {p.frequency_hours} items · {p.guests_only ? 'Guests only' : 'All readers'} · {(p.links || []).length} links
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  <button style={p.is_active ? btn('ghost') : btn('success')} onClick={() => handleToggle(p)} disabled={isPending}>
                    {p.is_active ? 'PAUSE' : 'ACTIVATE'}
                  </button>
                  <button style={btn('ghost')} onClick={() => openEdit(p)}>✎</button>
                  <button style={btn('danger')} onClick={() => handleDelete(p.id)} disabled={isPending}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
