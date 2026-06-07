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

function colorFor(count: number, max: number): string {
  if (count === 0) return 'bg-zinc-800 text-zinc-600 border-zinc-700'
  const t = count / max
  if (t > 0.66) return 'bg-emerald-500 text-emerald-950 border-emerald-400'
  if (t > 0.33) return 'bg-emerald-600/80 text-emerald-50 border-emerald-500'
  if (t > 0.12) return 'bg-emerald-700/70 text-emerald-100 border-emerald-600'
  return 'bg-emerald-800/50 text-emerald-200 border-emerald-700'
}

export function EuropeTileMap({ states }: { states: StateWithCount[] }) {
  const router = useRouter()
  const [hover, setHover] = useState<StateWithCount | null>(null)

  const byCode = Object.fromEntries(states.map((s) => [s.code, s]))
  const max = Math.max(1, ...states.map((s) => s.authorized_count))
  const maxRow = Math.max(...Object.values(GRID).map(([r]) => r))
  const maxCol = Math.max(...Object.values(GRID).map(([, c]) => c))

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
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
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
              onClick={() => router.push(`/firms?state=${code}`)}
              className={`aspect-square rounded-md border text-center flex flex-col items-center justify-center transition-all hover:scale-105 hover:z-10 hover:ring-2 hover:ring-white/30 ${colorFor(
                s.authorized_count,
                max
              )}`}
              title={`${s.name}: ${s.authorized_count} authorized`}
            >
              <span className="text-[11px] font-bold leading-none">{code}</span>
              <span className="text-[10px] leading-none mt-0.5 tabular-nums opacity-80">
                {s.authorized_count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Info panel */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 min-h-[160px] lg:sticky lg:top-20">
        {hover ? (
          <div className="space-y-3">
            <div>
              <p className="text-lg font-bold text-white">{hover.name}</p>
              <p className="text-xs text-zinc-500">{hover.code}{hover.notes?.includes('EEA') ? ' · EEA' : ' · EU'}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500 text-xs">Authorized</p>
                <p className="text-emerald-400 font-bold text-xl tabular-nums">{hover.authorized_count}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Tracked firms</p>
                <p className="text-white font-bold text-xl tabular-nums">{hover.total_count}</p>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-3 text-xs space-y-1">
              <p className="text-zinc-500">
                Transitional window:{' '}
                <span className="text-zinc-300">
                  {hover.transitional_months ? `${hover.transitional_months} months` : 'None'}
                </span>
              </p>
              <p className="text-zinc-500">
                Ends:{' '}
                <span className="text-zinc-300">
                  {hover.transitional_end_date
                    ? new Date(hover.transitional_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </span>
              </p>
              {hover.notes && <p className="text-zinc-600 leading-relaxed mt-2">{hover.notes}</p>}
            </div>
            <p className="text-xs text-zinc-500">Click to filter the registry →</p>
          </div>
        ) : (
          <div className="text-sm text-zinc-500 space-y-3">
            <p className="font-medium text-zinc-300">EU-27 + EEA authorization map</p>
            <p>Hover a state to see its authorized-firm count and transitional deadline. Click to filter the registry.</p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700" />
              <span className="text-xs">0</span>
              <span className="w-4 h-4 rounded bg-emerald-800/50 border border-emerald-700 ml-2" />
              <span className="w-4 h-4 rounded bg-emerald-600/80 border border-emerald-500" />
              <span className="w-4 h-4 rounded bg-emerald-500 border border-emerald-400" />
              <span className="text-xs">more authorized</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
