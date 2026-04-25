'use client'

import { useState } from 'react'
import BrandingForm from './BrandingForm'
import TaxonomyManager from './TaxonomyManager'
import TeamManager from './TeamManager'
import DistributionSettings from './DistributionSettings'
import PromotionsManager from './PromotionsManager'
import EngagementSettings from './EngagementSettings'
import ContentSettings from './ContentSettings'
import type { Hub } from '@/app/dashboard/actions'

type Tab = 'branding' | 'taxonomy' | 'promotions' | 'team' | 'distribution' | 'engagement' | 'content'

export default function HubSettingsTabs({ 
  hub, 
  channels, 
  logs,
  promotions,
  engagementConfig
}: { 
  hub: Hub & { subscriberCount: number, role?: string, strictness?: string, content_language?: string }, 
  channels: any[], 
  logs: any[],
  promotions: any[],
  engagementConfig?: any
}) {
  const [activeTab, setActiveTab] = useState<Tab>('branding')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'taxonomy', label: 'Intel Flavors', icon: '🧬' },
    { id: 'promotions', label: 'Promotions', icon: '📢' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'distribution', label: 'Distribution', icon: '✈️' },
    { id: 'engagement', label: 'Engagement', icon: '💬' },
    { id: 'content', label: 'Content', icon: '📝' },
  ]

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '2rem', 
        background: 'rgba(255,255,255,0.03)', 
        padding: '0.4rem', 
        borderRadius: '12px',
        width: 'fit-content',
        border: '1px solid var(--border)',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--indigo)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content" style={{ animation: 'fadeIn 0.3s ease' }}>
        {activeTab === 'branding' && <BrandingForm hub={hub} />}
        {activeTab === 'taxonomy' && <TaxonomyManager hubId={hub.id} initialStrictness={hub.strictness || 'exploratory'} />}
        {activeTab === 'promotions' && <PromotionsManager hubId={hub.id} initialPromotions={promotions} />}
        {activeTab === 'team' && <TeamManager hubId={hub.id} userRole={hub.role || 'viewer'} />}
        {activeTab === 'distribution' && <DistributionSettings hubId={hub.id} initialChannels={channels} logs={logs} />}
        {activeTab === 'engagement' && <EngagementSettings hubId={hub.id} initialConfig={engagementConfig} />}
        {activeTab === 'content' && <ContentSettings hubId={hub.id} initialLanguage={hub.content_language} />}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
