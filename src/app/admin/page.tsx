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
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link href="/admin/firms/new"
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors">
          + Add firm
        </Link>
      </div>

      {(pendingReviews ?? 0) > 0 && (
        <Link href="/admin/esma-review"
          className="block rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 hover:bg-amber-500/15 transition-colors">
          <p className="text-amber-400 font-medium">
            {pendingReviews} ESMA review{pendingReviews !== 1 ? 's' : ''} pending
          </p>
          <p className="text-amber-500/70 text-sm mt-0.5">Click to review →</p>
        </Link>
      )}

      {(staleStatuses?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 py-4">
          <p className="text-zinc-300 font-medium">
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
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-800/50 transition-colors">
            <p className="font-medium text-white">{item.label}</p>
            <p className="text-sm text-zinc-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </nav>
    </div>
  )
}
