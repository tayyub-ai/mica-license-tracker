import type { Metadata } from 'next'
import Link from 'next/link'
import { getPassportingDataset } from '@/lib/queries/passporting'
import { getStateCounts } from '@/lib/queries/states'
import { PassportingExplorer } from '@/components/map/PassportingExplorer'

export const metadata: Metadata = {
  title: 'Passporting Map, Where MiCA-Licensed Firms Can Operate',
  description:
    'One MiCA licence passports across the EEA. Explore which member states each licensed crypto firm can serve, and which markets are reached by the most firms, straight from the ESMA register.',
}

export const revalidate = 3600

export default async function PassportingPage() {
  const [dataset, states] = await Promise.all([getPassportingDataset(), getStateCounts()])
  const names: Record<string, string> = {}
  for (const s of states) names[s.code] = s.name

  const topMarket = dataset.inbound[0]
  const topHome = dataset.homeCounts[0]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <header className="mb-10 md:mb-14 max-w-3xl">
        <p className="eyebrow mb-3">The single market for crypto</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.02] tracking-[-0.02em] text-ink mb-5">
          One licence, <span className="italic text-gold">twenty-seven</span> markets
        </h1>
        <p className="text-lg text-ink-soft leading-relaxed">
          A MiCA authorisation in one member state can be passported across the whole EEA. This map traces that
          reach: which markets the most firms can serve, and where any single country’s licensed firms operate.
          Every link comes straight from the ESMA register.
        </p>
      </header>

      {dataset.totalFirms > 0 ? (
        <>
          {/* Headline band */}
          <div className="mb-12 grid grid-cols-2 gap-x-8 gap-y-6 border-y border-rule py-7 sm:grid-cols-4">
            <Stat value={dataset.totalFirms.toLocaleString('en-GB')} label="Licensed firms" />
            <Stat value={dataset.avgReach.toFixed(1)} label="Avg markets per firm" color="var(--gold)" />
            <Stat value={dataset.totalLinks.toLocaleString('en-GB')} label="Passport links" />
            <Stat
              value={topMarket ? String(topMarket.count) : '—'}
              label={topMarket ? `Firms can serve ${names[topMarket.code] ?? topMarket.code}` : 'Top market'}
              color="var(--forest)"
            />
          </div>

          <PassportingExplorer dataset={dataset} names={names} />

          {/* Explainer */}
          <section className="mt-16 grid gap-8 border-t border-rule pt-10 md:grid-cols-3">
            <Explainer title="What passporting means">
              Once a firm is authorised as a crypto-asset service provider in its home member state, it can notify
              other EEA states and provide services there without a second licence. The home authority remains its
              supervisor.
            </Explainer>
            <Explainer title="Reading the map">
              In the default view, each state is shaded by how many licensed firms can operate there. Select a
              highlighted home state and the map redraws to that state’s firms’ reach, with arcs to every market
              they passport into.
            </Explainer>
            <Explainer title="Why it matters">
              {topHome
                ? `Home states concentrate the market — ${names[topHome.code] ?? topHome.code} alone hosts ${topHome.count} licensed firms. `
                : ''}
              Where a firm is based shapes which authority supervises it and how its passport reaches consumers across
              the bloc.
            </Explainer>
          </section>

          <div className="mt-12 border-t border-rule pt-6">
            <Link href="/firms" className="text-sm font-medium text-gold transition-colors hover:text-gold-deep">
              Browse the full registry →
            </Link>
          </div>
        </>
      ) : (
        <p className="border-t border-rule pt-10 text-ink-soft">
          The ESMA register is momentarily unavailable. Passporting data will appear here once it can be reached.
        </p>
      )}
    </div>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <p className="fig text-3xl sm:text-4xl leading-none tnum" style={color ? { color } : undefined}>
        {value}
      </p>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  )
}

function Explainer({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink mb-2">{title}</h2>
      <p className="text-sm leading-relaxed text-ink-soft">{children}</p>
    </div>
  )
}
