'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { StateWithCount } from '@/lib/queries/states'

// Approximate geographic tile-grid layout (row, col) for EU-27 + EEA.
const GRID: Record<string, [number, number]> = {
  IS: [0, 0],
  NO: [1, 5], SE: [1, 6], FI: [1, 7],
  DK: [2, 5], EE: [2, 7],
  IE: [3, 0], NL: [3, 4], DE: [3, 5], PL: [3, 6], LT: [3, 7], LV: [3, 8],
  BE: [4, 4], LU: [4, 3], CZ: [4, 6], SK: [4, 7], FR: [4, 2], LI: [5, 4],
  AT: [5, 5], HU: [5, 7], RO: [5, 8], SI: [5, 6],
  PT: [6, 1], ES: [6, 2], IT: [6, 4], HR: [6, 6], BG: [6, 8],
  MT: [7, 4], GR: [7, 7], CY: [7, 9],
}

function tileStyle(count: number, max: number): React.CSSProperties {
  if (count === 0) {
    return { background: 'var(--paper-3)', color: 'var(--ink-faint)', borderColor: 'var(--rule)' }
  }
  const t = count / max
  const pct = Math.round((0.16 + t * 0.78) * 100)
  return {
    background: `color-mix(in srgb, var(--forest) ${pct}%, var(--paper))`,
    color: t > 0.42 ? 'var(--paper)' : 'var(--ink)',
    borderColor: `color-mix(in srgb, var(--forest) ${Math.min(100, pct + 12)}%, var(--rule))`,
  }
}

export function EuropeTileMap({ states }: { states: StateWithCount[] }) {
  const router = useRouter()
  const [hover, setHover] = useState<StateWithCount | null>(null)

  const byCode = Object.fromEntries(states.map((s) => [s.code, s]))
  const max = Math.max(1, ...states.map((s) => s.authorized_count))
  const maxRow = Math.max(...Object.values(GRID).map(([r]) => r))
  const maxCol = Math.max(...Object.values(GRID).map(([, c]) => c))

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-7 items-start">
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${maxRow + 1}, auto)`,
        }}
      >
        {Object.entries(GRID).map(([code, [row, col]]) => {
          const s = byCode[code]
          if (!s) return null
          return (
            <button
              key={code}
              style={{ gridRow: row + 1, gridColumn: col + 1, ...tileStyle(s.authorized_count, max) }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s)}
              onBlur={() => setHover(null)}
              onClick={() => router.push(`/firms?state=${code}`)}
              className="press aspect-square rounded-md border text-center flex flex-col items-center justify-center hover:scale-[1.12] hover:z-10 hover:shadow-lg hover:ring-2 hover:ring-gold/50 cursor-pointer"
              aria-label={`${s.name}: ${s.authorized_count} authorized firms. Filter registry.`}
            >
              <span className="cd-cell text-[11px] font-semibold leading-none">{code}</span>
              <span className="cd-cell text-[10px] leading-none mt-0.5 tnum opacity-90">{s.authorized_count}</span>
            </button>
          )
        })}
      </div>

      {/* Info panel */}
      <div className="card-paper rounded-sm p-6 min-h-[180px] lg:sticky lg:top-20">
        {hover ? (
          <div className="space-y-4">
            <div>
              <p className="font-display text-2xl font-semibold text-ink leading-tight">{hover.name}</p>
              <p className="eyebrow mt-1">{hover.code} · {hover.notes?.includes('EEA') ? 'EEA' : 'EU'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="eyebrow mb-1">Authorized</p>
                <p className="cd-cell text-3xl font-semibold tnum text-forest">{hover.authorized_count}</p>
              </div>
              <div>
                <p className="eyebrow mb-1">Tracked</p>
                <p className="cd-cell text-3xl font-semibold tnum text-ink">{hover.total_count}</p>
              </div>
            </div>
            <div className="border-t border-rule pt-3 space-y-1.5">
              <p className="text-sm text-ink-soft">
                Transitional window:{' '}
                <span className="text-ink font-medium">
                  {hover.transitional_months ? `${hover.transitional_months} months` : 'None'}
                </span>
              </p>
              <p className="text-sm text-ink-soft">
                Ends:{' '}
                <span className="cd-cell text-ink">
                  {hover.transitional_end_date
                    ? new Date(hover.transitional_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Not set'}
                </span>
              </p>
              {hover.notes && <p className="text-xs text-ink-faint leading-relaxed pt-1">{hover.notes}</p>}
            </div>
            <p className="eyebrow text-oxblood">Click to filter registry →</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-display text-lg font-semibold text-ink">EU-27 + EEA register</p>
            <p className="text-sm text-ink-soft leading-relaxed">
              Hover a state for its authorized-firm count and transitional deadline. Click to filter the registry.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="eyebrow">Fewer</span>
              <span className="flex-1 h-2 rounded-sm" style={{ background: 'linear-gradient(90deg, var(--paper-3), var(--forest))' }} />
              <span className="eyebrow">More</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
