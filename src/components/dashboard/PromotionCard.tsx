'use client'

import { useState } from 'react'
import { HubPromotion } from '@/app/dashboard/actions'

// ── Type metadata ──────────────────────────────────────────────────────────

const TYPE_META: Record<HubPromotion['type'], { icon: string; label: string; color: string; bg: string }> = {
  announcement: {
    icon: '📢',
    label: 'ANNOUNCEMENT',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.07)',
  },
  promotion: {
    icon: '🎁',
    label: 'PROMOTION',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.07)',
  },
  commercial: {
    icon: '💼',
    label: 'SPONSORED',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.07)',
  },
  campaign: {
    icon: '🚀',
    label: 'CAMPAIGN',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.07)',
  },
}

// ── Component ──────────────────────────────────────────────────────────────

interface PromotionCardProps {
  promotion: HubPromotion
  /** Called when user suppresses this card (only if allow_suppress = true) */
  onSuppress?: (id: string) => void
}

export default function PromotionCard({ promotion, onSuppress }: PromotionCardProps) {
  const [suppressed, setSuppressed] = useState(false)
  const meta = TYPE_META[promotion.type]

  if (suppressed) return null

  const handleSuppress = () => {
    setSuppressed(true)
    onSuppress?.(promotion.id)
  }

  const hasLinks = promotion.links && promotion.links.length > 0

  return (
    <div
      style={{
        position: 'relative',
        background: meta.bg,
        border: `1px solid ${meta.color}33`,
        borderLeft: `3px solid ${meta.color}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        marginBottom: '0.75rem',
        overflow: 'hidden',
        // Subtle shimmer stripe in the top-right corner for premium feel
        backgroundImage: `
          radial-gradient(ellipse at 90% 0%, ${meta.color}15 0%, transparent 60%),
          linear-gradient(135deg, transparent 70%, ${meta.color}08 100%)
        `,
      }}
    >
      {/* Type badge + suppress button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}44`,
            color: meta.color,
            fontSize: '0.58rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            padding: '0.18rem 0.55rem',
            borderRadius: '2rem',
          }}
        >
          <span>{meta.icon}</span>
          {meta.label}
          {promotion.campaign_code && (
            <span style={{ opacity: 0.75, fontWeight: 700, marginLeft: '0.2rem' }}>
              · {promotion.campaign_code}
            </span>
          )}
        </span>

        {promotion.allow_suppress && (
          <button
            onClick={handleSuppress}
            title="Don't show this again"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              padding: '0.2rem 0.4rem',
              borderRadius: '4px',
              opacity: 0.5,
              transition: 'opacity 0.15s',
              lineHeight: 1,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Title */}
      <p
        style={{
          margin: 0,
          fontWeight: 900,
          fontSize: '0.95rem',
          color: 'var(--text-main)',
          lineHeight: 1.35,
          marginBottom: promotion.body ? '0.5rem' : hasLinks ? '0.75rem' : 0,
        }}
      >
        {promotion.title}
      </p>

      {/* Body */}
      {promotion.body && (
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: hasLinks ? '0.75rem' : 0,
          }}
        >
          {promotion.body}
        </p>
      )}

      {/* Link chips */}
      {hasLinks && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {promotion.links!.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.75rem',
                background: meta.color,
                color: '#fff',
                borderRadius: '2rem',
                fontSize: '0.7rem',
                fontWeight: 900,
                textDecoration: 'none',
                letterSpacing: '0.03em',
                boxShadow: `0 2px 8px ${meta.color}40`,
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.85'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}

      {/* Date range indicator (subtle footer) */}
      {(promotion.start_date || promotion.end_date) && (
        <p style={{ margin: '0.6rem 0 0', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, opacity: 0.6 }}>
          {promotion.start_date && !promotion.end_date && `From ${new Date(promotion.start_date).toLocaleDateString()}`}
          {!promotion.start_date && promotion.end_date && `Until ${new Date(promotion.end_date).toLocaleDateString()}`}
          {promotion.start_date && promotion.end_date && (
            `${new Date(promotion.start_date).toLocaleDateString()} – ${new Date(promotion.end_date).toLocaleDateString()}`
          )}
        </p>
      )}
    </div>
  )
}
