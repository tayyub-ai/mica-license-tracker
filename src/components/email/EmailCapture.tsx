'use client'

import { useState } from 'react'

export function EmailCapture({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Signup failed')
      }
      setState('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <p className="text-forest text-sm font-medium flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-forest" />
        Check your inbox to confirm. Alerts and weekly updates are on the way.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={variant === 'compact' ? 'flex gap-2' : 'flex flex-col gap-3'}>
      <label htmlFor="email-capture" className="sr-only">Email address</label>
      <input
        id="email-capture"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@firm.eu"
        autoComplete="email"
        className="flex-1 px-4 py-2.5 rounded-lg bg-paper-2 border border-rule text-ink placeholder-ink-faint focus:outline-none focus:border-gold text-sm transition-colors"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="press px-6 py-2.5 rounded-lg bg-gold text-[#0E1422] text-sm font-semibold hover:bg-gold-deep disabled:opacity-50 whitespace-nowrap"
      >
        {state === 'loading' ? 'Signing up' : 'Get alerts'}
      </button>
      {state === 'error' && <p className="text-coral text-xs">{errorMsg}</p>}
    </form>
  )
}
