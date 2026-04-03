import { getHubs, getPublicationHistory, Hub } from '../actions'
import PublicationCard from '@/components/dashboard/PublicationCard'

async function HistorySection({ hub }: { hub: Hub }) {
  const history = await getPublicationHistory(hub.id)
  if (history.length === 0) return null;

  return (
    <section key={hub.id}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
          <div style={{ padding: '0.4rem 0.8rem', background: 'var(--indigo)', color: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 900 }}>{hub.name.toUpperCase()}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{history.length} ITEMS ARCHIVED</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {history.map(pub => (
          <PublicationCard key={pub.id} pub={pub} />
        ))}
      </div>
    </section>
  )
}

export default async function HistoryPage() {
  const hubs = await getHubs()

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>PUBLICATION HISTORY</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>Archived intelligence curated by your team.</p>
      </header>

        {hubs.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>No hubs found. Curate content in the feed to build your history.</p>
          </div>
        ) : (
          hubs.map((hub) => (
            <HistorySection key={hub.id} hub={hub} />
          ))
        )}
    </div>
  )
}
