'use client'

import { useEffect, useState } from 'react'
import { MICA_DEADLINE } from '@/lib/constants/deadline'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  expired: boolean
}

function getTimeLeft(): TimeLeft {
  const diff = MICA_DEADLINE.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function Cell({ value, label, pad = true }: { value: number; label: string; pad?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="fig text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-ink">
        {pad ? String(value).padStart(2, '0') : value}
      </span>
      <span className="eyebrow mt-3 text-[9px] sm:text-[10px]">{label}</span>
    </div>
  )
}

// Stable zero state for SSR / first client render to avoid hydration mismatch.
const ZERO: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false }

export function CountdownTimer() {
  const [t, setT] = useState<TimeLeft>(ZERO)

  useEffect(() => {
    setT(getTimeLeft())
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t.expired) {
    const daysSince = Math.floor((Date.now() - MICA_DEADLINE.getTime()) / 86400000)
    return (
      <div className="flex flex-col">
        <span className="fig text-5xl md:text-6xl lg:text-7xl leading-[0.9] text-ink">{daysSince}</span>
        <span className="eyebrow mt-3 text-[10px]">Days since the transition ended</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 sm:gap-6 md:gap-9">
      <Cell value={t.days} label="Days" pad={false} />
      <Cell value={t.hours} label="Hours" />
      <Cell value={t.minutes} label="Minutes" />
      <Cell value={t.seconds} label="Seconds" />
    </div>
  )
}
