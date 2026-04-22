'use client'

import { useState, useEffect } from 'react'
import styles from '@/app/dashboard/dashboard.module.css'

interface HelpArticle {
  slug: string
  title: string
  content: string
  description: string
}

export default function HelpSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null)
  const [articles, setArticles] = useState<HelpArticle[]>([
    {
      slug: 'taxonomy-guide',
      title: 'Understanding Taxonomy',
      description: 'Learn about the difference between tags, flavors, and how to manage your hub taxonomy.',
      content: `
# Understanding Xentara Taxonomy: Tags vs. Flavors

The Xentara Taxonomy system is a multi-stage intelligence pipeline designed to turn raw data into structured, actionable insights.

---

## 1. Raw Tags (AI Discoveries)
When content is ingested, the AI identifies keywords. These appear on the **Publication Card**.
- **Transient:** Keywords extracted directly from content.
- **Unmanaged:** They don't belong to your permanent hub taxonomy yet.

## 2. Hub Flavors (Lenses)
Flavors are the **Confirmed Lenses** of your Hub.
- **AI Drafts:** Proposed significant topics in the **Taxonomy Studio**.
- **Confirmed Flavors:** Approved categories for high-precision filtering.

## 3. Management Actions
- **Acceptance:** Promote a draft to a confirmed flavor.
- **Merging:** Combine similar flavors into one.
- **Deletion:** Permanently remove a flavor.

## 4. Manual Refinement: Suppression
In the **Republish Modal**, use the suppression toggle to fine-tune exactly which flavors are associated with a specific post. Even if a tag is correct, you might want to exclude it from the public feed.
      `
    },
    {
        slug: 'publishing-workflow',
        title: 'Publishing Workflow',
        description: 'How to use the Republish Modal to refine and distribute content.',
        content: `
# The Publishing Workflow

Xentara acts as an intelligence buffer. Nothing goes live to your Collective until you refine it.

---

## 1. The Republish Modal
Clicking "Republish" on a card opens the command center for that article.

## 2. Editing the Synopsis
The AI generates a 2-3 sentence synopsis. You should review and edit this to match your Hub's voice before publishing.

## 3. Tag Suppression
As explained in the Taxonomy Guide, you can toggle flavors on or off. This controls which "lenses" the article appears under in the final feed.

## 4. Final Distribution
Once you click "Confirm & Publish", the article moves from your private board to the public-facing Collective feed.
        `
    },
    {
      slug: 'telegram-distribution',
      title: 'Adding a Telegram Channel',
      description: 'Step-by-step guide to configuring a Telegram channel for automated content distribution.',
      content: `
# Adding a Telegram Distribution Channel

You can automatically distribute your Hub's curated content to a Telegram channel. Follow these steps to configure your channel and link it to Xentara.

---

## 1. Create a Telegram Channel
If you don't already have one, open Telegram and create a new channel. You can set it to either **Public** or **Private** based on your needs.

## 2. Add the Xentara Bot as Admin
To allow Xentara to post messages on your behalf, you need to add our bot to your channel as an administrator.
- Open your channel settings.
- Go to **Administrators** > **Add Admin**.
- Search for the Xentara bot username (check your specific hub settings for the exact bot name, usually it is your designated bot).
- Grant the bot permission to **Post Messages**.

## 3. Obtain the Channel ID
Xentara needs your Channel ID to know exactly where to send the content.
- For **Public Channels**: The Channel ID is simply the username with an \`@\` symbol (e.g., \`@my_channel_name\`).
- For **Private Channels**:
  - You can use a bot like \`@JsonDumpBot\`, \`@RawDataBot\`, or \`@userinfobot\`. Forward a message from your private channel to one of these bots to reveal the raw message data.
  - Look for the \`chat.id\` field in the response (it usually starts with \`-100\`, e.g., \`-1001234567890\`).

## 4. Link the Channel in Xentara
Once you have the Channel ID:
- Navigate to your Hub Settings at \`/dashboard/[slug]/settings\`.
- Locate the **Add Channel** dialogue in the Distribution Channels section.
- Select Telegram and paste your Channel ID into the required field.
- Save your settings to activate the distribution pipeline.
      `
    }
  ])

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

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', background: 'var(--bg-surface)' }}>
          {!selectedArticle ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {articles.map(article => (
                <button
                  key={article.slug}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    textAlign: 'left',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.25rem',
                    padding: '1.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    outline: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--indigo)'
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.3)'
                  }}
                  onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>{article.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.7, lineHeight: 1.6, fontWeight: 500 }}>
                    {article.description}
                  </p>
                  <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--indigo)', fontWeight: 900, letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    OPEN DOCUMENTATION <span style={{ transition: 'transform 0.2s' }}>→</span>
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
                        .replace(/^---/gm, '<hr />')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^\- (.*$)/gm, '<li>$1</li>')
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

        .help-content h1 { font-size: 1.5rem; margin-bottom: 1.5rem; color: var(--text-main); }
        .help-content h2 { font-size: 1.1rem; margin-top: 2rem; margin-bottom: 1rem; color: var(--text-main); }
        .help-content p { margin-bottom: 1rem; line-height: 1.7; font-size: 0.9rem; color: var(--text-muted); }
        .help-content ul { margin-bottom: 1.5rem; padding-left: 1.25rem; }
        .help-content li { margin-bottom: 0.75rem; line-height: 1.6; font-size: 0.9rem; color: var(--text-muted); }
        .help-content hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
        .help-content strong { color: var(--text-main); font-weight: 700; }
      `}</style>
    </>
  )
}
