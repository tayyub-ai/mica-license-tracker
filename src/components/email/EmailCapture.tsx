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
      <p className="text-emerald-400 text-sm font-medium">
        ✓ Check your inbox to confirm — you'll get status-change alerts and weekly digests.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={variant === 'compact' ? 'flex gap-2' : 'flex flex-col gap-3'}>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {state === 'loading' ? 'Signing up…' : 'Get alerts'}
      </button>
      {state === 'error' && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}
    </form>
  )
}
