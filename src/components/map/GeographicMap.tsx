'use client'

import { useMemo, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { COUNTRY_PATHS, MAP_VIEWBOX } from '@/lib/constants/europe-geo'
import type { StateWithCount } from '@/lib/queries/states'

const ALL_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'NO', 'IS', 'LI',
] as const

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function isEEA(state: StateWithCount | undefined): boolean {
  return !!state?.notes && /EEA/i.test(state.notes)
}

/**
 * Choropleth fill for a country.
 *  - count 0  → faint navy wash
 *  - count >0 → forest ramped from ~18% to ~92% mix into the navy base
 *  - hover/selected adds a small brightness bump
 */
function fillFor(count: number, max: number, active: boolean): string {
  if (count <= 0) {
    return active
      ? 'color-mix(in srgb, var(--forest) 12%, var(--paper-2))'
      : 'color-mix(in srgb, var(--forest) 6%, var(--paper-2))'
  }
  const t = max <= 1 ? 1 : count / max
  let pct = 18 + t * (92 - 18)
  if (active) pct = Math.min(96, pct + 8)
  return `color-mix(in srgb, var(--forest) ${pct.toFixed(1)}%, var(--paper))`
}

export function GeographicMap({ states }: { states: StateWithCount[] }) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const mapRef = useRef<HTMLDivElement | null>(null)

  const trackPointer = useCallback((e: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  const byCode = useMemo(() => {
    const m = new Map<string, StateWithCount>()
    for (const s of states) m.set(s.code, s)
    return m
  }, [states])

  const max = useMemo(
    () => Math.max(1, ...states.map((s) => s.authorized_count)),
    [states],
  )

  // Alphabetical list (by name) for the mobile <select>; codes without geo
  // still appear so the picker never silently drops a jurisdiction.
  const ordered = useMemo(() => {
    return ALL_CODES.map((code) => {
      const s = byCode.get(code)
      return { code, name: s?.name ?? code }
    }).sort((a, b) => a.name.localeCompare(b.name, 'en'))
  }, [byCode])

  // What the detail panel describes: hover wins on desktop, otherwise selection.
  const activeCode = hovered ?? selected
  const activeState = activeCode ? byCode.get(activeCode) : undefined

  const navigate = useCallback(
    (code: string) => router.push(`/firms?state=${code}`),
    [router],
  )

  return (
    <div className="card-paper overflow-hidden rounded-2xl p-5 sm:p-8 lg:p-10">
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        {/* ── Map column ─────────────────────────────────────────── */}
        <div className="min-w-0 relative" ref={mapRef}>
          <svg
            viewBox={MAP_VIEWBOX}
            role="img"
            aria-label="Map of EU and EEA countries by number of licensed crypto firms"
            className="mx-auto block h-auto w-full max-w-[480px] select-none lg:max-w-[680px]"
            style={{ overflow: 'visible' }}
          >
            {ALL_CODES.map((code, i) => {
              const d = COUNTRY_PATHS[code]
              if (!d) return null
              const s = byCode.get(code)
              const name = s?.name ?? code
              const count = s?.authorized_count ?? 0
              const isActive =
                hovered === code || selected === code
              return (
                <path
                  key={code}
                  d={d}
                  tabIndex={0}
                  role="button"
                  aria-label={`${name}: ${count} licensed firms`}
                  className="map-path cursor-pointer outline-offset-0"
                  style={{
                    fill: fillFor(count, max, isActive),
                    stroke: isActive ? 'var(--gold)' : 'var(--rule)',
                    strokeWidth: isActive ? 1.5 : 0.75,
                    strokeLinejoin: 'round',
                    transition: 'fill .2s, stroke .2s',
                    paintOrder: 'stroke',
                    animationDelay: `${i * 16}ms`,
                  }}
                  onMouseEnter={() => setHovered(code)}
                  onMouseMove={trackPointer}
                  onMouseLeave={() => { setHovered(null); setTip(null) }}
                  onFocus={() => setHovered(code)}
                  onBlur={() => setHovered(null)}
                  onClick={() => {
                    // Desktop: a click filters the registry. The picker below
                    // is for touch; here we set selection then navigate.
                    setSelected(code)
                    navigate(code)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(code)
                      navigate(code)
                    }
                  }}
                />
              )
            })}
          </svg>

          {/* Hover tooltip — follows the cursor over the map (desktop pointers). */}
          {hovered && tip && activeState && (
            <div
              className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-[calc(100%+12px)] whitespace-nowrap rounded-md border border-rule bg-paper-2 px-3 py-2 shadow-lg lg:block"
              style={{ left: tip.x, top: tip.y }}
            >
              <span className="block fig text-sm leading-tight text-ink">{activeState.name}</span>
              <span className="block eyebrow mt-0.5 normal-case text-gold">
                {activeState.authorized_count} licensed · {activeState.total_count} tracked
              </span>
            </div>
          )}

          <p className="eyebrow mt-3 normal-case text-ink-faint">
            Source: ESMA register and national authorities.
          </p>

          {/* Mobile picker — only meaningful on touch / below lg */}
          <div className="mt-6 lg:hidden">
            <label htmlFor="country-picker" className="eyebrow block">
              Select a country
            </label>
            <select
              id="country-picker"
              value={selected ?? ''}
              onChange={(e) => setSelected(e.target.value || null)}
              className="mt-2 w-full rounded-lg border border-rule bg-paper-2 px-3 py-2.5 text-ink"
            >
              <option value="">Choose a jurisdiction…</option>
              {ordered.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile detail card (desktop uses the sticky side panel) */}
          <div className="mt-4 lg:hidden">
            {activeState ? (
              <DetailCard
                state={activeState}
                eea={isEEA(activeState)}
                onNavigate={() => navigate(activeState.code)}
                showMobileCta
              />
            ) : null}
          </div>
        </div>

        {/* ── Detail panel (desktop) ─────────────────────────────── */}
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-rule bg-paper-3 p-6 lg:sticky lg:top-24">
            {activeState ? (
              <DetailCard
                state={activeState}
                eea={isEEA(activeState)}
                onNavigate={() => navigate(activeState.code)}
              />
            ) : (
              <EmptyPanel />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */

function DetailCard({
  state,
  eea,
  onNavigate,
  showMobileCta = false,
}: {
  state: StateWithCount
  eea: boolean
  onNavigate: () => void
  showMobileCta?: boolean
}) {
  const deadline =
    state.transitional_end_date != null
      ? formatDate(state.transitional_end_date)
      : null
  const months = state.transitional_months
  const transitional =
    months != null || deadline
      ? [months != null ? `${months} months` : null, deadline]
          .filter(Boolean)
          .join(' · ')
      : 'None'
  const verified = formatDate(state.application_deadline)

  return (
    <div className={showMobileCta ? 'card-paper rounded-xl p-6' : ''}>
      <p className="eyebrow text-gold">
        {state.code} · {eea ? 'EEA' : 'EU'}
      </p>
      <h3 className="fig mt-1 text-3xl leading-tight text-ink">{state.name}</h3>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-rule pt-5">
        <div>
          <p className="eyebrow">Licensed</p>
          <p
            className="fig mt-1 text-3xl"
            style={{ color: 'var(--forest)' }}
          >
            {state.authorized_count}
          </p>
        </div>
        <div>
          <p className="eyebrow">Tracked</p>
          <p className="fig mt-1 text-3xl text-ink">{state.total_count}</p>
        </div>
      </div>

      <dl className="mt-6 space-y-4 border-t border-rule pt-5">
        <div>
          <dt className="eyebrow">Transitional deadline</dt>
          <dd className="cd-cell mt-1 text-sm text-ink-soft">{transitional}</dd>
        </div>
        {verified ? (
          <div>
            <dt className="eyebrow">Last verified</dt>
            <dd className="cd-cell mt-1 text-sm text-ink-soft">{verified}</dd>
          </div>
        ) : null}
      </dl>

      {showMobileCta ? (
        <button
          type="button"
          onClick={onNavigate}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-rule bg-paper-3 px-4 py-2.5 text-sm font-medium text-gold"
        >
          View {state.total_count} firms in {state.name} →
        </button>
      ) : (
        <p className="mt-6 border-t border-rule pt-5 text-sm text-gold">
          Click to filter the registry →
        </p>
      )}
    </div>
  )
}

function EmptyPanel() {
  return (
    <div>
      <p className="eyebrow">Explore the map</p>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Hover or focus a country to see its licensed and tracked firm counts.
        Select one to filter the registry.
      </p>

      <div className="mt-8 border-t border-rule pt-6">
        <p className="eyebrow mb-3">Licensed firms</p>
        <div
          className="h-2.5 w-full rounded-full"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in srgb, var(--forest) 6%, var(--paper-2)), color-mix(in srgb, var(--forest) 18%, var(--paper)), color-mix(in srgb, var(--forest) 92%, var(--paper)))',
          }}
          aria-hidden="true"
        />
        <div className="mt-2 flex justify-between">
          <span className="eyebrow normal-case">Fewer</span>
          <span className="eyebrow normal-case">More licensed</span>
        </div>
      </div>
    </div>
  )
}
