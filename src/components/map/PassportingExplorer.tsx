'use client'

import { useMemo, useState, useLayoutEffect, useRef, useCallback } from 'react'
import { COUNTRY_PATHS, MAP_VIEWBOX } from '@/lib/constants/europe-geo'
import type { PassportingDataset } from '@/lib/queries/passporting'

const ALL_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'NO', 'IS', 'LI',
] as const

type Centroids = Record<string, { x: number; y: number }>

interface Props {
  dataset: PassportingDataset
  names: Record<string, string>
}

/**
 * Interactive passporting map. Two modes:
 *  - Inbound (default): every market shaded by how many licensed firms can serve it.
 *  - Outbound: pick a home state and the map redraws to that state's firms' reach,
 *    with animated arcs to each destination it passports into.
 */
export function PassportingExplorer({ dataset, names }: Props) {
  const [home, setHome] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [centroids, setCentroids] = useState<Centroids>({})
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)

  const pathRefs = useRef<Record<string, SVGPathElement | null>>({})
  const mapRef = useRef<HTMLDivElement | null>(null)

  // Measure country centroids once the paths are in the DOM (drives arc endpoints).
  useLayoutEffect(() => {
    const c: Centroids = {}
    for (const code of ALL_CODES) {
      const el = pathRefs.current[code]
      if (!el) continue
      const b = el.getBBox()
      c[code] = { x: b.x + b.width / 2, y: b.y + b.height / 2 }
    }
    setCentroids(c)
  }, [])

  const inboundMap = useMemo(
    () => Object.fromEntries(dataset.inbound.map((d) => [d.code, d.count])),
    [dataset.inbound],
  )
  const homeMap = useMemo(
    () => Object.fromEntries(dataset.homeCounts.map((d) => [d.code, d.count])),
    [dataset.homeCounts],
  )

  // Destination → firm count for the selected home state.
  const outbound = useMemo(() => {
    if (!home) return null
    const m: Record<string, number> = {}
    for (const f of dataset.firms) {
      if (f.home !== home) continue
      for (const d of f.passportStates) m[d] = (m[d] ?? 0) + 1
    }
    return m
  }, [home, dataset.firms])

  const maxInbound = dataset.maxInbound || 1
  const maxOutbound = useMemo(
    () => (outbound ? Math.max(1, ...Object.values(outbound)) : 1),
    [outbound],
  )

  const fillFor = useCallback(
    (code: string) => {
      if (home) {
        if (code === home) return 'var(--gold)'
        const v = outbound?.[code] ?? 0
        if (v <= 0) return 'color-mix(in srgb, var(--forest) 5%, var(--paper-2))'
        const pct = 20 + (v / maxOutbound) * 70
        return `color-mix(in srgb, var(--forest) ${pct.toFixed(0)}%, var(--paper))`
      }
      const v = inboundMap[code] ?? 0
      if (v <= 0) return 'color-mix(in srgb, var(--forest) 5%, var(--paper-2))'
      const pct = 16 + (v / maxInbound) * 76
      return `color-mix(in srgb, var(--forest) ${pct.toFixed(0)}%, var(--paper))`
    },
    [home, outbound, inboundMap, maxInbound, maxOutbound],
  )

  // Arc paths from the selected home to each destination, biggest reach first.
  const arcs = useMemo(() => {
    if (!home || !outbound || !centroids[home]) return []
    const from = centroids[home]
    return Object.entries(outbound)
      .filter(([d]) => d !== home && centroids[d])
      .sort((a, b) => b[1] - a[1])
      .map(([d, count]) => {
        const to = centroids[d]
        const mx = (from.x + to.x) / 2
        const my = (from.y + to.y) / 2
        const dx = to.x - from.x
        const dy = to.y - from.y
        const dist = Math.hypot(dx, dy) || 1
        const lift = Math.min(dist * 0.28, 130)
        const cx = mx + (-dy / dist) * lift
        const cy = my + (dx / dist) * lift
        return { d, count, path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}` }
      })
  }, [home, outbound, centroids])

  const trackPointer = useCallback((e: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const hoverCount = hovered
    ? home
      ? hovered === home
        ? homeMap[home] ?? 0
        : outbound?.[hovered] ?? 0
      : inboundMap[hovered] ?? 0
    : 0
  const hoverLabel = home
    ? hovered === home
      ? 'firms based here'
      : 'firms reach here'
    : 'firms can serve here'

  const homeCount = home ? homeMap[home] ?? 0 : 0
  const homeReach = outbound ? Object.keys(outbound).filter((d) => d !== home).length : 0

  return (
    <div>
      {/* Mode bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="eyebrow">
          {home ? `Outbound · ${names[home] ?? home}` : 'Inbound · all markets'}
        </span>
        {home && (
          <button
            type="button"
            onClick={() => setHome(null)}
            className="rounded-full border border-rule bg-paper-2 px-3 py-1 text-xs font-medium text-gold transition-colors hover:border-gold"
          >
            ← All markets
          </button>
        )}
        <span className="ml-auto text-xs text-ink-faint">
          {home
            ? 'Where this state’s licensed firms can operate'
            : 'Tap a highlighted state to trace its firms’ reach'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        {/* Map */}
        <div className="relative min-w-0" ref={mapRef}>
          <svg
            viewBox={MAP_VIEWBOX}
            role="img"
            aria-label="Passporting map of EU and EEA member states"
            className="block h-auto w-full select-none"
            style={{ overflow: 'visible' }}
            onMouseLeave={() => { setHovered(null); setTip(null) }}
          >
            {ALL_CODES.map((code, i) => {
              const d = COUNTRY_PATHS[code]
              if (!d) return null
              const name = names[code] ?? code
              const selectable = (homeMap[code] ?? 0) > 0
              const isActive = hovered === code || selected(code, home)
              return (
                <path
                  key={code}
                  ref={(el) => { pathRefs.current[code] = el }}
                  d={d}
                  tabIndex={selectable ? 0 : -1}
                  role={selectable ? 'button' : undefined}
                  aria-label={`${name}: ${inboundMap[code] ?? 0} firms can operate`}
                  className="map-path outline-offset-0"
                  style={{
                    fill: fillFor(code),
                    stroke: isActive ? 'var(--gold)' : 'var(--rule)',
                    strokeWidth: isActive ? 1.5 : 0.6,
                    strokeLinejoin: 'round',
                    paintOrder: 'stroke',
                    cursor: selectable ? 'pointer' : 'default',
                    transition: 'fill .35s ease, stroke .2s',
                    animationDelay: `${i * 14}ms`,
                  }}
                  onMouseEnter={() => setHovered(code)}
                  onMouseMove={trackPointer}
                  onFocus={() => setHovered(code)}
                  onBlur={() => setHovered(null)}
                  onClick={() => selectable && setHome(code === home ? null : code)}
                  onKeyDown={(e) => {
                    if (selectable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      setHome(code === home ? null : code)
                    }
                  }}
                />
              )
            })}

            {/* Passport arcs (outbound mode) */}
            {arcs.map((a, i) => (
              <path
                key={`${home}-${a.d}`}
                d={a.path}
                fill="none"
                stroke="var(--gold)"
                strokeWidth={1.2}
                strokeOpacity={0.5 + 0.45 * (a.count / maxOutbound)}
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: `arcDraw 0.7s ease forwards`,
                  animationDelay: `${Math.min(i * 45, 700)}ms`,
                }}
              />
            ))}
            {/* Home origin marker */}
            {home && centroids[home] && (
              <circle
                cx={centroids[home].x}
                cy={centroids[home].y}
                r={4}
                fill="var(--gold)"
                stroke="var(--paper)"
                strokeWidth={1.5}
              />
            )}
          </svg>

          {/* Hover tooltip */}
          {hovered && tip && (
            <div
              className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-md border border-rule bg-paper-2 px-3 py-2 shadow-lg lg:block"
              style={{ left: tip.x, top: tip.y }}
            >
              <span className="block fig text-sm leading-tight text-ink">{names[hovered] ?? hovered}</span>
              <span className="block eyebrow mt-0.5 normal-case text-gold">
                {hoverCount} {hoverLabel}
              </span>
            </div>
          )}

          <p className="eyebrow mt-3 normal-case text-ink-faint">
            Source: ESMA MiCA register (CASPS) · passporting notifications.
          </p>

          {/* Mobile picker */}
          <div className="mt-6 lg:hidden">
            <label htmlFor="home-picker" className="eyebrow block">
              Trace a home state’s reach
            </label>
            <select
              id="home-picker"
              value={home ?? ''}
              onChange={(e) => setHome(e.target.value || null)}
              className="mt-2 w-full rounded-lg border border-rule bg-paper-2 px-3 py-2.5 text-ink"
            >
              <option value="">All markets (inbound)</option>
              {dataset.homeCounts.map((h) => (
                <option key={h.code} value={h.code}>
                  {names[h.code] ?? h.code} ({h.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side panel */}
        <aside>
          <div className="card-paper rounded-xl p-6 lg:sticky lg:top-20">
            {home ? (
              <HomePanel
                name={names[home] ?? home}
                code={home}
                based={homeCount}
                reach={homeReach}
                destinations={outbound ?? {}}
                names={names}
              />
            ) : (
              <InboundPanel dataset={dataset} names={names} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function selected(code: string, home: string | null): boolean {
  return home === code
}

function StatRow({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <p className="fig text-3xl leading-none" style={color ? { color } : undefined}>{value}</p>
      <p className="eyebrow mt-1.5">{label}</p>
    </div>
  )
}

function MiniBars({
  rows,
  max,
  names,
  color,
}: {
  rows: { code: string; count: number }[]
  max: number
  names: Record<string, string>
  color: string
}) {
  return (
    <div className="border-t border-rule">
      {rows.map(({ code, count }) => (
        <div key={code} className="grid grid-cols-[minmax(0,5.5rem)_1fr_auto] items-center gap-3 border-b border-rule py-2">
          <span className="truncate text-[13px] text-ink-soft" title={names[code] ?? code}>
            {names[code] ?? code}
          </span>
          <div className="h-2 overflow-hidden rounded-sm bg-paper-3">
            <div
              className="h-full rounded-sm"
              style={{ width: `${Math.max((count / max) * 100, 2)}%`, backgroundColor: color }}
            />
          </div>
          <span className="cd-cell w-8 shrink-0 text-right text-sm tabular-nums text-ink">{count}</span>
        </div>
      ))}
    </div>
  )
}

function InboundPanel({ dataset, names }: { dataset: PassportingDataset; names: Record<string, string> }) {
  const top = dataset.inbound.slice(0, 8)
  return (
    <div>
      <p className="eyebrow text-gold">Across the single market</p>
      <h3 className="fig mt-1 text-2xl leading-tight text-ink">Where licensed firms can operate</h3>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-5">
        <StatRow value={dataset.totalFirms.toLocaleString('en-GB')} label="Licensed firms" />
        <StatRow value={dataset.avgReach.toFixed(1)} label="Avg markets / firm" color="var(--gold)" />
      </div>
      <div className="mt-5 border-t border-rule pt-5">
        <StatRow value={dataset.totalLinks.toLocaleString('en-GB')} label="Total passport links" />
      </div>

      <p className="eyebrow mt-7 mb-3">Most-served markets</p>
      <MiniBars rows={top} max={dataset.maxInbound || 1} names={names} color="var(--forest)" />
      <p className="mt-5 text-sm leading-relaxed text-ink-soft">
        A single MiCA licence passports across the EEA. Select a highlighted home state to trace where its
        firms can operate.
      </p>
    </div>
  )
}

function HomePanel({
  name,
  code,
  based,
  reach,
  destinations,
  names,
}: {
  name: string
  code: string
  based: number
  reach: number
  destinations: Record<string, number>
  names: Record<string, string>
}) {
  const rows = Object.entries(destinations)
    .filter(([d]) => d !== code)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
  const max = rows[0]?.count ?? 1
  return (
    <div>
      <p className="eyebrow text-gold">Home state</p>
      <h3 className="fig mt-1 text-2xl leading-tight text-ink">{name}</h3>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-5">
        <StatRow value={String(based)} label="Firms based here" />
        <StatRow value={String(reach)} label="Markets reached" color="var(--gold)" />
      </div>

      <p className="eyebrow mt-7 mb-3">Top destinations</p>
      {rows.length > 0 ? (
        <MiniBars rows={rows.slice(0, 10)} max={max} names={names} color="var(--gold)" />
      ) : (
        <p className="text-sm text-ink-soft">No outbound passporting recorded for this state.</p>
      )}
    </div>
  )
}

export default PassportingExplorer
