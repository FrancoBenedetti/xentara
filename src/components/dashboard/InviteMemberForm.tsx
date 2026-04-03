'use client'

import { useState } from 'react'
import { inviteMember } from '@/app/dashboard/actions'

export default function InviteMemberForm({ hubId }: { hubId: string }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await inviteMember(hubId, email, role)
      setEmail('')
      setMessage('Invitation sent successfully.')
    } catch (err: any) {
      setMessage(err.message || 'Failed to send invitation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.03)', borderRadius: '1rem', border: '1px dashed var(--indigo)' }}>
      <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--indigo)', marginBottom: '1rem', textTransform: 'uppercase' }}>
        Invite New Curator
      </h4>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="colleague@organization.com"
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--text-main)',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              background: 'var(--bg-main)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              color: 'var(--text-main)',
              fontSize: '0.875rem'
            }}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.6rem 1.5rem',
            background: 'var(--indigo)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: 800,
            fontSize: '0.75rem',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          {loading ? 'SENDING...' : 'INVITE'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '1rem', fontSize: '0.7rem', fontWeight: 700, color: message.includes('Failed') ? '#ef4444' : 'var(--indigo)' }}>
          {message.toUpperCase()}
        </p>
      )}
    </div>
  )
}
