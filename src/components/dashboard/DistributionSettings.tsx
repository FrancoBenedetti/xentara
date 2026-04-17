'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addHubChannel, toggleHubChannel, deleteHubChannel } from '@/app/dashboard/hubs/settings-actions'
import styles from '@/app/dashboard/dashboard.module.css'

export default function DistributionSettings({ hubId, initialChannels, logs }: { hubId: string, initialChannels: any[], logs: any[] }) {
  const router = useRouter()
  const [channels, setChannels] = useState(initialChannels)
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)

  // Sync state with props when server data changes via router.refresh()
  useEffect(() => {
    setChannels(initialChannels)
  }, [initialChannels])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await addHubChannel(hubId, formData)
      setIsAdding(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Failed to add channel')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      setChannels(c => c.map(ch => ch.id === id ? { ...ch, is_active: !current } : ch))
      await toggleHubChannel(id, !current)
    } catch (err) {
      console.error(err)
      alert('Failed to toggle')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this channel?')) return
    try {
      await deleteHubChannel(id)
      setChannels(c => c.filter(ch => ch.id !== id))
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Distribution Channels</h2>
      
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {channels.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No channels configured.</p>
        ) : (
          channels.map(ch => (
            <div key={ch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-color)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{ch.platform === 'telegram' ? '✈️' : '💬'}</span>
                  <strong style={{ color: 'var(--text-main)' }}>{ch.channel_name || ch.channel_id}</strong>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {ch.platform} • {ch.channel_id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={ch.is_active} onChange={() => handleToggle(ch.id, ch.is_active)} />
                  Active
                </label>
                <button onClick={() => handleDelete(ch.id)} style={{ padding: '0.4rem 0.8rem', background: 'var(--error-bg)', color: 'var(--error-text)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Platform</label>
            <select name="platform" required style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', colorScheme: 'dark' }}>
              <option value="telegram">Telegram</option>
              <option value="whatsapp" disabled>WhatsApp (Coming soon)</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Channel Name (Optional)</label>
            <input type="text" name="channel_name" placeholder="e.g. Acme Co General" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Channel ID / Chat ID</label>
            <input type="text" name="channel_id" required placeholder="e.g. -100123456789" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} style={{ background: 'var(--indigo)', color: 'white', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Adding...' : 'Add Channel'}</button>
            <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.8rem 1.5rem', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)} style={{ background: 'var(--indigo)', color: 'white', padding: '0.8rem 1.5rem', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, marginBottom: '3rem' }}>
          + Add Channel
        </button>
      )}

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>Recent Distribution Logs</h2>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: 'var(--text-main)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem 0' }}>Date</th>
              <th style={{ padding: '1rem 0' }}>Publication</th>
              <th style={{ padding: '1rem 0' }}>Platform</th>
              <th style={{ padding: '1rem 0' }}>Target</th>
              <th style={{ padding: '1rem 0' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>No distribution logs found.</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ padding: '1rem 0', fontSize: '0.9rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.publication?.title || 'Unknown'}</td>
                  <td style={{ padding: '1rem 0', fontSize: '0.9rem', textTransform: 'capitalize' }}>{log.platform}</td>
                  <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>{log.channel?.channel_name || log.target_id}</td>
                  <td style={{ padding: '1rem 0', fontSize: '0.9rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem',
                      background: log.status === 'sent' ? 'rgba(46, 213, 115, 0.2)' : log.status === 'failed' ? 'rgba(255, 71, 87, 0.2)' : 'rgba(255, 165, 2, 0.2)',
                      color: log.status === 'sent' ? '#2ed573' : log.status === 'failed' ? '#ff4757' : '#ffa502'
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
