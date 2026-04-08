import { getHubs, getHubSubscriberCount, Hub } from '../actions'
import BrandingForm from '@/components/dashboard/BrandingForm'
import TaxonomyManager from '@/components/dashboard/TaxonomyManager'
import TeamManager from '@/components/dashboard/TeamManager'

export default async function SettingsPage() {
  const hubsResult = await getHubs()
  
  const hubs = await Promise.all(
    hubsResult.map(async (hub: Hub) => {
      const subscriberCount = await getHubSubscriberCount(hub.id)
      return { ...hub, subscriberCount }
    })
  )

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
          hubs.map((hub) => (
            <div key={hub.id} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 900 }}>{hub.name}</h2>
                    <p style={{ fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 800, textTransform: 'uppercase' }}>/community-intelligence/{hub.slug}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.6rem', opacity: 0.4, fontWeight: 800, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>REFERENCE: {hub.id.slice(0, 8)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 800 }}>
                      ◆ {hub.subscriberCount} Subscriber{hub.subscriberCount !== 1 ? 's' : ''}
                    </div>
                  </div>
               </div>

               <BrandingForm hub={hub as Hub} />
               
               <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border)' }} />

               <TaxonomyManager hubId={hub.id} initialStrictness={hub.strictness || 'exploratory'} />

               <div style={{ margin: '2rem 0', borderTop: '1px solid var(--border)' }} />

               <TeamManager hubId={hub.id} userRole={hub.role || 'viewer'} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
