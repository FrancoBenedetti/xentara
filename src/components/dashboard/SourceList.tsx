import { getSources } from '@/app/dashboard/actions'
import styles from '@/app/dashboard/dashboard.module.css'
import AddSourceForm from './AddSourceForm'

export default async function SourceList({ hubId }: { hubId: string }) {
  const sources = await getSources(hubId)

  return (
    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Monitored Sources
        </h4>
        <AddSourceForm hubId={hubId} />
      </div>

      {sources.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic' }}>No sources configured yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sources.map((source) => (
            <li 
              key={source.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.875rem' 
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{source.name}</span>
                <span style={{ color: '#4b5563', marginLeft: '0.5rem' }}>({source.type})</span>
              </div>
              <div style={{ color: '#6366f1', fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {source.url}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
