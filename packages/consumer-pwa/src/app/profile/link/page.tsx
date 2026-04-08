'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const API_BASE = process.env.NEXT_PUBLIC_XENTARA_API_BASE ?? 'http://localhost:3000'

type Platform = 'telegram' | 'whatsapp'

export default function LinkIdentityPage() {
  const supabase = createClient()
  const router = useRouter()

  const [step, setStep] = useState<'select' | 'input' | 'code' | 'done'>('select')
  const [platform, setPlatform] = useState<Platform>('telegram')
  const [platformUserId, setPlatformUserId] = useState('')
  const [platformUsername, setPlatformUsername] = useState('')
  const [code, setCode] = useState('')
  const [claimCode, setClaimCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectPlatform = (p: Platform) => {
    setPlatform(p)
    setStep('input')
    setError(null)
  }

  const handleGenerateCode = async () => {
    setLoading(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }

    try {
      const res = await fetch(`${API_BASE}/api/v1/identity/link`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          platform_user_id: platformUserId,
          platform_username: platformUsername || undefined,
        }),
      })

      if (res.status === 409) {
        setError('This account is already linked to another user.')
        setLoading(false)
        return
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to generate code.')
        setLoading(false)
        return
      }

      const data = await res.json()
      setCode(data.token)
      setStep('code')
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  const handleClaim = async () => {
    setLoading(true)
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    try {
      const res = await fetch(`${API_BASE}/api/v1/identity/claim`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: claimCode || code }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to claim token.')
        setLoading(false)
        return
      }

      setStep('done')
    } catch {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="nav-brand">Xentara</Link>
        </div>
      </nav>

      <main className="container">
        <header className="profile-header">
          <Link href="/profile" className="feed-back">← Back to Profile</Link>
          <h1 className="profile-title">Link Messenger Account</h1>
        </header>

        {step === 'select' && (
          <section className="link-step">
            <p className="link-step-desc">
              Select the platform you want to link to your Xentara identity.
            </p>
            <div className="link-platforms">
              <button onClick={() => handleSelectPlatform('telegram')} className="link-platform-card">
                <span className="link-platform-icon">✈️</span>
                <span className="link-platform-name">Telegram</span>
              </button>
              <button onClick={() => handleSelectPlatform('whatsapp')} className="link-platform-card">
                <span className="link-platform-icon">💬</span>
                <span className="link-platform-name">WhatsApp</span>
              </button>
            </div>
          </section>
        )}

        {step === 'input' && (
          <section className="link-step">
            <p className="link-step-desc">
              Enter your {platform === 'telegram' ? 'Telegram' : 'WhatsApp'} details to generate a linking code.
            </p>
            <div className="profile-form">
              <div className="auth-field">
                <label htmlFor="platform-id">
                  {platform === 'telegram' ? 'Telegram User ID' : 'WhatsApp Phone Number'}
                </label>
                <input
                  id="platform-id"
                  type="text"
                  value={platformUserId}
                  onChange={e => setPlatformUserId(e.target.value)}
                  className="auth-input"
                  placeholder={platform === 'telegram' ? 'e.g. 123456789' : 'e.g. +1234567890'}
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="platform-username">Username (optional)</label>
                <input
                  id="platform-username"
                  type="text"
                  value={platformUsername}
                  onChange={e => setPlatformUsername(e.target.value)}
                  className="auth-input"
                  placeholder={platform === 'telegram' ? '@yourusername' : 'Display name'}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                onClick={handleGenerateCode}
                disabled={loading || !platformUserId.trim()}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Generating...' : 'Generate Link Code'}
              </button>
              <button onClick={() => setStep('select')} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                ← Choose Different Platform
              </button>
            </div>
          </section>
        )}

        {step === 'code' && (
          <section className="link-step">
            <div className="link-code-display">
              <p className="link-code-label">Your Linking Code</p>
              <div className="link-code-value">{code}</div>
              <p className="link-code-expires">Expires in 15 minutes</p>
            </div>
            <div className="link-instructions">
              <p className="link-step-desc">
                {platform === 'telegram'
                  ? 'Send this code to the @XentaraBot on Telegram to complete linking.'
                  : 'Send this code to the Xentara WhatsApp number to complete linking.'}
              </p>
              <p className="link-step-hint">
                For testing: you can manually claim the code below.
              </p>
            </div>

            <div className="profile-form" style={{ marginTop: '1.5rem' }}>
              <div className="auth-field">
                <label htmlFor="claim-code">Claim Code (Testing)</label>
                <input
                  id="claim-code"
                  type="text"
                  value={claimCode || code}
                  onChange={e => setClaimCode(e.target.value)}
                  className="auth-input"
                  placeholder="Enter the 6-digit code"
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                onClick={handleClaim}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {loading ? 'Claiming...' : 'Claim & Verify'}
              </button>
            </div>
          </section>
        )}

        {step === 'done' && (
          <section className="link-step">
            <div className="link-success">
              <div className="link-success-icon">✓</div>
              <h2 className="link-success-title">Account Linked!</h2>
              <p className="link-step-desc">
                Your {platform === 'telegram' ? 'Telegram' : 'WhatsApp'} account is now linked to your Xentara profile.
                Any previous activity from this messenger will be consolidated into your account.
              </p>
              <Link href="/profile" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Back to Profile
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
