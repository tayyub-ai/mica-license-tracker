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

export const revalidate = 3600

async function DashboardSection() {
  const stats = await getDashboardStats()
  return (
    <div className="space-y-5">
      <AtRiskBanner stats={stats} />
      <StatsGrid stats={stats} />
      {stats.last_updated && (
        <p className="eyebrow text-right">
          Data last verified ·{' '}
          {new Date(stats.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

async function MapSection() {
  const states = await getStateCounts()
  return <EuropeTileMap states={states} />
}

function SectionHead({ kicker, title, href, hrefLabel }: { kicker: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between section-rule pt-4 mb-7">
      <div>
        <p className="eyebrow mb-1.5">{kicker}</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-oxblood hover:text-oxblood-deep transition-colors whitespace-nowrap">
          {hrefLabel} →
        </Link>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ===== HERO ===== */}
      <section className="pt-14 md:pt-20 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Headline column */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="eyebrow">EU MiCA · Article 143(3)</span>
              <span className="h-px flex-1 bg-rule" />
              <span className="eyebrow flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-oxblood animate-pulse" /> Live register watch
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[0.98] tracking-tight text-ink">
              Which crypto firms are
              <span className="italic text-oxblood"> licensed </span>
              to operate in the EU?
            </h1>

            <p className="mt-7 text-lg text-ink-soft leading-relaxed max-w-xl">
              MiCA's transitional window shuts on <strong className="text-ink">1 July 2026</strong>. Firms without a
              CASP authorization must leave the EU market. We track every named firm's status — sourced directly from
              the <span className="text-ink">ESMA register</span> and national authorities.
            </p>

            <div className="mt-8 max-w-md">
              <p className="eyebrow mb-2">Get alerts when a firm's status changes</p>
              <EmailCapture variant="compact" />
            </div>
          </div>

          {/* Countdown column */}
          <div className="lg:col-span-5 lg:pt-4">
            <div className="lg:border-l lg:border-rule lg:pl-10">
              <p className="eyebrow mb-4">Time remaining until the deadline</p>
              <Suspense fallback={<div className="h-28" />}>
                <CountdownTimer />
              </Suspense>
              <p className="mt-4 text-sm text-ink-faint leading-relaxed">
                The hard EU-wide ceiling. Many member states set shorter windows — see the map below.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== DASHBOARD ===== */}
      <section className="pb-16">
        <SectionHead kicker="The Headline" title="Watchlist at a glance" href="/firms" hrefLabel="View all firms" />
        <Suspense
          fallback={
            <div className="space-y-5">
              <div className="h-28 card-paper rounded-sm animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 card-paper animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <DashboardSection />
        </Suspense>
      </section>

      {/* ===== MAP ===== */}
      <section className="pb-16">
        <SectionHead kicker="By Jurisdiction" title="Authorizations across the EU-27 + EEA" />
        <p className="-mt-3 mb-7 text-ink-soft max-w-2xl">
          Where tracked firms hold their home authorization. Each state set its own transitional deadline — hover a
          tile to see it, click to filter the registry.
        </p>
        <Suspense fallback={<div className="h-64 card-paper rounded-sm animate-pulse" />}>
          <MapSection />
        </Suspense>
      </section>

      {/* ===== TRUST ===== */}
      <section className="pb-24">
        <SectionHead kicker="Why Trust This" title="Built like a register, not a rumor" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule border border-rule rounded-sm overflow-hidden">
          {[
            {
              n: '01',
              title: 'Sourced from ESMA',
              body: 'Every "Authorized" status traces to the ESMA interim MiCA register or a named national authority — with a direct link you can check.',
            },
            {
              n: '02',
              title: 'Legally careful',
              body: '"Not found in any EU register as of [date]" — never an accusation of illegality. Methodology and a correction channel are published.',
            },
            {
              n: '03',
              title: 'Verified weekly',
              body: 'ESMA publishes updates weekly. We ingest the diff and surface changes for human review before anything is published.',
            },
          ].map((c) => (
            <div key={c.n} className="bg-paper p-7">
              <p className="cd-cell text-oxblood text-sm mb-4">{c.n}</p>
              <h3 className="font-display text-xl font-semibold text-ink mb-2">{c.title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
