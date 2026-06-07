import { Suspense } from 'react'
import Link from 'next/link'
import { getDashboardStats } from '@/lib/queries/firms'
import { getStateCounts } from '@/lib/queries/states'
import { getChangelog } from '@/lib/queries/changelog'
import { CountdownTimer } from '@/components/countdown/CountdownTimer'
import { StatsGrid, AtRiskBanner } from '@/components/dashboard/StatsGrid'
import { EmailCapture } from '@/components/email/EmailCapture'
import { EuropeTileMap } from '@/components/map/EuropeTileMap'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { TeamProfileCard } from '@/components/team/TeamProfileCard'
import { TEAM_MEMBERS } from '@/lib/constants/team'
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
  return <EuropeTileMap states={states} />
}

async function RecentChanges() {
  const entries = await getChangelog(6)
  if (entries.length === 0) return null
  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <Link
          key={e.id}
          href={`/firms/${e.firms?.slug}`}
          className="group flex items-center gap-3 py-2 border-b border-rule last:border-0"
        >
          <span className="cd-cell text-xs text-ink-faint w-20 shrink-0">
            {new Date(e.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-sm text-ink-soft group-hover:text-ink transition-colors flex-1 truncate">
            {e.firms?.trading_name}
          </span>
          <StatusBadge status={e.new_status as FirmStatus} />
        </Link>
      ))}
    </div>
  )
}

function SectionHead({ kicker, title, href, hrefLabel }: { kicker: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between section-rule pt-5 mb-7">
      <div>
        <p className="eyebrow mb-1.5 text-gold">{kicker}</p>
        <h2 className="font-display text-2xl md:text-4xl font-semibold text-ink">{title}</h2>
      </div>
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
    <div>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* aurora */}
        <div className="aurora w-[480px] h-[420px] -top-24 right-[8%]" style={{ background: 'radial-gradient(circle, rgba(230,182,92,0.30), transparent 70%)' }} />
        <div className="aurora w-[420px] h-[360px] top-10 left-[2%]" style={{ background: 'radial-gradient(circle, rgba(127,168,224,0.18), transparent 70%)', animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-7 reveal" style={{ ['--reveal-delay' as string]: '0ms' }}>
                <span className="eyebrow">EU MiCA Regulation</span>
                <span className="h-px flex-1 bg-rule max-w-[80px]" />
                <span className="eyebrow flex items-center gap-2 text-gold">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold glow-dot" /> The 1 July 2026 deadline
                </span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.0] tracking-tight text-ink reveal" style={{ ['--reveal-delay' as string]: '90ms' }}>
                Which crypto firms are{' '}
                <span className="italic text-gold">licensed</span> to operate in the EU?
              </h1>

              <p className="mt-7 text-lg text-ink-soft leading-relaxed max-w-xl reveal" style={{ ['--reveal-delay' as string]: '200ms' }}>
                The transitional window is closing. Firms without a licence must leave the EU market. Every status here
                comes straight from the official European register, checked and dated.
              </p>

              <div className="mt-8 max-w-md reveal" style={{ ['--reveal-delay' as string]: '300ms' }}>
                <p className="eyebrow mb-2">Get an alert when a firm&apos;s status changes</p>
                <EmailCapture variant="compact" />
              </div>
            </div>

            <div className="lg:col-span-5 reveal" style={{ ['--reveal-delay' as string]: '400ms' }}>
              <div className="text-center lg:text-left">
                <p className="eyebrow mb-4">Time left until the deadline</p>
                <Suspense fallback={<div className="h-32" />}>
                  <CountdownTimer />
                </Suspense>
                <p className="mt-4 text-sm text-ink-faint leading-relaxed max-w-sm mx-auto lg:mx-0">
                  This is the EU-wide cut-off. Many member states set shorter windows of their own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== DASHBOARD ===== */}
        <section className="pb-16">
          <SectionHead kicker="The headline" title="Where things stand today" href="/firms" hrefLabel="Browse all firms" />
          <Suspense
            fallback={
              <div className="space-y-5">
                <div className="h-28 card-paper rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 card-paper rounded-xl animate-pulse" />
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
          <SectionHead kicker="Across Europe" title="Licences by country" />
          <p className="-mt-3 mb-7 text-ink-soft max-w-2xl">
            Where the firms we track hold their home licence. Hover a country to see its deadline, or click to filter
            the registry.
          </p>
          <Suspense fallback={<div className="h-64 card-paper rounded-xl animate-pulse" />}>
            <MapSection />
          </Suspense>
        </section>

        {/* ===== RECENT ===== */}
        <section className="pb-16">
          <SectionHead kicker="Live" title="Latest updates" href="/changelog" hrefLabel="Full changelog" />
          <div className="card-paper rounded-xl p-6 md:p-8">
            <Suspense fallback={<div className="h-40 animate-pulse" />}>
              <RecentChanges />
            </Suspense>
          </div>
        </section>

        {/* ===== TRUST ===== */}
        <section className="pb-24">
          <SectionHead kicker="How it works" title="Why you can rely on this" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <PathIcon />,
                title: 'Straight from ESMA',
                body: 'Every licensed status links to the official European register or a national authority, so you can check it yourself in one click.',
              },
              {
                icon: <ShieldIcon />,
                title: 'Careful with names',
                body: 'When a firm is not on the register we say exactly that, with the date. We never call a firm illegal.',
              },
              {
                icon: <RefreshIcon />,
                title: 'Updated every week',
                body: 'We follow the register as it changes and record every move, so you always see the current picture.',
              },
            ].map((c) => (
              <div key={c.title} className="card-paper lift rounded-xl p-7">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 text-gold" style={{ background: 'color-mix(in srgb, var(--gold) 12%, transparent)' }}>
                  {c.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-ink mb-2">{c.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TEAM ===== */}
        <section className="pb-24">
          <SectionHead kicker="The people behind the data" title="Built by specialists" href="/team" hrefLabel="Meet the team" />
          <p className="-mt-3 mb-7 text-ink-soft max-w-2xl">
            MiCA Tracker combines implementation discipline with deep fintech and blockchain context.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEAM_MEMBERS.map((member) => (
              <TeamProfileCard key={member.name} member={member} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function PathIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
  )
}
function RefreshIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3" /><path d="M21 3v6h-6M3 21v-6h6" />
    </svg>
  )
}
