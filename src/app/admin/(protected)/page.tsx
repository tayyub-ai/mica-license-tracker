import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/queries/firms'
import { StatsGrid } from '@/components/dashboard/StatsGrid'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const stats = await getDashboardStats()

  const { count: pendingReviews } = await supabase
    .from('esma_pending_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('decision', 'pending')

  const { data: staleStatuses } = await supabase
    .from('firm_statuses')
    .select('firm_id')
    .lt('last_verified', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <Link href="/admin/firms/new"
          className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:bg-oxblood transition-colors">
          + Add firm
        </Link>
      </div>

      {(pendingReviews ?? 0) > 0 && (
        <Link href="/admin/esma-review"
          className="block rounded-xl border border-ochre/40 bg-ochre/10 px-5 py-4 hover:bg-ochre/12 transition-colors">
          <p className="text-ochre font-medium">
            {pendingReviews} ESMA review{pendingReviews !== 1 ? 's' : ''} pending
          </p>
          <p className="text-ochre text-sm mt-0.5">Click to review →</p>
        </Link>
      )}

      {(staleStatuses?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-rule bg-paper-2 px-5 py-4">
          <p className="text-ink font-medium">
            {staleStatuses?.length} status row{staleStatuses?.length !== 1 ? 's' : ''} unverified for 30+ days
          </p>
        </div>
      )}

      <StatsGrid stats={stats} />

      <nav className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/firms', label: 'Firm Registry', desc: 'View and edit all firms' },
          { href: '/admin/firms/new', label: 'Add Firm', desc: 'Add a new firm to the watchlist' },
          { href: '/admin/esma-review', label: 'ESMA Review Queue', desc: 'Review ESMA CSV diffs' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="rounded-xl border border-rule bg-paper-2 p-5 hover:bg-paper-3 transition-colors">
            <p className="font-medium text-ink">{item.label}</p>
            <p className="text-sm text-ink-faint mt-1">{item.desc}</p>
          </Link>
        ))}
      </nav>
    </div>
  )
}
