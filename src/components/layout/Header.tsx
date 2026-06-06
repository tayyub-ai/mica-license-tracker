import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-white font-bold text-lg tracking-tight">MiCA Tracker</span>
          <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
            Live
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/firms" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Registry
          </Link>
          <Link href="/changelog" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Changelog
          </Link>
          <Link href="/methodology" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Methodology
          </Link>
        </nav>
      </div>
    </header>
  )
}
