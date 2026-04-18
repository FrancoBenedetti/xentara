'use client'

import { useState, useTransition, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { confirmTag, deleteTag, mergeTags } from '@/app/dashboard/taxonomy/actions'
import { addHubTag, updateHubTag } from '@/app/dashboard/actions'
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

const PAGE_SIZE = 25

type TabId = 'all' | 'suggestions' | 'confirmed'

export default function TaxonomyStudio({
  initialHubs,
  initialTaxonomy,
  selectedHubId,
}: {
  initialHubs: Hub[]
  initialTaxonomy: { confirmed: Tag[]; unconfirmed: Tag[] }
  selectedHubId: string
}) {
  const router = useRouter()
  const [taxonomy, setTaxonomy] = useState(initialTaxonomy)
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editVals, setEditVals] = useState({ name: '', description: '' })
  const [mergingId, setMergingId] = useState<string | null>(null)
  const [mergeSearch, setMergeSearch] = useState('')
  const [mergeTargetId, setMergeTargetId] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newTag, setNewTag] = useState({ name: '', description: '' })
  const [isPending, startTransition] = useTransition()

  // ── Derived lists ──────────────────────────────────────────────────────────

  const allTags = useMemo(
    () => [...taxonomy.unconfirmed, ...taxonomy.confirmed],
    [taxonomy]
  )

  const filteredTags = useMemo(() => {
    let base: Tag[] =
      activeTab === 'suggestions'
        ? taxonomy.unconfirmed
        : activeTab === 'confirmed'
        ? taxonomy.confirmed
        : allTags

    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter(
        t =>
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      )
    }
    return base
  }, [allTags, taxonomy, activeTab, search])

  const totalPages = Math.ceil(filteredTags.length / PAGE_SIZE)
  const pagedTags = filteredTags.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const mergeOptions = useMemo(() => {
    const q = mergeSearch.toLowerCase()
    return taxonomy.confirmed
      .filter(t => t.id !== mergingId && t.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [taxonomy.confirmed, mergeSearch, mergingId])

  // Reset to page 0 when filters change
  const setTab = (t: TabId) => { setActiveTab(t); setPage(0) }
  const setQuery = (q: string) => { setSearch(q); setPage(0) }

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleHubChange = (hubId: string) => {
    router.push(`/dashboard/taxonomy?hubId=${hubId}`)
  }

  const handleConfirm = useCallback((tagId: string) => {
    startTransition(async () => {
      await confirmTag(tagId)
      setTaxonomy(prev => {
        const tag = prev.unconfirmed.find(t => t.id === tagId)
        if (!tag) return prev
        return {
          confirmed: [...prev.confirmed, { ...tag, is_confirmed: true }].sort((a, b) =>
            a.name.localeCompare(b.name)
          ),
          unconfirmed: prev.unconfirmed.filter(t => t.id !== tagId),
        }
      })
    })
  }, [])

  const handleDelete = useCallback((tagId: string) => {
    if (!confirm('Delete this flavor? It will be removed from all publications.')) return
    startTransition(async () => {
      await deleteTag(tagId)
      setTaxonomy(prev => ({
        confirmed: prev.confirmed.filter(t => t.id !== tagId),
        unconfirmed: prev.unconfirmed.filter(t => t.id !== tagId),
      }))
    })
  }, [])

  const handleEditSave = useCallback(
    (tagId: string) => {
      startTransition(async () => {
        await updateHubTag(tagId, editVals.name, editVals.description)
        setTaxonomy(prev => ({
          confirmed: prev.confirmed.map(t =>
            t.id === tagId ? { ...t, name: editVals.name, description: editVals.description } : t
          ),
          unconfirmed: prev.unconfirmed.map(t =>
            t.id === tagId ? { ...t, name: editVals.name, description: editVals.description } : t
          ),
        }))
        setEditingId(null)
      })
    },
    [editVals]
  )

  const handleMerge = useCallback(
    (sourceId: string) => {
      if (!mergeTargetId) return
      startTransition(async () => {
        await mergeTags(sourceId, mergeTargetId)
        setTaxonomy(prev => ({
          confirmed: prev.confirmed.filter(t => t.id !== sourceId),
          unconfirmed: prev.unconfirmed.filter(t => t.id !== sourceId),
        }))
        setMergingId(null)
        setMergeTargetId('')
        setMergeSearch('')
      })
    },
    [mergeTargetId]
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTag.name.trim()) return
    startTransition(async () => {
      await addHubTag(selectedHubId, newTag.name.trim(), newTag.description.trim())
      setNewTag({ name: '', description: '' })
      setShowAdd(false)
      // Optimistic add to confirmed list
      const optimistic: Tag = {
        id: crypto.randomUUID(),
        name: newTag.name.trim(),
        description: newTag.description.trim(),
        is_confirmed: true,
      }
      setTaxonomy(prev => ({
        ...prev,
        confirmed: [...prev.confirmed, optimistic].sort((a, b) => a.name.localeCompare(b.name)),
      }))
    })
  }

  // ── Shared style helpers ───────────────────────────────────────────────────

  const btn = (variant: 'primary' | 'ghost' | 'danger' | 'success'): React.CSSProperties => ({
    border: 'none',
    borderRadius: '0.4rem',
    padding: '0.28rem 0.65rem',
    fontSize: '0.63rem',
    fontWeight: 900,
    cursor: isPending ? 'not-allowed' : 'pointer',
    opacity: isPending ? 0.6 : 1,
    ...(variant === 'primary' && { background: 'var(--indigo)', color: '#fff' }),
    ...(variant === 'ghost' && { background: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border)' }),
    ...(variant === 'danger' && { background: 'transparent', color: 'var(--text-muted)', border: '1px solid rgba(239,68,68,0.45)' }),
    ...(variant === 'success' && { background: '#059669', color: '#fff' }),
  })

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-main)',
    fontSize: '0.8rem',
    padding: '0.45rem 0.75rem',
    borderRadius: '0.5rem',
    fontWeight: 600,
    outline: 'none',
  }

  const tabCounts: Record<TabId, number> = {
    all: allTags.length,
    suggestions: taxonomy.unconfirmed.length,
    confirmed: taxonomy.confirmed.length,
  }

  // ── Row renderer ───────────────────────────────────────────────────────────

  const renderRow = (tag: Tag) => {
    const isEditing = editingId === tag.id
    const isMerging = mergingId === tag.id
    const isExpanded = expandedId === tag.id

    if (isEditing) {
      return (
        <div
          key={tag.id}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--indigo)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
        >
          <input
            value={editVals.name}
            onChange={e => setEditVals(v => ({ ...v, name: e.target.value }))}
            style={{ ...inputStyle, fontWeight: 900, fontSize: '0.9rem' }}
          />
          <textarea
            value={editVals.description}
            onChange={e => setEditVals(v => ({ ...v, description: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
          />
          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
            <button style={btn('primary')} onClick={() => handleEditSave(tag.id)}>SAVE</button>
            <button style={btn('ghost')} onClick={() => setEditingId(null)}>CANCEL</button>
          </div>
        </div>
      )
    }

    return (
      <div
        key={tag.id}
        style={{
          background: 'var(--bg-surface)',
          border: `1px solid ${tag.is_confirmed ? 'rgba(99,102,241,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: '0.75rem',
          overflow: 'hidden',
          transition: 'border-color 0.15s',
        }}
      >
        {/* Main row */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.7rem 1rem', gap: '0.75rem' }}>
          {/* Expand toggle + name */}
          <button
            onClick={() => setExpandedId(isExpanded ? null : tag.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}
          >
            <span style={{ fontWeight: 900, fontSize: '0.84rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              #{tag.name.toUpperCase()}
            </span>
            {!tag.is_confirmed && (
              <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.58rem', fontWeight: 900, padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.4)', flexShrink: 0 }}>
                AI DRAFT
              </span>
            )}
            {tag.is_confirmed && (
              <span style={{ color: 'var(--indigo)', fontSize: '0.75rem', flexShrink: 0 }}>✓</span>
            )}
            <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
            {!tag.is_confirmed && (
              <button style={btn('success')} onClick={() => handleConfirm(tag.id)} disabled={isPending}>CONFIRM</button>
            )}
            <button
              style={btn('ghost')}
              onClick={() => { setEditingId(tag.id); setEditVals({ name: tag.name, description: tag.description || '' }) }}
            >
              EDIT
            </button>
            {tag.is_confirmed && (
              <button
                style={btn('ghost')}
                onClick={() => { setMergingId(tag.id); setMergeSearch(''); setMergeTargetId('') }}
              >
                MERGE→
              </button>
            )}
            <button style={btn('danger')} onClick={() => handleDelete(tag.id)} disabled={isPending}>✕</button>
          </div>
        </div>

        {/* Accordion: description */}
        {isExpanded && (
          <div style={{ padding: '0 1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.55, marginTop: '0.55rem' }}>
              {tag.description || <em>No description.</em>}
            </p>
          </div>
        )}

        {/* Merge combobox */}
        {isMerging && (
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-input)' }}>
            <p style={{ fontSize: '0.63rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              MERGE INTO — type to search confirmed lenses:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                autoFocus
                placeholder="Search confirmed lenses…"
                value={mergeSearch}
                onChange={e => { setMergeSearch(e.target.value); setMergeTargetId('') }}
                style={{ ...inputStyle, flex: '1 1 180px' }}
              />
              {mergeOptions.length > 0 && !mergeTargetId && (
                <div style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
                  {mergeOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setMergeTargetId(opt.id); setMergeSearch(opt.name) }}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', padding: '0.5rem 0.75rem', fontSize: '0.77rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}
                    >
                      #{opt.name}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
                <button
                  style={{ ...btn('primary'), opacity: mergeTargetId ? 1 : 0.4, cursor: mergeTargetId ? 'pointer' : 'not-allowed' }}
                  disabled={!mergeTargetId || isPending}
                  onClick={() => handleMerge(tag.id)}
                >
                  CONFIRM MERGE
                </button>
                <button style={btn('ghost')} onClick={() => setMergingId(null)}>CANCEL</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.taxonomyStudio}>
      {/* Header */}
      <header style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className={styles.mainTitle}>Taxonomy Studio</h2>
          <p className={styles.mainSubtitle}>
            Manage the intelligence lenses for your collectives.
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.3rem' }}>
            {taxonomy.confirmed.length} confirmed · {taxonomy.unconfirmed.length} AI suggestions
          </p>
        </div>
        <select
          value={selectedHubId}
          onChange={e => handleHubChange(e.target.value)}
          className={styles.input}
          style={{ width: '200px', colorScheme: 'dark', background: 'var(--bg-surface)' }}
        >
          {initialHubs.map(hub => (
            <option key={hub.id} value={hub.id}>{hub.name}</option>
          ))}
        </select>
      </header>

      {/* Search + Tabs + Add */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
          <input
            placeholder="Search flavors by name or description…"
            value={search}
            onChange={e => setQuery(e.target.value)}
            style={{ ...inputStyle, width: '100%', paddingLeft: '2rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Status tabs */}
        {(['all', 'suggestions', 'confirmed'] as TabId[]).map(tab => (
          <button
            key={tab}
            onClick={() => setTab(tab)}
            style={{
              background: activeTab === tab ? 'var(--indigo)' : 'var(--bg-input)',
              color: activeTab === tab ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${activeTab === tab ? 'var(--indigo)' : 'var(--border)'}`,
              borderRadius: '2rem',
              padding: '0.35rem 0.9rem',
              fontSize: '0.65rem',
              fontWeight: 900,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {tab === 'all' ? 'ALL' : tab === 'suggestions' ? '✨ AI SUGGESTIONS' : '✓ CONFIRMED'}{' '}
            <span style={{ opacity: 0.75 }}>({tabCounts[tab]})</span>
          </button>
        ))}

        {/* Add button */}
        <button
          onClick={() => setShowAdd(v => !v)}
          style={{ ...btn(showAdd ? 'ghost' : 'primary'), padding: '0.35rem 0.9rem', fontSize: '0.65rem', borderRadius: '2rem', flexShrink: 0 }}
        >
          {showAdd ? '✕ CANCEL' : '+ ADD FLAVOR'}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', background: 'var(--bg-input)', padding: '0.85rem', borderRadius: '0.75rem', border: '1px solid var(--border)', flexWrap: 'wrap' }}
        >
          <input
            placeholder="Flavor name…"
            value={newTag.name}
            onChange={e => setNewTag(v => ({ ...v, name: e.target.value }))}
            style={{ ...inputStyle, flex: '1 1 140px', fontWeight: 700 }}
          />
          <input
            placeholder="Semantic description (optional)…"
            value={newTag.description}
            onChange={e => setNewTag(v => ({ ...v, description: e.target.value }))}
            style={{ ...inputStyle, flex: '2 1 240px' }}
          />
          <button type="submit" disabled={isPending} style={{ ...btn('primary'), padding: '0.45rem 1.1rem', fontSize: '0.7rem' }}>
            SAVE LENS
          </button>
        </form>
      )}

      {/* List */}
      {filteredTags.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>
            {search ? `No flavors match "${search}"` : 'No flavors in this view.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {pagedTags.map(renderRow)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem', marginTop: '1.5rem' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{ ...btn('ghost'), opacity: page === 0 ? 0.35 : 1 }}
          >
            ← PREV
          </button>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{ ...btn('ghost'), opacity: page >= totalPages - 1 ? 0.35 : 1 }}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  )
}
