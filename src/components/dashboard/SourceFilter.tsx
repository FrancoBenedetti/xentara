'use client'

import React from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import styles from '@/app/dashboard/dashboard.module.css'
import { MonitoredSource } from '@/app/dashboard/actions'

interface SourceFilterProps {
  sources: MonitoredSource[]
  activeSourceId?: string
}

export default function SourceFilter({ sources, activeSourceId }: SourceFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setFilter = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('s', id)
    } else {
      params.delete('s')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className={styles.sourceFilterContainer}>
      <div className={styles.sourceFilterScroll}>
        <button
          onClick={() => setFilter(null)}
          className={`${styles.sourceChip} ${!activeSourceId ? styles.sourceChipActive : ''}`}
        >
          Unified Feed
        </button>
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setFilter(source.id)}
            className={`${styles.sourceChip} ${activeSourceId === source.id ? styles.sourceChipActive : ''}`}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  )
}
