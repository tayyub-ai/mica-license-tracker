import type { DashboardStats } from '@/types/database'

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="card-paper p-6">
      <p className="eyebrow mb-3">{label}</p>
      <p className="fig tnum text-5xl" style={{ color: accent }}>
        {value}
      </p>
    </div>
  )
}

export function StatsGrid({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Licensed" value={stats.authorized} accent="var(--forest)" />
      <StatCard label="Application Pending" value={stats.application_pending} accent="var(--ochre)" />
      <StatCard label="Not Licensed" value={stats.not_authorized} accent="var(--coral)" />
      <StatCard label="Exited or Restricting" value={stats.exited_restricting_eu} accent="var(--slate)" />
    </div>
  )
}

export function AtRiskBanner({ stats }: { stats: DashboardStats }) {
  const atRisk = stats.not_authorized + stats.application_pending
  const pct = stats.total > 0 ? Math.round((atRisk / stats.total) * 100) : 0

  return (
    <div className="card-paper">
      <div className="px-8 py-7 md:flex items-center justify-between gap-8">
        <div>
          <p className="eyebrow text-coral mb-2">Still unlicensed</p>
          <p className="fig tnum text-6xl md:text-7xl text-coral leading-none">
            {atRisk}
            <span className="text-2xl text-ink-faint font-sans"> of {stats.total}</span>
          </p>
        </div>
        <p className="mt-4 md:mt-0 md:text-right text-ink-soft max-w-xs leading-relaxed">
          firms on our watchlist still have <strong className="text-ink">no confirmed MiCA licence</strong>.
          That is <span className="fig text-coral">{pct}%</span> of everyone we track.
        </p>
      </div>
    </div>
  )
}
