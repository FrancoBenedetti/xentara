'use client'

import { useState, useEffect } from 'react'
import styles from '@/app/dashboard/dashboard.module.css'

export interface HelpArticle {
  slug: string
  title: string
  content: string
  description: string
}

interface HelpSystemProps {
  articles?: HelpArticle[]
}

export default function HelpSystem({ articles = [] }: HelpSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)

  // Prevent scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* TRIGGER BUTTON (FLOAT) */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          background: 'var(--indigo)',
          color: 'white',
          border: 'none',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
          cursor: 'pointer',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 900,
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(99, 102, 241, 0.5)'
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.4)'
        }}
      >
        ?
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* DRAWER */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(500px, 90vw)',
          height: '100vh',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          color: 'var(--text-main)'
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
          <div>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--indigo)', letterSpacing: '0.2em', margin: 0, textTransform: 'uppercase' }}>Knowledge Base</h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>Xentara Studio Help & Documentation</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ 
              background: 'var(--bg-input)', 
              border: '1px solid var(--border)', 
              color: 'var(--text-main)', 
              cursor: 'pointer', 
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--indigo)'
                e.currentTarget.style.transform = 'rotate(90deg)'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'rotate(0deg)'
            }}
          >✕</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-surface)' }}>
          {!selectedArticle ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.map(article => (
                <button
                  key={article.slug}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.75rem',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--indigo)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{article.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.8, lineHeight: 1.5, fontWeight: 500 }}>
                    {article.description}
                  </p>
                  <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--indigo)', fontWeight: 800, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    READ MORE <span style={{ transition: 'transform 0.2s' }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="help-content">
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--indigo)', 
                    fontWeight: 800, 
                    fontSize: '0.75rem', 
                    cursor: 'pointer', 
                    marginBottom: '2rem', 
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
              >
                ← BACK TO OVERVIEW
              </button>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {/* Basic markdown rendering via simple string replacement for headers since we don't have a parser yet */}
                <div dangerouslySetInnerHTML={{ 
                    __html: selectedArticle.content
                        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/^---/gm, '<hr />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
                        .replace(/^[\-\*] (.*$)/gm, '<li>$1</li>')
                }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '2rem', background: 'var(--bg-input)', borderTop: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 700, letterSpacing: '0.02em' }}>
            XENTARA COLLECTIVE OPERATIONAL INTELLIGENCE
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .help-content h1 { font-size: 1.25rem; margin-top: 0; margin-bottom: 1rem; color: var(--text-main); font-weight: 800; line-height: 1.3; }
        .help-content h2 { font-size: 1.05rem; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--text-main); font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
        .help-content h3 { font-size: 0.95rem; margin-top: 1.25rem; margin-bottom: 0.5rem; color: var(--text-main); font-weight: 600; }
        .help-content p { margin-bottom: 0.75rem; line-height: 1.6; font-size: 0.85rem; color: var(--text-muted); }
        .help-content ul { margin-bottom: 1rem; padding-left: 1.25rem; }
        .help-content li { margin-bottom: 0.5rem; line-height: 1.5; font-size: 0.85rem; color: var(--text-muted); list-style-type: disc; }
        .help-content hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; opacity: 0.5; }
        .help-content strong { color: var(--text-main); font-weight: 700; }
        .help-content code { background: var(--bg-input); border: 1px solid var(--border); padding: 0.15rem 0.35rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.8em; color: var(--indigo); }
        .help-content a { color: var(--indigo); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .help-content a:hover { border-color: var(--indigo); }
      `}</style>
    </>
  )
}
