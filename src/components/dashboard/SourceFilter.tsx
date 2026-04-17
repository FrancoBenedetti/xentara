'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeSource = sources.find((s) => s.id === activeSourceId)
  const label = activeSource ? activeSource.name : 'Unified Feed'

  const setFilter = (id: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (id) {
      params.set('s', id)
    } else {
      params.delete('s')
    }
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className={styles.sourceFilterContainer} ref={ref}>
      <div className={styles.sourceFilterDropdownWrapper}>
        {/* Trigger button */}
        <button
          onClick={() => setOpen((o) => !o)}
          className={`${styles.sourceFilterTrigger} ${activeSourceId ? styles.sourceFilterTriggerActive : ''}`}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {/* Active dot indicator */}
          <span
            className={styles.sourceFilterDot}
            style={{ background: activeSourceId ? 'var(--indigo)' : '#10b981' }}
          />
          <span className={styles.sourceFilterLabel}>{label}</span>
          {sources.length > 0 && (
            <span className={styles.sourceFilterCount}>
              {activeSourceId ? '1' : sources.length + 1} / {sources.length + 1}
            </span>
          )}
          {/* Chevron */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${styles.sourceFilterChevron} ${open ? styles.sourceFilterChevronOpen : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {/* Dropdown panel */}
        {open && (
          <div className={styles.sourceFilterDropdown} role="listbox">
            {/* Unified feed option */}
            <button
              role="option"
              aria-selected={!activeSourceId}
              onClick={() => setFilter(null)}
              className={`${styles.sourceDropdownItem} ${!activeSourceId ? styles.sourceDropdownItemActive : ''}`}
            >
              <span className={styles.sourceDropdownDot} style={{ background: '#10b981' }} />
              <span className={styles.sourceDropdownName}>Unified Feed</span>
              <span className={styles.sourceDropdownMeta}>All sources</span>
            </button>

            {sources.length > 0 && <div className={styles.sourceDropdownDivider} />}

            {sources.map((source) => (
              <button
                key={source.id}
                role="option"
                aria-selected={activeSourceId === source.id}
                onClick={() => setFilter(source.id)}
                className={`${styles.sourceDropdownItem} ${activeSourceId === source.id ? styles.sourceDropdownItemActive : ''}`}
              >
                <span className={styles.sourceDropdownDot} style={{ background: 'var(--indigo)' }} />
                <span className={styles.sourceDropdownName}>{source.name}</span>
                <span
                  className={styles.sourceDropdownType}
                  style={{
                    color:
                      source.type === 'rsshub'
                        ? 'var(--indigo)'
                        : source.type === 'youtube'
                        ? '#ef4444'
                        : '#f59e0b',
                  }}
                >
                  {source.type?.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
