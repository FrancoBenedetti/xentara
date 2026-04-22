'use client'

import { useState, useTransition, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { confirmTag, deleteTag, mergeTags, bulkConfirmTags, bulkDeleteTags, getTagTranslations, upsertTagTranslation, deleteTagTranslation, TagTranslation } from '@/app/dashboard/taxonomy/actions'
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
  content_language?: string
}

// Common BCP-47 languages for the picker
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'zu', label: 'isiZulu' },
]

const PAGE_SIZE = 25

type TabId = 'all' | 'suggestions' | 'confirmed'

export default function TaxonomyStudio({
  initialHubs,
  initialTaxonomy,
  selectedHubId,
  selectedHub,
}: {
  initialHubs: Hub[]
  initialTaxonomy: { confirmed: Tag[]; unconfirmed: Tag[] }
  selectedHubId: string
  selectedHub?: Hub
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  // ── Language state ─────────────────────────────────────────────────────────
  // Default to hub's content_language, fall back to 'en'
  const [viewLang, setViewLang] = useState(selectedHub?.content_language || 'en')
  // Per-tag translation cache: tagId → { language → TagTranslation }
  const [translationCache, setTranslationCache] = useState<Record<string, TagTranslation[]>>({})
  const [loadingTranslations, setLoadingTranslations] = useState<Set<string>>(new Set())
  // Translation edit state
  const [editingTranslation, setEditingTranslation] = useState<{ tagId: string; lang: string } | null>(null)
  const [translationEdit, setTranslationEdit] = useState({ name: '', description: '' })

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
    startTransition(() => {
      router.push(`/dashboard/taxonomy?hubId=${hubId}`)
    })
  }

  // ── Translation helpers ────────────────────────────────────────────────────

  /** Lazily load translations for a tag the first time its row is expanded */
  const loadTranslations = useCallback(async (tagId: string) => {
    if (translationCache[tagId] || loadingTranslations.has(tagId)) return
    setLoadingTranslations(prev => new Set(prev).add(tagId))
    const translations = await getTagTranslations(tagId)
    setTranslationCache(prev => ({ ...prev, [tagId]: translations }))
    setLoadingTranslations(prev => { const s = new Set(prev); s.delete(tagId); return s })
  }, [translationCache, loadingTranslations])

  /** Get the display name/description for a tag in the current viewLang */
  const getDisplayed = useCallback((tag: Tag) => {
    const cached = translationCache[tag.id]
    const match = cached?.find(t => t.language === viewLang)
    if (match) return { name: match.name, description: match.description || tag.description, isTranslated: true }
    return { name: tag.name, description: tag.description, isTranslated: false }
  }, [translationCache, viewLang])

  const handleSaveTranslation = useCallback(async (tagId: string) => {
    await upsertTagTranslation(tagId, editingTranslation!.lang, translationEdit.name, translationEdit.description)
    setTranslationCache(prev => {
      const existing = prev[tagId] || []
      const filtered = existing.filter(t => t.language !== editingTranslation!.lang)
      return {
        ...prev,
        [tagId]: [
          ...filtered,
          { id: '', tag_id: tagId, language: editingTranslation!.lang, name: translationEdit.name, description: translationEdit.description }
        ]
      }
    })
    setEditingTranslation(null)
  }, [editingTranslation, translationEdit])

  const handleDeleteTranslation = useCallback(async (tagId: string, lang: string) => {
    await deleteTagTranslation(tagId, lang)
    setTranslationCache(prev => ({
      ...prev,
      [tagId]: (prev[tagId] || []).filter(t => t.language !== lang)
    }))
  }, [])

  // Load translations when a row is expanded
  useEffect(() => {
    if (expandedId) loadTranslations(expandedId)
  }, [expandedId])

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

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllSelection = () => {
    const pageIds = pagedTags.map(t => t.id)
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.has(id))
    
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        pageIds.forEach(id => next.delete(id))
      } else {
        pageIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const handleBulkConfirm = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return
    startTransition(async () => {
      await bulkConfirmTags(ids)
      setTaxonomy(prev => {
        const toConfirm = prev.unconfirmed.filter(t => ids.includes(t.id))
        return {
          confirmed: [...prev.confirmed, ...toConfirm.map(t => ({ ...t, is_confirmed: true }))].sort((a, b) => a.name.localeCompare(b.name)),
          unconfirmed: prev.unconfirmed.filter(t => !ids.includes(t.id)),
        }
      })
      setSelectedIds(new Set())
    })
  }, [selectedIds])

  const handleBulkDelete = useCallback(() => {
    const ids = Array.from(selectedIds)
    if (!ids.length) return
    if (!confirm(`Delete ${ids.length} selected flavors?`)) return
    startTransition(async () => {
      await bulkDeleteTags(ids)
      setTaxonomy(prev => ({
        confirmed: prev.confirmed.filter(t => !ids.includes(t.id)),
        unconfirmed: prev.unconfirmed.filter(t => !ids.includes(t.id)),
      }))
      setSelectedIds(new Set())
    })
  }, [selectedIds])

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
          {/* Selection Checkbox */}
          <input 
            type="checkbox" 
            checked={selectedIds.has(tag.id)} 
            onChange={() => toggleSelection(tag.id)}
            style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--indigo)' }}
          />
          {/* Expand toggle + name */}
          <button
            onClick={() => setExpandedId(isExpanded ? null : tag.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}
          >
            {(() => {
              const { name: displayName, isTranslated } = getDisplayed(tag)
              return (
                <span style={{ fontWeight: 900, fontSize: '0.84rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  #{displayName.toUpperCase()}
                  {isTranslated && (
                    <span title={`Translated (${viewLang})`} style={{ fontSize: '0.65rem', color: 'var(--indigo)', flexShrink: 0 }}>🌐</span>
                  )}
                </span>
              )
            })()}
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

        {/* Accordion: description + translations */}
        {isExpanded && (() => {
          const { description: displayDesc, isTranslated } = getDisplayed(tag)
          const cached = translationCache[tag.id] || []
          const isLoadingT = loadingTranslations.has(tag.id)
          const editingThisTag = editingTranslation?.tagId === tag.id

          return (
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {/* Description in current lang */}
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.74rem', color: isTranslated ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600, lineHeight: 1.55, margin: 0, flex: 1 }}>
                  {displayDesc || <em>No description.</em>}
                </p>
                {/* Add/edit translation for current lang */}
                {viewLang !== 'en' && (
                  <button
                    style={{ ...btn('ghost'), fontSize: '0.6rem', flexShrink: 0 }}
                    onClick={() => {
                      const existing = cached.find(t => t.language === viewLang)
                      setEditingTranslation({ tagId: tag.id, lang: viewLang })
                      setTranslationEdit({ name: existing?.name || tag.name, description: existing?.description || tag.description || '' })
                    }}
                  >
                    {cached.find(t => t.language === viewLang) ? '✎ EDIT TRANSLATION' : '+ ADD TRANSLATION'}
                  </button>
                )}
              </div>

              {/* Inline translation editor */}
              {editingThisTag && editingTranslation?.lang === viewLang && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.06)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--indigo)', letterSpacing: '0.08em' }}>
                    TRANSLATION — {LANGUAGES.find(l => l.code === viewLang)?.label || viewLang}
                  </span>
                  <input
                    value={translationEdit.name}
                    onChange={e => setTranslationEdit(v => ({ ...v, name: e.target.value }))}
                    placeholder="Translated name…"
                    style={{ ...inputStyle, fontWeight: 800 }}
                  />
                  <textarea
                    value={translationEdit.description}
                    onChange={e => setTranslationEdit(v => ({ ...v, description: e.target.value }))}
                    placeholder="Translated description (optional)…"
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    <button style={btn('primary')} onClick={() => handleSaveTranslation(tag.id)}>SAVE</button>
                    <button style={btn('ghost')} onClick={() => setEditingTranslation(null)}>CANCEL</button>
                  </div>
                </div>
              )}

              {/* Other languages section */}
              {isLoadingT && (
                <p style={{ padding: '0.5rem 1rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>Loading translations…</p>
              )}
              {!isLoadingT && cached.filter(t => t.language !== viewLang).length > 0 && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 1rem 0.75rem' }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>OTHER LANGUAGES</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {cached.filter(t => t.language !== viewLang).map(t => (
                      <div key={t.language} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-input)', borderRadius: '0.4rem', padding: '0.35rem 0.6rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--indigo)', minWidth: '2.5rem' }}>{t.language.toUpperCase()}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', flex: 1 }}>{t.name}</span>
                        <button
                          style={{ ...btn('ghost'), fontSize: '0.6rem' }}
                          onClick={() => { setEditingTranslation({ tagId: tag.id, lang: t.language }); setTranslationEdit({ name: t.name, description: t.description || '' }) }}
                        >✎</button>
                        <button
                          style={{ ...btn('danger'), fontSize: '0.6rem' }}
                          onClick={() => handleDeleteTranslation(tag.id, t.language)}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {/* Hub selector */}
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
          {/* Language selector */}
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setViewLang(lang.code)}
                title={lang.label}
                style={{
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  borderRadius: '2rem',
                  cursor: 'pointer',
                  border: `1px solid ${viewLang === lang.code ? 'var(--indigo)' : 'var(--border)'}`,
                  background: viewLang === lang.code ? 'var(--indigo)' : 'var(--bg-input)',
                  color: viewLang === lang.code ? '#fff' : 'var(--text-muted)',
                }}
              >
                {lang.code.toUpperCase()}
              </button>
            ))}
          </div>
          {viewLang !== 'en' && (
            <p style={{ fontSize: '0.6rem', color: 'var(--indigo)', fontWeight: 700, margin: 0 }}>
              🌐 Viewing in {LANGUAGES.find(l => l.code === viewLang)?.label || viewLang} · 🌐 = translated
            </p>
          )}
        </div>
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

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid var(--indigo)', borderRadius: '0.75rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--indigo)' }}>{selectedIds.size} selected</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            {Array.from(selectedIds).some(id => taxonomy.unconfirmed.find(t => t.id === id)) && (
              <button style={btn('success')} onClick={handleBulkConfirm} disabled={isPending}>APPROVE SELECTED</button>
            )}
            <button style={btn('danger')} onClick={handleBulkDelete} disabled={isPending}>DELETE SELECTED</button>
            <button style={btn('ghost')} onClick={() => setSelectedIds(new Set())}>CLEAR</button>
          </div>
        </div>
      )}

      {/* Select All Checkbox for current page */}
      {pagedTags.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.5rem 0.5rem', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            checked={pagedTags.length > 0 && pagedTags.every(t => selectedIds.has(t.id))}
            onChange={toggleAllSelection}
            style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer', accentColor: 'var(--indigo)' }}
          />
          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>Select All on Page</span>
        </div>
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
