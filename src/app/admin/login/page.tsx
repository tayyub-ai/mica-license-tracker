'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  const input =
    'w-full px-4 py-2.5 rounded-sm bg-paper border border-rule-bold/25 text-ink placeholder-ink-faint focus:outline-none focus:border-oxblood text-sm transition-colors'

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center mb-2">Curation Console</p>
        <h1 className="font-display text-3xl font-semibold text-ink mb-8 text-center">
          MiCA<span className="text-oxblood">·</span>Tracker Admin
        </h1>
        <form onSubmit={handleLogin} className="space-y-3 card-paper rounded-sm p-6">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={input} />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={input} />
          {error && <p className="text-oxblood text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="press w-full py-2.5 rounded-sm bg-ink text-paper font-semibold text-sm hover:bg-oxblood disabled:opacity-50"
          >
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  )
}
