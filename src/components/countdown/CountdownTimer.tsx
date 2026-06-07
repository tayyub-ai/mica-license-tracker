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

function Unit({ value, label, wide }: { value: number; label: string; wide?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={`cd-cell font-semibold leading-none text-ink ${wide ? 'text-5xl md:text-7xl' : 'text-4xl md:text-6xl'}`}
      >
        {wide ? value : String(value).padStart(2, '0')}
      </span>
      <span className="eyebrow mt-2 text-[10px]">{label}</span>
    </div>
  )
}

export function CountdownTimer() {
  const [t, setT] = useState<TimeLeft>(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (t.expired) {
    return <p className="font-display text-3xl text-oxblood">The MiCA deadline has passed — 1 July 2026.</p>
  }

  return (
    <div className="inline-flex items-end gap-5 md:gap-8 px-6 py-5 card-paper rounded-sm">
      <Unit value={t.days} label="Days" wide />
      <Dot />
      <Unit value={t.hours} label="Hours" />
      <Dot />
      <Unit value={t.minutes} label="Minutes" />
      <Dot />
      <Unit value={t.seconds} label="Seconds" />
    </div>
  )
}

function Dot() {
  return <span className="cd-cell text-3xl md:text-5xl text-rule mb-5 leading-none">:</span>
}
