import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-rule-bold bg-paper-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:max-w-xs">
            <p className="font-display text-xl font-semibold text-ink mb-3">
              MiCA<span className="text-oxblood">·</span>Tracker
            </p>
            <p className="text-sm text-ink-soft leading-relaxed">
              An independent public record of EU MiCA CASP authorizations. Every status is sourced and dated.
              Not affiliated with ESMA or any authority. Not legal advice.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-4">Navigate</p>
            <nav className="flex flex-col gap-2.5">
              {[
                ['Firm Registry', '/firms'],
                ['Changelog', '/changelog'],
                ['Methodology', '/methodology'],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="text-sm text-ink-soft hover:text-oxblood transition-colors w-fit">
                  {l}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="eyebrow mb-4">Open Data</p>
            <nav className="flex flex-col gap-2.5">
              {[
                ['JSON API', '/api/firms'],
                ['CSV Export', '/api/export'],
                ['RSS Feed', '/changelog.xml'],
                ['Embed Widget', '/embed'],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="text-sm text-ink-soft hover:text-oxblood transition-colors w-fit">
                  {l}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-rule flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <p className="eyebrow normal-case tracking-normal text-ink-faint">
            Sourced from the ESMA interim MiCA register &amp; national NCA registers.
          </p>
          <p className="text-xs text-ink-faint">
            Corrections:{' '}
            <a href="mailto:corrections@mica-tracker.eu" className="text-ink-soft hover:text-oxblood underline underline-offset-2">
              corrections@mica-tracker.eu
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
