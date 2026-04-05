'use client'

import React from 'react'
import Link from 'next/link'
import styles from '@/app/dashboard/dashboard.module.css'
import { Hub, Publication } from '@/app/dashboard/actions'

interface HubSummaryCardProps {
  hub: Hub
  recentPublications: Publication[]
  sourceCount: number
}

export default function HubSummaryCard({ hub, recentPublications, sourceCount }: HubSummaryCardProps) {
  return (
    <div className={styles.hubSummaryCard}>
      <header className={styles.hubSummaryHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 className={styles.hubSummaryTitle}>{hub.name}</h3>
            <p className={styles.hubSummarySlug}>/communities/{hub.slug}</p>
          </div>
          <span className={styles.hubSummaryBadge}>
            {sourceCount} Active Sources
          </span>
        </div>
      </header>

      <div className={styles.hubSummaryPulse}>
        <h4 className={styles.hubSummaryPulseTitle}>Recent Intelligence</h4>
        {recentPublications.length === 0 ? (
          <p className={styles.hubSummaryEmpty}>Collective is initializing...</p>
        ) : (
          <div className={styles.hubSummaryList}>
            {recentPublications.slice(0, 3).map((pub) => (
              <div key={pub.id} className={styles.hubSummaryItem}>
                <div className={styles.hubSummaryItemDot} />
                <div className={styles.hubSummaryItemContent}>
                  <p className={styles.hubSummaryItemTitle}>{pub.title}</p>
                  <p className={styles.hubSummaryItemMeta}>
                    {new Date(pub.published_at || Date.now()).toLocaleDateString()} • {pub.monitored_sources?.name || 'Channel'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link 
        href={`/dashboard/hubs/${hub.slug}`} 
        className={styles.hubSummaryButton}
      >
        View Collective ↗
      </Link>
    </div>
  )
}
