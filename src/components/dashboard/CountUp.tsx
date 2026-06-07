'use client'

import { useEffect, useState } from 'react'

export function CountUp({ value, duration = 1100, delay = 150 }: { value: number; duration?: number; delay?: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setDisplay(value)
      return
    }
    let raf = 0
    const startTimer = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        setDisplay(Math.round(eased * value))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(startTimer)
      cancelAnimationFrame(raf)
    }
  }, [value, duration, delay])

  return <span className="tnum">{display}</span>
}
