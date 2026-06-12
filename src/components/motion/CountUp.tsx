'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, usePrefersReducedMotion } from './useInView'

interface CountUpProps {
  value: number
  /** Animation duration in ms. */
  durationMs?: number
  /** Custom number formatter. Defaults to en-GB locale grouping. */
  format?: (n: number) => string
  className?: string
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Counts a number up from 0 to `value` the first time it enters the viewport.
 * Server-renders the final value (correct for SEO / no-JS, no layout shift) and
 * only animates on the client when motion is allowed.
 */
export function CountUp({ value, durationMs = 1100, format, className }: CountUpProps) {
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString('en-GB'))
  const { ref, inView } = useInView<HTMLSpanElement>()
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    if (reduced) {
      setDisplay(value)
      return
    }
    started.current = true
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      if (!start) start = now
      const progress = Math.min((now - start) / durationMs, 1)
      setDisplay(value * easeOutCubic(progress))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    setDisplay(0)
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduced, value, durationMs])

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {fmt(display)}
    </span>
  )
}

export default CountUp
