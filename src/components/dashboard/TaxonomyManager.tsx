'use client'

import { useState, useTransition, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  getHubTags,
  updateHubStrictness,
  confirmHubTag,
  removeHubTag,
  addHubTag,
} from '@/app/dashboard/actions'

interface HubTag {
  id: string
  name: string
  description: string
  is_confirmed: boolean
}

export default function TaxonomyManager({
  hubId,
  initialStrictness,
}: {
  hubId: string
  initialStrictness: string
}) {
  const router = useRouter()
  const [unconfirmed, setUnconfirmed] = useState<HubTag[]>([])
  const [confirmedChips, setConfirmedChips] = useState<{ id: string; name: string }[]>([])
  const [strictness, setStrictness] = useState(initialStrictness)
  const [isPending, startTransition] = useTransition()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', description: '' })

  const loadData = useCallback(() => {
    getHubTags(hubId).then((tags: HubTag[]) => {
      setUnconfirmed(tags.filter(t => !t.is_confirmed))
      setConfirmedChips(
        tags.filter(t => t.is_confirmed).map(t => ({ id: t.id, name: t.name }))
      )
    })
  }, [hubId])

  useEffect(() => { loadData() }, [loadData])

  const handleToggleStrictness = () => {
    const next = strictness === 'exploratory' ? 'strict' : 'exploratory'
    startTransition(async () => {
      await updateHubStrictness(hubId, next)
      setStrictness(next)
    })
  }

  const handleConfirm = (tagId: string) => {
    startTransition(async () => {
      await confirmHubTag(tagId)
      loadData()
    })
  }

  const handleRemove = (tagId: string) => {
    if (!confirm('Remove this flavor lens?')) return
    startTransition(async () => {
      await removeHubTag(tagId)
      loadData()
    })
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name.trim()) return
    startTransition(async () => {
      await addHubTag(hubId, newTag.name.trim(), newTag.description.trim())
      setNewTag({ name: '', description: '' })
      setShowAdd(false)
      loadData()
    })
  }

  const base: React.CSSProperties = {
    marginTop: '3rem',
    borderTop: '2px solid var(--border)',
    paddingTop: '2rem',
  }

  const chipStyle: React.CSSProperties = {
    background: 'rgba(99,102,241,0.1)',
    color: 'var(--indigo)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '2rem',
    padding: '0.3rem 0.85rem',
    fontSize: '0.7rem',
    fontWeight: 800,
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={base}>
      {/* ── HEADER ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>
            INTEL FLAVORS
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
            {confirmedChips.length} confirmed · {unconfirmed.length} pending review
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <button
            onClick={handleToggleStrictness}
            disabled={isPending}
            style={{
              background: strictness === 'strict' ? 'var(--indigo)' : 'var(--bg-input)',
              color: strictness === 'strict' ? '#fff' : 'var(--indigo)',
              border: '1px solid var(--indigo)',
              padding: '0.4rem 1.1rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            MODE: {strictness.toUpperCase()}
          </button>
          <button
            onClick={() => router.push(`/dashboard/taxonomy?hubId=${hubId}`)}
            style={{
              background: 'transparent',
              color: 'var(--indigo)',
              border: '1px solid var(--indigo)',
              padding: '0.4rem 1rem',
              borderRadius: '2rem',
              fontSize: '0.65rem',
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            MANAGE ALL →
          </button>
        </div>
      </header>

      {/* ── PENDING REVIEW ── */}
      {unconfirmed.length > 0 && (
        <section style={{ marginBottom: '1.75rem' }}>
          <h4 style={{ fontSize: '0.63rem', fontWeight: 900, color: 'var(--indigo)', letterSpacing: '0.12em', marginBottom: '0.75rem' }}>
            ✨ PENDING REVIEW ({unconfirmed.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {unconfirmed.map(tag => (
              <div
                key={tag.id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                }}
              >
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem' }}>
                  <button
                    onClick={() => setExpandedId(expandedId === tag.id ? null : tag.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <span style={{ fontWeight: 900, fontSize: '0.82rem', color: 'var(--text-main)' }}>
                      #{tag.name.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      {expandedId === tag.id ? '▲' : '▼'}
                    </span>
                  </button>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleConfirm(tag.id)}
                      disabled={isPending}
                      style={{ background: '#059669', color: '#fff', border: 'none', padding: '0.28rem 0.65rem', borderRadius: '0.4rem', fontSize: '0.63rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      APPROVE
                    </button>
                    <button
                      onClick={() => handleRemove(tag.id)}
                      disabled={isPending}
                      style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(239,68,68,0.4)', padding: '0.28rem 0.65rem', borderRadius: '0.4rem', fontSize: '0.63rem', fontWeight: 900, cursor: 'pointer' }}
                    >
                      PURGE
                    </button>
                  </div>
                </div>
                {/* Accordion body */}
                {expandedId === tag.id && tag.description && (
                  <div style={{ padding: '0 1rem 0.7rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.55, marginTop: '0.55rem' }}>
                      {tag.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CONFIRMED CHIPS ── */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.63rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            CONFIRMED LENSES ({confirmedChips.length})
          </h4>
          <button
            onClick={() => setShowAdd(v => !v)}
            style={{ background: showAdd ? 'var(--bg-input)' : 'var(--indigo)', color: showAdd ? 'var(--text-muted)' : '#fff', border: '1px solid var(--indigo)', padding: '0.28rem 0.75rem', borderRadius: '0.4rem', fontSize: '0.63rem', fontWeight: 900, cursor: 'pointer' }}
          >
            {showAdd ? 'CANCEL' : '+ ADD'}
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <form
            onSubmit={handleAdd}
            style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', background: 'var(--bg-input)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)', flexWrap: 'wrap' }}
          >
            <input
              placeholder="Flavor name…"
              value={newTag.name}
              onChange={e => setNewTag({ ...newTag, name: e.target.value })}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', flex: '1 1 120px', fontWeight: 700 }}
            />
            <input
              placeholder="Semantic description (optional)…"
              value={newTag.description}
              onChange={e => setNewTag({ ...newTag, description: e.target.value })}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-main)', fontSize: '0.8rem', padding: '0.4rem 0.6rem', borderRadius: '0.4rem', flex: '2 1 200px', fontWeight: 600 }}
            />
            <button
              type="submit"
              disabled={isPending}
              style={{ background: 'var(--indigo)', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '0.4rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
            >
              SAVE
            </button>
          </form>
        )}

        {/* Chip cloud */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
          {confirmedChips.map(chip => (
            <span key={chip.id} style={chipStyle}>#{chip.name}</span>
          ))}
          {confirmedChips.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontStyle: 'italic', fontWeight: 600 }}>
              No confirmed lenses yet. Approve suggestions above or add one manually.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
