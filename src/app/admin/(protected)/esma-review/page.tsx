import { createClient } from '@/lib/supabase/server'
import { ReviewActions } from '@/components/admin/ReviewActions'

export const dynamic = 'force-dynamic'

export default async function ESMAReviewPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('esma_pending_reviews')
    .select('*, firms(trading_name)')
    .eq('decision', 'pending')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">ESMA Review Queue</h1>
        <span className="text-sm text-ink-faint">{reviews?.length ?? 0} pending</span>
      </div>
      <p className="text-sm text-ink-faint">
        Weekly ESMA register diffs awaiting human verification. Approving applies an
        evidence-backed <span className="text-forest">Authorized</span> status; nothing is auto-published.
      </p>

      {(!reviews || reviews.length === 0) ? (
        <p className="text-ink-faint py-16 text-center">No pending reviews.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-rule bg-paper-2 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{r.esma_entity_name}</p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Type: {r.review_type} · {new Date(r.created_at).toLocaleDateString('en-GB')}
                  </p>
                  {r.firms && (
                    <p className="text-xs text-ink-soft mt-1">Matched firm: {r.firms.trading_name}</p>
                  )}
                </div>
                <span className="text-xs bg-ochre/15 text-ochre border border-ochre/40 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>
              <pre className="text-xs text-ink-soft bg-paper-3 rounded-lg p-3 overflow-auto max-h-40">
                {JSON.stringify(r.esma_data, null, 2)}
              </pre>
              <div className="flex items-center justify-between border-t border-rule pt-3">
                <a href="/admin/firms" className="text-xs text-ink-faint underline underline-offset-2 hover:text-ink">
                  Or edit manually in the registry
                </a>
                <ReviewActions reviewId={r.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
