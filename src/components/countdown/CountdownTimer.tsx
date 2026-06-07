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
    <div className="flex flex-col items-center">
      <span className="fig text-4xl sm:text-5xl md:text-6xl leading-none text-ink">
        {pad ? String(value).padStart(2, '0') : value}
      </span>
      <span className="eyebrow mt-2.5 text-[9px] sm:text-[10px]">{label}</span>
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
    return <p className="font-display text-3xl text-gold">The deadline has passed.</p>
  }

  return (
    <div className="inline-flex items-end gap-2.5 sm:gap-5 md:gap-7 px-4 sm:px-7 py-4 sm:py-6 card-paper rounded-2xl">
      <Cell value={t.days} label="Days" pad={false} />
      <Colon />
      <Cell value={t.hours} label="Hours" />
      <Colon />
      <Cell value={t.minutes} label="Minutes" />
      <Colon />
      <Cell value={t.seconds} label="Seconds" />
    </div>
  )
}

function Colon() {
  return <span className="fig text-2xl sm:text-3xl md:text-4xl text-rule-bold mb-4 sm:mb-6 leading-none">:</span>
}
