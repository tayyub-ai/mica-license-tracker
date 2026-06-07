import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper/80 backdrop-blur-md border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-1">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">MiCA</span>
            <span className="text-gold text-2xl font-display leading-none">.</span>
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">Tracker</span>
          </Link>
          <nav className="flex items-center gap-7">
            {[
              ['Registry', '/firms'],
              ['Changelog', '/changelog'],
              ['Methodology', '/methodology'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-ink-soft hover:text-gold transition-colors relative after:absolute after:left-0 after:-bottom-1.5 after:h-px after:w-0 after:bg-gold hover:after:w-full after:transition-all"
              >
                {label}
              </Link>
            ))}
            <span className="hidden md:flex items-center gap-2 pill-gold text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gold glow-dot" />
              Tracking live
            </span>
          </nav>
        </div>
      </div>
    </header>
  )
}
