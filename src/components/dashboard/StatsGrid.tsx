import type { DashboardStats } from '@/types/database'
import { CountUp } from './CountUp'

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="card-paper lift rounded-xl p-6 relative overflow-hidden">
      <span className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full" style={{ background: accent }} />
      <p className="eyebrow mb-3 pl-3">{label}</p>
      <p className="fig text-5xl pl-3" style={{ color: accent }}>
        <CountUp value={value} />
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
    <div className="relative card-paper rounded-xl overflow-hidden">
      <div className="absolute inset-0 opacity-60" style={{ background: 'radial-gradient(120% 100% at 0% 50%, color-mix(in srgb, var(--coral) 16%, transparent), transparent 55%)' }} />
      <span className="absolute left-0 top-0 bottom-0 w-1 bg-coral" />
      <div className="relative px-8 py-7 md:flex items-center justify-between gap-8">
        <div>
          <p className="eyebrow text-coral mb-2">Still unlicensed</p>
          <p className="fig text-6xl md:text-7xl text-coral leading-none">
            <CountUp value={atRisk} />
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
