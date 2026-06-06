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
  const now = Date.now()
  const target = MICA_DEADLINE.getTime()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl md:text-6xl font-bold tabular-nums text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs md:text-sm uppercase tracking-widest text-zinc-400 mt-1">
        {label}
      </span>
    </div>
  )
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft)

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
    return () => clearInterval(id)
  }, [])

  if (timeLeft.expired) {
    return (
      <p className="text-2xl font-bold text-red-400">
        MiCA deadline has passed — July 1, 2026
      </p>
    )
  }

  return (
    <div className="flex items-center gap-6 md:gap-10">
      <Unit value={timeLeft.days} label="Days" />
      <Separator />
      <Unit value={timeLeft.hours} label="Hours" />
      <Separator />
      <Unit value={timeLeft.minutes} label="Minutes" />
      <Separator />
      <Unit value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

function Separator() {
  return <span className="text-4xl md:text-5xl text-zinc-500 font-light mb-4">:</span>
}
