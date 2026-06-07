'use client'

import { useState, useTransition } from 'react'
import { approveReview, skipReview } from '@/app/admin/(protected)/esma-review/actions'

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState('')

  function handle(action: 'approve' | 'skip') {
    setError('')
    startTransition(async () => {
      const res = action === 'approve' ? await approveReview(reviewId) : await skipReview(reviewId)
      if (res?.error) setError(res.error)
      else setDone(action === 'approve' ? 'Approved' : 'Skipped')
    })
  }

  if (done) {
    return <span className="text-xs text-emerald-400">✓ {done}</span>
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle('approve')}
        disabled={pending}
        className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
      >
        {pending ? '…' : 'Approve → Authorized'}
      </button>
      <button
        onClick={() => handle('skip')}
        disabled={pending}
        className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-700 disabled:opacity-50 transition-colors"
      >
        Skip
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
