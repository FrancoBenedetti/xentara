import { getHubs } from '../actions'
import BrandingForm from '@/components/dashboard/BrandingForm'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'

export default async function SettingsPage() {
  const hubs = await getHubs()

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '0.05em' }}>INTELLIGENCE CONTROL</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 600 }}>Professionally define your collective's visual DNA and semantic lenses.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {hubs.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', border: '2px dashed var(--border)', borderRadius: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontWeight: 800 }}>No hubs found. Return to your dashboard to initialize one.</p>
          </div>
        ) : (
          hubs.map(hub => (
            <div key={hub.id} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hub.name}</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 800, textTransform: 'uppercase' }}>/community-intelligence/{hub.slug}</p>
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 800, letterSpacing: '0.05em' }}>REFERENCE: {hub.id.slice(0, 8)}</div>
               </div>

               <BrandingForm hub={hub} />
               
               <TaxonomyManager hubId={hub.id} initialStrictness={hub.strictness || 'exploratory'} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
