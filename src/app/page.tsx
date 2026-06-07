import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { getChangelog } from '@/lib/queries/changelog'
import { getFreshness } from '@/lib/queries/freshness'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { Freshness } from '@/components/dashboard/Freshness'
import { EmailCapture } from '@/components/email/EmailCapture'
import { GeographicMap } from '@/components/map/GeographicMap'
import { StatusBadge } from '@/components/registry/StatusBadge'
import type { FirmStatus } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA License Tracker, EU Crypto Authorization Status',
}

export const revalidate = 3600

function Figure({ label, value, color, caption }: { label: string; value: number; color?: string; caption?: string }) {
  return (
    <div className="pl-6 sm:pl-8 ml-6 sm:ml-8 border-l border-rule first:pl-0 first:ml-0 first:border-0">
      <p className="eyebrow mb-2">{label}</p>
      <p className="fig text-4xl sm:text-5xl lg:text-6xl leading-none tnum" style={color ? { color } : undefined}>
        {value}
      </p>
      {caption && <p className="text-xs text-ink-faint mt-2">{caption}</p>}
    </div>
  )
}

async function HeroBand() {
  const [stats, freshness] = await Promise.all([getDashboardStats(), getFreshness()])
  return (
    <div className="mt-14 md:mt-20 border-t border-rule pt-10">
      <div className="grid lg:grid-cols-[auto_1fr] gap-x-16 gap-y-10 items-end">
        <div>
          <p className="eyebrow mb-5">Time left until 1 July 2026</p>
          <Suspense fallback={<div className="h-20" />}>
            <CountdownTimer />
          </Suspense>
        </div>
        <div className="lg:text-right">
          <div className="flex lg:justify-end">
            <Figure label="Licensed" value={stats.authorized} color="var(--forest)" />
            <Figure
              label="Not licensed"
              value={stats.not_authorized}
              color="var(--coral)"
              caption={`of ${stats.total} tracked`}
            />
            <Figure label="Tracked firms" value={stats.total} />
          </div>
          <div className="mt-6 lg:flex lg:justify-end">
            <Freshness registerLastChecked={freshness.registerLastChecked} latestChange={freshness.latestChange} />
          </div>
        </div>
      </div>
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
      <section className="pt-16 md:pt-28 pb-16 md:pb-24">
        <p className="eyebrow mb-7">EU MiCA Regulation · Article 143(3)</p>
        <div className="grid lg:grid-cols-12 gap-x-12 gap-y-8 items-start">
          <h1 className="lg:col-span-8 font-display text-[2.75rem] sm:text-6xl lg:text-[5.75rem] font-semibold leading-[0.98] tracking-[-0.02em] text-ink">
            Which crypto firms are{' '}
            <span className="italic text-gold">licensed</span> to operate in the EU?
          </h1>
          <div className="lg:col-span-4 lg:pt-3">
            <p className="text-lg text-ink-soft leading-relaxed">
              The transitional window is closing. Firms without a licence must leave the EU market. Every status here
              comes straight from the official European register, checked and dated.
            </p>
            <div className="mt-6">
              <EmailCapture variant="compact" />
              <p className="text-xs text-ink-faint mt-2.5">Get a weekly email summarising what changed.</p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={<div className="mt-14 md:mt-20 border-t border-rule pt-10 h-32 animate-pulse" />}
        >
          <HeroBand />
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
