'use client'

import { useState } from 'react'
import { updateHubContentLanguage } from '@/app/dashboard/actions'

export default function ContentSettings({ hubId, initialLanguage }: { hubId: string, initialLanguage?: string }) {
  const [language, setLanguage] = useState(initialLanguage || 'en-GB')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setLanguage(val)
    setLoading(true)
    setSaved(false)
    try {
      await updateHubContentLanguage(hubId, val)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
      alert("Failed to update language")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ padding: '2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '1rem', marginTop: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>Content Settings</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure how content is processed and presented for this hub.</p>
      </header>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <label style={{ display: 'block' }}>
          <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Language</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <select 
              value={language}
              onChange={handleLanguageChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              <option value="en-GB">UK English (en-GB)</option>
              <option value="af">Afrikaans (af)</option>
              <option value="original">Keep Original Language</option>
            </select>
            {loading && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Saving...</span>}
            {saved && !loading && <span style={{ fontSize: '0.8rem', color: 'var(--emerald)' }}>Saved</span>}
          </div>
        </label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          This instructs the intelligence pipeline to translate and format AI-generated content (like titles, bylines, and summaries) into the selected language.
        </p>
      </div>
    </section>
  )
}
