'use client'

export default function SettingsLoading() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ height: '1.5rem', width: '220px', background: 'var(--border)', borderRadius: '4px', marginBottom: '0.75rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: '0.875rem', width: '360px', background: 'var(--border)', borderRadius: '4px', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite 0.2s' }} />
      </header>

      {[0, 1].map((i) => (
        <div
          key={i}
          style={{
            background: 'var(--bg-surface)',
            padding: '2rem',
            borderRadius: '1.5rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--card-shadow)',
            marginBottom: '3rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div>
              <div style={{ height: '1.25rem', width: '160px', background: 'var(--border)', borderRadius: '4px', marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ height: '0.7rem', width: '120px', background: 'var(--border)', borderRadius: '4px', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite 0.15s' }} />
            </div>
            <div style={{ height: '0.75rem', width: '80px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite 0.3s' }} />
          </div>

          {/* Tab skeletons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
            {[100, 120, 100, 80, 120].map((w, j) => (
              <div key={j} style={{ height: '2.2rem', width: `${w}px`, background: 'var(--border)', borderRadius: '8px', animation: `pulse 1.5s ease-in-out infinite ${j * 0.1}s` }} />
            ))}
          </div>

          {/* Content skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[1, 2, 3, 4].map((j) => (
              <div key={j}>
                <div style={{ height: '0.65rem', width: '80px', background: 'var(--border)', borderRadius: '4px', marginBottom: '0.75rem', animation: `pulse 1.5s ease-in-out infinite ${j * 0.1}s` }} />
                <div style={{ height: '2.5rem', background: 'var(--border)', borderRadius: '0.5rem', opacity: 0.5, animation: `pulse 1.5s ease-in-out infinite ${j * 0.1 + 0.1}s` }} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}
