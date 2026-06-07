import type { DashboardStats } from '@/types/database'

function StatCard({
  label,
  value,
  accent,
  rule,
}: {
  label: string
  value: number
  accent: string
  rule: string
}) {
  return (
    <div className="card-paper rounded-sm p-5" style={{ borderTopWidth: 2, borderTopColor: rule }}>
      <p className="eyebrow mb-3">{label}</p>
      <p className="cd-cell text-4xl font-semibold tnum" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule rounded-sm overflow-hidden">
      <StatCard label="Authorized" value={stats.authorized} accent="var(--forest)" rule="var(--forest)" />
      <StatCard label="Application Pending" value={stats.application_pending} accent="var(--ochre)" rule="var(--ochre)" />
      <StatCard label="Not Authorized" value={stats.not_authorized} accent="var(--oxblood)" rule="var(--oxblood)" />
      <StatCard label="Exited / Restricting" value={stats.exited_restricting_eu} accent="var(--slate)" rule="var(--slate)" />
    </div>
  )
}

export function AtRiskBanner({ stats }: { stats: DashboardStats }) {
  const atRisk = stats.not_authorized + stats.application_pending
  const pct = stats.total > 0 ? Math.round((atRisk / stats.total) * 100) : 0

  return (
    <div className="relative card-paper rounded-sm overflow-hidden">
      {/* oxblood spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-oxblood" />
      <div className="px-7 py-6 md:flex items-center justify-between gap-8">
        <div>
          <p className="eyebrow text-oxblood mb-2">At Risk · Unlicensed</p>
          <p className="font-display text-5xl md:text-6xl font-semibold text-oxblood leading-none">
            <span className="tnum">{atRisk}</span>
            <span className="text-2xl text-ink-faint font-sans font-normal"> of {stats.total}</span>
          </p>
        </div>
        <p className="mt-4 md:mt-0 md:text-right text-ink-soft max-w-xs">
          named firms on our watchlist have <strong className="text-ink">no confirmed MiCA authorization</strong> —{' '}
          <span className="cd-cell text-oxblood">{pct}%</span> of those we track.
        </p>
      </div>
    </div>
  )
}
