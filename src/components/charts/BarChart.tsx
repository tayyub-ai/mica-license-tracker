'use client'

import { useInView, usePrefersReducedMotion } from '@/components/motion/useInView'

interface BarDatum {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarDatum[]
  /** Optional fixed maximum. Defaults to the largest value in `data`. */
  max?: number
  valueFormat?: (n: number) => string
}

/**
 * Restrained horizontal bar chart built from plain divs (crisp at any width).
 * label · bar · value, with a hairline baseline beneath. Bars grow from zero
 * the first time the chart scrolls into view (instant under reduced motion).
 */
export function BarChart({ data, max, valueFormat }: BarChartProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const animate = inView || reduced

  if (data.length === 0) return null

  const ceiling = max ?? Math.max(...data.map((d) => d.value), 1)
  const fmt = valueFormat ?? ((n: number) => n.toLocaleString('en-GB'))

  return (
    <div className="border-t border-rule" ref={ref}>
      {data.map((d, i) => {
        const pct = ceiling > 0 ? Math.max((d.value / ceiling) * 100, 1.5) : 0
        return (
          <div
            key={`${d.label}-${i}`}
            className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] sm:grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:gap-4 py-2.5 border-b border-rule"
          >
            <span className="text-[13px] sm:text-sm text-ink-soft truncate" title={d.label}>
              {d.label}
            </span>
            <div className="h-2.5 rounded-sm bg-paper-3 overflow-hidden">
              <div
                className="h-full rounded-sm"
                style={{
                  width: animate ? `${pct}%` : '0%',
                  backgroundColor: d.color ?? 'var(--gold)',
                  transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                  transitionDelay: `${Math.min(i * 55, 440)}ms`,
                }}
              />
            </div>
            <span className="cd-cell text-sm text-ink tabular-nums text-right w-10 shrink-0">
              {fmt(d.value)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default BarChart
