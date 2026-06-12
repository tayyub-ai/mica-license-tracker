import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { getChangelog } from '@/lib/queries/changelog'
import { getFreshness } from '@/lib/queries/freshness'
import {
  getLicensedByCountry,
  getLicensedByCategory,
  getLicensedByService,
  getCumulativeAuthorizations,
  getSourceBreakdown,
  getPassportingReach,
} from '@/lib/queries/analytics'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { Freshness } from '@/components/dashboard/Freshness'
import { EmailCapture } from '@/components/email/EmailCapture'
import { GeographicMap } from '@/components/map/GeographicMap'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { BarChart } from '@/components/charts/BarChart'
import { AreaChart } from '@/components/charts/AreaChart'
import { CountUp } from '@/components/motion/CountUp'
import { Reveal } from '@/components/motion/Reveal'
import type { FirmStatus } from '@/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA License Tracker, EU Crypto Authorization Status',
}

export const revalidate = 3600

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-')
  const idx = Number(month) - 1
  return `${MONTH_NAMES[idx] ?? month} ${year}`
}

function Figure({ label, value, color, caption }: { label: string; value: number; color?: string; caption?: string }) {
  return (
    <div className="pl-6 sm:pl-8 ml-6 sm:ml-8 border-l border-rule first:pl-0 first:ml-0 first:border-0">
      <p className="eyebrow mb-2">{label}</p>
      <p className="fig text-4xl sm:text-5xl lg:text-6xl leading-none tnum" style={color ? { color } : undefined}>
        <CountUp value={value} />
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

function Panel({
  kicker,
  title,
  source,
  children,
  className,
}: {
  kicker: string
  title: string
  source?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`card-paper rounded-xl p-6 ${className ?? ''}`}>
      <p className="eyebrow mb-1.5">{kicker}</p>
      <h3 className="font-display text-xl font-semibold text-ink mb-1">{title}</h3>
      {source && <p className="text-xs text-ink-faint mb-5">{source}</p>}
      {children}
    </div>
  )
}

async function ByCountryChart() {
  const data = await getLicensedByCountry()
  if (data.length === 0) {
    return <p className="text-sm text-ink-faint">No licensed firms recorded yet.</p>
  }
  return (
    <BarChart
      data={data.slice(0, 12).map((d) => ({ label: d.name, value: d.count }))}
    />
  )
}

// Prefer the authoritative service-mix (one count per MiCA service a firm holds);
// fall back to the coarser firm-category split until the ESMA service backfill
// runs. The panel titles itself honestly for whichever dataset it shows.
async function CompositionPanel() {
  const services = await getLicensedByService()
  if (services.length > 0) {
    return (
      <Panel
        kicker="Composition"
        title="Crypto-asset services authorised"
        source="Source: ESMA register · MiCA services held (firms hold several)"
      >
        <BarChart
          data={services.map((d) => ({ label: d.label, value: d.count, color: 'var(--gold)' }))}
        />
      </Panel>
    )
  }
  const data = await getLicensedByCategory()
  return (
    <Panel
      kicker="Composition"
      title="Licensed firms by type"
      source="Source: ESMA register · firm category"
    >
      {data.length === 0 ? (
        <p className="text-sm text-ink-faint">No licensed firms recorded yet.</p>
      ) : (
        <BarChart data={data.map((d) => ({ label: d.label, value: d.count }))} />
      )}
    </Panel>
  )
}

async function SourcingChart() {
  const data = await getSourceBreakdown()
  if (data.length === 0) return null
  return (
    <BarChart
      data={data.map((d) => ({ label: d.label, value: d.count, color: 'var(--indigo)' }))}
    />
  )
}

// Inbound passporting reach — renders only once the ESMA passport-state backfill
// has populated the data; silently absent before then.
async function PassportingPanel() {
  const [reach, states] = await Promise.all([getPassportingReach(), getStateCounts()])
  if (reach.length === 0) return null
  const nameByCode = new Map(states.map((s) => [s.code, s.name]))
  return (
    <Panel
      kicker="Reach"
      title="Most-served markets"
      source="Source: ESMA register · licensed firms passported into each member state"
    >
      <BarChart
        data={reach.slice(0, 12).map((d) => ({
          label: nameByCode.get(d.code) ?? d.code,
          value: d.count,
          color: 'var(--forest)',
        }))}
      />
    </Panel>
  )
}

async function OverTimePanel() {
  const data = await getCumulativeAuthorizations()
  if (data.length === 0) return null
  return (
    <Panel
      kicker="Trend"
      title="Authorisations over time"
      source="Source: ESMA register · cumulative MiCA authorisations by month"
      className="lg:col-span-2"
    >
      <AreaChart data={data.map((d) => ({ x: monthLabel(d.month), y: d.cumulative }))} />
    </Panel>
  )
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

const EXPLORE_LINKS: { href: string; title: string; description: string }[] = [
  { href: '/countries', title: 'Country guides', description: 'Deadlines and registers for each member state.' },
  { href: '/timeline', title: 'Regulatory timeline', description: 'How MiCA rolled out, milestone by milestone.' },
  { href: '/learn', title: 'Explainers & glossary', description: 'Plain-English answers to the key questions.' },
  { href: '/firms', title: 'Full registry', description: 'Every firm we track, with status and source.' },
]

function ChartSkeleton() {
  return (
    <div className="card-paper rounded-xl p-6">
      <div className="h-3 w-24 bg-paper-3 rounded mb-4 animate-pulse" />
      <div className="h-5 w-48 bg-paper-3 rounded mb-6 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-2.5 bg-paper-3 rounded-sm animate-pulse" style={{ width: `${90 - i * 12}%` }} />
        ))}
      </div>
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

      {/* ===== CHARTS ===== */}
      <section className="pb-16">
        <SectionTitle title="The data" />
        <p className="-mt-4 mb-8 text-ink-soft max-w-2xl">
          A breakdown of who holds a MiCA authorisation, where they are based and how the numbers have grown.
        </p>
        <div className="grid lg:grid-cols-2 gap-6">
          <Suspense fallback={<ChartSkeleton />}>
            <Panel
              kicker="Geography"
              title="Licensed firms by country"
              source="Source: ESMA register · top home member states"
            >
              <ByCountryChart />
            </Panel>
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <CompositionPanel />
          </Suspense>
          <Suspense fallback={null}>
            <OverTimePanel />
          </Suspense>
          <Suspense fallback={<ChartSkeleton />}>
            <Panel
              kicker="Provenance"
              title="Where the evidence comes from"
              source="Source type backing each tracked firm's current status"
            >
              <SourcingChart />
            </Panel>
          </Suspense>
          <Suspense fallback={null}>
            <PassportingPanel />
          </Suspense>
        </div>
      </section>

      {/* ===== RECENT ===== */}
      <section className="pb-16">
        <SectionTitle title="Latest updates" href="/changelog" hrefLabel="Full changelog" />
        <Suspense fallback={<div className="h-40 animate-pulse" />}>
          <RecentChanges />
        </Suspense>
      </section>

      {/* ===== EXPLORE ===== */}
      <section className="pb-24">
        <div className="border-t border-rule pt-5">
          <p className="eyebrow mb-6">Explore</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-7">
            {EXPLORE_LINKS.map((link, i) => (
              <Reveal key={link.href} delay={i * 80}>
                <Link href={link.href} className="group block">
                  <span className="font-display text-lg font-semibold text-ink group-hover:text-gold transition-colors">
                    {link.title} <span aria-hidden>→</span>
                  </span>
                  <p className="text-sm text-ink-faint mt-1.5 leading-relaxed">{link.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
