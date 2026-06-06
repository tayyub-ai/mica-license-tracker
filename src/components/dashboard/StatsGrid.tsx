import type { DashboardStats } from '@/types/database'

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className={`text-4xl font-bold tabular-nums ${accent}`}>{value}</p>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Authorized"           value={stats.authorized}            accent="text-emerald-400" />
      <StatCard label="Application Pending"  value={stats.application_pending}   accent="text-amber-400" />
      <StatCard label="Not Authorized"       value={stats.not_authorized}        accent="text-red-400" />
      <StatCard label="Exited / Restricting" value={stats.exited_restricting_eu} accent="text-zinc-400" />
    </div>
  )
}

export function AtRiskBanner({ stats }: { stats: DashboardStats }) {
  const atRisk = stats.not_authorized + stats.application_pending
  const pct = stats.total > 0 ? Math.round((atRisk / stats.total) * 100) : 0

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-sm text-red-400 uppercase tracking-widest mb-2">At Risk</p>
      <p className="text-5xl font-bold text-red-400 tabular-nums mb-1">
        {atRisk} <span className="text-2xl text-red-500/60">/ {stats.total}</span>
      </p>
      <p className="text-zinc-400 text-sm">
        named firms still unlicensed ({pct}% of our watchlist)
      </p>
    </div>
  )
}
