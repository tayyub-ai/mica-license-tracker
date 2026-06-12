'use client'

import { useState } from 'react'
import Link from 'next/link'

const NAV: [string, string][] = [
  ['Registry', '/firms'],
  ['Countries', '/countries'],
  ['Passporting', '/passporting'],
  ['Timeline', '/timeline'],
  ['Learn', '/learn'],
  ['Changelog', '/changelog'],
  ['Methodology', '/methodology'],
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-baseline gap-1 shrink-0">
            <span className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink">MiCA</span>
            <span className="text-gold text-xl sm:text-2xl font-display leading-none">.</span>
            <span className="hidden xs:inline font-display text-xl sm:text-2xl font-semibold tracking-tight text-ink">Tracker</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-7">
            {NAV.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-ink-soft hover:text-gold transition-colors relative after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-gold hover:after:w-full after:transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden -mr-1 p-2 text-ink-soft hover:text-ink transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-rule bg-paper">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
            {NAV.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block py-3 text-[15px] font-medium text-ink-soft hover:text-gold border-b border-rule last:border-0 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
