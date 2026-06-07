import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-sm border-b border-rule-bold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight text-ink">
              MiCA<span className="text-oxblood">·</span>Tracker
            </span>
            <span className="hidden sm:inline eyebrow text-[10px] border border-rule px-2 py-0.5 rounded-sm group-hover:border-oxblood transition-colors">
              EU Register Watch
            </span>
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
                className="text-sm font-medium text-ink-soft hover:text-oxblood transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-oxblood hover:after:w-full after:transition-all"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
