'use client'

import { useState, useEffect } from 'react'
import { getSourceRules, addSourceRule, toggleSourceRule, deleteSourceRule } from '@/app/dashboard/actions'

interface Props {
  sourceId: string;
  sourceName: string;
  onClose: () => void;
}

export default function SourceRulesPanel({ sourceId, sourceName, onClose }: Props) {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form State
  const [ruleType, setRuleType] = useState<'blocklist' | 'allowlist'>('blocklist')
  const [value, setValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchRules = async () => {
    try {
      setLoading(true)
      const data = await getSourceRules(sourceId)
      setRules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRules()
  }, [sourceId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setIsSubmitting(true)
    try {
      await addSourceRule(sourceId, ruleType, value)
      setValue('')
      await fetchRules()
    } catch (err) {
      alert("Failed to add rule.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (ruleId: string, currentActive: boolean) => {
    try {
      setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: !currentActive } : r))
      await toggleSourceRule(ruleId, !currentActive)
    } catch (err) {
      alert("Failed to toggle rule.")
      fetchRules() // revert
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return
    try {
      setRules(rules.filter(r => r.id !== ruleId))
      await deleteSourceRule(ruleId)
    } catch (err) {
      alert("Failed to delete rule.")
      fetchRules() // revert
    }
  }

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'var(--bg-surface)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-10px 0 25px -5px rgba(0,0,0,0.5)',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Content Filters</h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rules for <strong>{sourceName}</strong></p>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
      </header>

      <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
        <form onSubmit={handleAdd} style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>Add New Rule</h3>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label style={{ flex: 1 }}>
              <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</span>
              <select value={ruleType} onChange={e => setRuleType(e.target.value as any)} style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--text-main)' }}>
                <option value="blocklist">Blocklist (Purge if matches)</option>
                <option value="allowlist">Allowlist (Purge if NOT matches)</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Keywords (Comma separated)</span>
              <input 
                type="text" 
                value={value} 
                onChange={e => setValue(e.target.value)}
                placeholder="e.g. crypto, nft, sponsored"
                style={{ width: '100%', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.25rem', color: 'var(--text-main)' }}
              />
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !value.trim()}
            style={{ width: '100%', padding: '0.6rem', background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'ADDING...' : 'ADD RULE'}
          </button>
        </form>

        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', textTransform: 'uppercase' }}>Active Rules</h3>
        {loading ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading rules...</p>
        ) : rules.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No filter rules defined.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {rules.map(rule => (
              <li key={rule.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: rule.rule_type === 'allowlist' ? 'var(--emerald)' : 'var(--rose)', background: rule.rule_type === 'allowlist' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', padding: '0.1rem 0.3rem', borderRadius: '0.25rem' }}>
                      {rule.rule_type.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{rule.match_mode.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600, wordBreak: 'break-all' }}>{rule.value}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => handleToggle(rule.id, rule.is_active)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: `1px solid ${rule.is_active ? 'var(--indigo)' : 'var(--border)'}`, background: rule.is_active ? 'rgba(99,102,241,0.1)' : 'transparent', color: rule.is_active ? 'var(--indigo)' : 'var(--text-muted)', cursor: 'pointer' }}>
                    {rule.is_active ? 'ON' : 'OFF'}
                  </button>
                  <button onClick={() => handleDelete(rule.id)} style={{ fontSize: '0.7rem', padding: '0.3rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border)', background: 'transparent', color: 'var(--rose)', cursor: 'pointer' }}>
                    DEL
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
