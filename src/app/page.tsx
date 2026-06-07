import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { getChangelog } from '@/lib/queries/changelog'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { StatsGrid, AtRiskBanner } from '@/components/dashboard/StatsGrid'
import { EmailCapture } from '@/components/email/EmailCapture'
import { GeographicMap } from '@/components/map/GeographicMap'
import { StatusBadge } from '@/components/registry/StatusBadge'
import type { FirmStatus } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA License Tracker, EU Crypto Authorization Status',
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
          Last verified {new Date(stats.last_updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

async function MapSection() {
  const states = await getStateCounts()
  return <GeographicMap states={states} />
}

async function RecentChanges() {
  const entries = await getChangelog(8)
  if (entries.length === 0) return null
  return (
    <div>
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/firms/${e.firms?.slug}`}
          className="group flex items-center gap-4 py-3.5 border-b border-rule last:border-0"
        >
          <span className="cd-cell text-xs text-ink-faint w-16 shrink-0">
            {new Date(e.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-[15px] text-ink-soft group-hover:text-ink transition-colors flex-1 truncate">
            {e.firms?.trading_name}
          </span>
          <StatusBadge status={e.new_status as FirmStatus} />
        </Link>
      ))}
    </div>
  )
}

function SectionTitle({ title, href, hrefLabel }: { title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between border-t border-rule pt-5 mb-8">
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-gold hover:text-gold-deep transition-colors whitespace-nowrap">
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
      <section className="pt-16 md:pt-24 pb-16 md:pb-20">
        <p className="eyebrow mb-6">EU MiCA Regulation · The 1 July 2026 deadline</p>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-10 items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-5xl md:text-[5.5rem] font-semibold leading-[1.0] tracking-tight text-ink">
              Which crypto firms are{' '}
              <span className="italic text-gold">licensed</span> to operate in the EU?
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lg text-ink-soft leading-relaxed">
              The transitional window is closing. Firms without a licence must leave the EU market. Every status here
              comes straight from the official European register, checked and dated.
            </p>
            <div className="mt-6 max-w-md">
              <EmailCapture variant="compact" />
              <p className="eyebrow normal-case tracking-normal text-ink-faint mt-2">
                Get an email when a firm&apos;s status changes.
              </p>
            </div>
          </div>
        </div>

        {/* countdown band */}
        <div className="mt-12 md:mt-16 border-t border-rule pt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="eyebrow mb-4">Time left until the deadline</p>
            <Suspense fallback={<div className="h-24" />}>
              <CountdownTimer />
            </Suspense>
          </div>
          <p className="text-sm text-ink-faint leading-relaxed max-w-xs">
            1 July 2026 is the EU-wide cut-off. Many member states set shorter windows of their own.
          </p>
        </div>
      </section>

      {/* ===== DASHBOARD ===== */}
      <section className="pb-16">
        <SectionTitle title="Where things stand today" href="/firms" hrefLabel="Browse all firms" />
        <Suspense
          fallback={
            <div className="space-y-5">
              <div className="h-28 card-paper animate-pulse" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <SectionTitle title="Licences by country" />
        <p className="-mt-4 mb-8 text-ink-soft max-w-2xl">
          Where the firms we track hold their home licence. Select a country to see its deadline and open its
          registry.
        </p>
        <Suspense fallback={<div className="h-80 card-paper animate-pulse" />}>
          <MapSection />
        </Suspense>
      </section>

      {/* ===== RECENT ===== */}
      <section className="pb-24">
        <SectionTitle title="Latest updates" href="/changelog" hrefLabel="Full changelog" />
        <Suspense fallback={<div className="h-40 animate-pulse" />}>
          <RecentChanges />
        </Suspense>
      </section>
    </div>
  )
}
