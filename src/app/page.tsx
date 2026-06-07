import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { StatsGrid, AtRiskBanner } from '@/components/dashboard/StatsGrid'
import { EmailCapture } from '@/components/email/EmailCapture'
import { EuropeTileMap } from '@/components/map/EuropeTileMap'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA License Tracker — EU Crypto Authorization Status',
}

export const revalidate = 3600 // revalidate every hour

async function DashboardSection() {
  const stats = await getDashboardStats()
  return (
    <div className="space-y-6">
      <AtRiskBanner stats={stats} />
      <StatsGrid stats={stats} />
      {stats.last_updated && (
        <p className="text-xs text-zinc-600 text-right">
          Data last verified: {new Date(stats.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

async function MapSection() {
  const states = await getStateCounts()
  return <EuropeTileMap states={states} />
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="py-20 md:py-32 text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 font-medium">
            EU MiCA Regulation · Article 143(3) Deadline
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Which crypto firms are<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-400">
              licensed for the EU?
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400 leading-relaxed">
            MiCA's transitional window closes <strong className="text-white">1 July 2026</strong>.
            Firms without a CASP authorization must exit the EU market.
            We track every named firm's status — sourced directly from ESMA and national registers.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-xs uppercase tracking-widest text-zinc-600">Time remaining until deadline</p>
          <Suspense fallback={<div className="h-20" />}>
            <CountdownTimer />
          </Suspense>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
          <p className="text-sm text-zinc-500">Get alerts when firm statuses change</p>
          <EmailCapture variant="compact" />
        </div>
      </section>

      {/* Dashboard stats */}
      <section className="pb-16 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Watchlist Overview</h2>
          <Link href="/firms" className="text-sm text-zinc-400 hover:text-white transition-colors">
            View all firms →
          </Link>
        </div>
        <Suspense fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 h-28 animate-pulse" />
            ))}
          </div>
        }>
          <DashboardSection />
        </Suspense>
      </section>

      {/* EU Map */}
      <section className="pb-16 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white">Authorizations by Member State</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Where tracked firms hold their home authorization. Hover for each state's transitional deadline; click to filter.
          </p>
        </div>
        <Suspense fallback={<div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/30 animate-pulse" />}>
          <MapSection />
        </Suspense>
      </section>

      {/* Why this matters */}
      <section className="pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Sourced from ESMA',
            body: 'Every "Authorized" status traces to the ESMA interim MiCA register or a named national NCA register — with a direct link.',
          },
          {
            title: 'Legally careful',
            body: '"Not found in any EU MiCA register as of [date]" — never an accusation of illegality. Methodology and dispute channel published.',
          },
          {
            title: 'Updated weekly',
            body: 'ESMA publishes register updates weekly. We ingest diffs and surface changes for human verification before publishing.',
          },
        ].map((card) => (
          <div key={card.title} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <p className="font-semibold text-white mb-2">{card.title}</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
