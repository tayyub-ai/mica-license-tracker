'use client'

import { useState } from 'react'
import { useInView, usePrefersReducedMotion } from '@/components/motion/useInView'

interface AreaDatum {
  x: string
  y: number
}

interface AreaChartProps {
  data: AreaDatum[]
  height?: number
}

/**
 * Small editorial SVG area/line chart. Smooth-ish polyline with a faint filled
 * area in --forest, a hairline baseline, plus min/max y and first/last x labels.
 * The line draws itself in on first view; hovering reveals the value at each
 * month via a guide line + readout.
 */
export function AreaChart({ data, height = 220 }: AreaChartProps) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const drawn = inView || reduced
  const [hover, setHover] = useState<number | null>(null)

  if (data.length < 2) return null

  const width = 800
  const padX = 8
  const padTop = 16
  const padBottom = 8
  const plotW = width - padX * 2
  const plotH = height - padTop - padBottom

  const ys = data.map((d) => d.y)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const span = maxY - minY || 1

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * plotW
    const y = padTop + (1 - (d.y - minY) / span) * plotH
    return { x, y }
  })

  // Smooth path via Catmull-Rom -> cubic bezier.
  const linePath = points
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
      const prev = arr[i - 1]
      const cx = (prev.x + p.x) / 2
      return `C ${cx.toFixed(2)} ${prev.y.toFixed(2)}, ${cx.toFixed(2)} ${p.y.toFixed(2)}, ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    })
    .join(' ')

  const baselineY = padTop + plotH
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${baselineY} L ${points[0].x.toFixed(2)} ${baselineY} Z`

  const firstX = data[0].x
  const lastX = data[data.length - 1].x
  const active = hover != null ? points[hover] : null

  return (
    <div className="w-full" ref={ref}>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Cumulative authorisations from ${firstX} to ${lastX}`}
          onMouseLeave={() => setHover(null)}
        >
          {/* hairline baseline */}
          <line
            x1={padX}
            y1={baselineY}
            x2={width - padX}
            y2={baselineY}
            stroke="var(--rule)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={areaPath}
            fill="var(--forest)"
            fillOpacity={drawn ? 0.1 : 0}
            style={{ transition: 'fill-opacity 0.9s ease 0.5s' }}
          />
          <path
            d={linePath}
            fill="none"
            stroke="var(--forest)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: 'stroke-dashoffset 1.2s ease',
            }}
          />
          {/* hover guide */}
          {active && (
            <line
              x1={active.x}
              y1={padTop}
              x2={active.x}
              y2={baselineY}
              stroke="var(--gold)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {active && (
            <circle cx={active.x} cy={active.y} r={3.5} fill="var(--gold)" vectorEffect="non-scaling-stroke" />
          )}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={3}
            fill="var(--forest)"
            fillOpacity={drawn ? 1 : 0}
            style={{ transition: 'fill-opacity 0.3s ease 1.1s' }}
            vectorEffect="non-scaling-stroke"
          />
          {/* invisible hit targets per month */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={i === 0 ? 0 : (points[i - 1].x + p.x) / 2}
              y={0}
              width={
                (i === 0 ? p.x : (p.x - points[i - 1].x) / 2) +
                (i === points.length - 1 ? padX : (points[i + 1].x - p.x) / 2)
              }
              height={height}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {active && (
          <div
            className="pointer-events-none absolute -top-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-rule bg-paper-2 px-2.5 py-1.5 text-center shadow-lg"
            style={{ left: `${(active.x / width) * 100}%` }}
          >
            <span className="block cd-cell text-sm text-ink tabular-nums">
              {data[hover!].y.toLocaleString('en-GB')}
            </span>
            <span className="block eyebrow text-[9px] mt-0.5">{data[hover!].x}</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between mt-2">
        <span className="eyebrow">{firstX}</span>
        <span className="eyebrow">
          {minY.toLocaleString('en-GB')} – {maxY.toLocaleString('en-GB')}
        </span>
        <span className="eyebrow">{lastX}</span>
      </div>
    </div>
  )
}

export default AreaChart
