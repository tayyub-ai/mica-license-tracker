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
    return <span className="text-xs text-forest">✓ {done}</span>
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle('approve')}
        disabled={pending}
        className="text-xs bg-forest/15 text-forest border border-forest/40 px-3 py-1.5 rounded-lg hover:bg-forest/20 disabled:opacity-50 transition-colors"
      >
        {pending ? '…' : 'Approve → Authorized'}
      </button>
      <button
        onClick={() => handle('skip')}
        disabled={pending}
        className="text-xs bg-paper-3 text-ink-soft border border-rule px-3 py-1.5 rounded-lg hover:bg-paper-3 disabled:opacity-50 transition-colors"
      >
        Skip
      </button>
      {error && <span className="text-xs text-oxblood">{error}</span>}
    </div>
  )
}
