import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-semibold text-white mb-2">MiCA Tracker</p>
            <p className="text-sm text-zinc-500 leading-relaxed">
              A free, public tracker of EU MiCA CASP authorizations. Every status is
              sourced and dated. Not legal advice.
            </p>
          </div>
          <div>
            <p className="font-semibold text-zinc-400 text-sm uppercase tracking-widest mb-3">Navigate</p>
            <nav className="flex flex-col gap-2">
              <Link href="/firms"       className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Firm Registry</Link>
              <Link href="/changelog"   className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Changelog</Link>
              <Link href="/methodology" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">Methodology</Link>
            </nav>
          </div>
          <div>
            <p className="font-semibold text-zinc-400 text-sm uppercase tracking-widest mb-3">Data</p>
            <nav className="flex flex-col gap-2">
              <Link href="/api/firms"   className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">JSON API</Link>
              <Link href="/api/export"  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">CSV Export</Link>
              <Link href="/changelog.xml" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">RSS Feed</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            Data sourced from ESMA MiCA interim register and national NCA registers. Last-verified dates shown per firm.
          </p>
          <p className="text-xs text-zinc-600">
            Corrections:{' '}
            <a href="mailto:corrections@mica-tracker.eu" className="text-zinc-500 hover:text-zinc-300 underline underline-offset-2">
              corrections@mica-tracker.eu
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
