'use client'

import { login, signup } from './actions'
import styles from './login.module.css'
import { useState, useActionState } from 'react'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  
  // React 19 / Next 15 Pattern
  const [error, action, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      if (isLogin) {
        return await login(formData)
      } else {
        return await signup(formData)
      }
    },
    null
  )

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.title}>XENTARA</div>
        <p className={styles.subtitle}>
          {isLogin ? 'Welcome back, Custodian.' : 'Initialize your community hub.'}
        </p>

        <form action={action}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email address</label>
            <input 
              id="email"
              name="email"
              type="email" 
              className={styles.input} 
              placeholder="name@example.com"
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              name="password"
              type="password" 
              className={styles.input} 
              placeholder="••••••••"
              required 
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.button}
            disabled={isPending}
          >
            {isPending ? 'Processing...' : isLogin ? 'Authenticate' : 'Register Account'}
          </button>
        </form>

        <button 
          className={styles.secondaryButton}
          disabled={isPending}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  )
}
