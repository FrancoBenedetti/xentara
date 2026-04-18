'use client'

import { useState } from 'react'
import { BASE_REACTION_SET, DEFAULT_REACTIONS } from '@/lib/engagement/reactions'
import { updateEngagementConfig } from '@/app/dashboard/hubs/settings-actions'

export default function EngagementSettings({
  hubId,
  initialConfig
}: {
  hubId: string;
  initialConfig: { reactions_enabled: string[], comments_enabled: boolean } | null;
}) {
  const [reactions, setReactions] = useState<string[]>(
    initialConfig?.reactions_enabled ?? DEFAULT_REACTIONS
  );
  const [commentsEnabled, setCommentsEnabled] = useState<boolean>(
    initialConfig?.comments_enabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleReaction = (key: string) => {
    setReactions(prev => 
      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEngagementConfig(hubId, reactions, commentsEnabled);
      alert('Engagement settings saved successfully');
    } catch (e: any) {
      alert('Error saving engagement settings: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const allReactions = Object.values(BASE_REACTION_SET);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.5rem', marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Engagement Configuration</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Select which reactions and engagement signals to collect from your audience.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Available Reactions</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {allReactions.map(r => (
              <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={reactions.includes(r.key)} 
                  onChange={() => toggleReaction(r.key)}
                  style={{ accentColor: 'var(--indigo)' }}
                />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{r.emoji} {r.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
           <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>Comment Settings</h4>
           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
             <input 
               type="checkbox" 
               checked={commentsEnabled} 
               onChange={(e) => setCommentsEnabled(e.target.checked)}
               style={{ accentColor: 'var(--indigo)' }}
             />
             <span style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Allow readers to submit comments</span>
           </label>
        </div>
      </div>

      <button 
        onClick={handleSave} 
        disabled={isSaving}
        style={{
          background: 'var(--indigo)',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem',
          fontWeight: 500
        }}
      >
        {isSaving ? 'Saving...' : 'Save Engagement Config'}
      </button>
    </div>
  )
}
