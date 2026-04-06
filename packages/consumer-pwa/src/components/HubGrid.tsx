import Link from 'next/link'
import type { Hub } from '@xentara/api-client'

export default function HubGrid({ hubs }: { hubs: Hub[] }) {
  if (hubs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">◎</div>
        <p className="empty-state-title">No Hubs Available</p>
        <p className="empty-state-text">Intelligence collectives will appear here once curators publish their feeds.</p>
      </div>
    )
  }

  return (
    <div className="hub-grid">
      {hubs.map(hub => (
        <Link key={hub.id} href={`/${hub.slug}`} className="hub-card">
          <div
            className="hub-card-accent"
            style={{ background: hub.brand_color ?? 'var(--indigo)' }}
          />
          <div>
            <p className="hub-card-name">{hub.name}</p>
            <p className="hub-card-slug">/{hub.slug}</p>
          </div>
          {hub.strictness && (
            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {hub.strictness === 'strict' ? '🎯 Strict Mode' : '🔭 Exploratory Mode'}
            </p>
          )}
          <p className="hub-card-arrow">Explore Intelligence →</p>
        </Link>
      ))}
    </div>
  )
}
