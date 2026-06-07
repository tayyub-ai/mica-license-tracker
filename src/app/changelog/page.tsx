import Link from 'next/link'
import { getChangelog } from '@/lib/queries/changelog'
import { StatusBadge } from '@/components/registry/StatusBadge'
import type { Metadata } from 'next'
import type { FirmStatus } from '@/types/database'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Every MiCA authorization status change, dated, sourced, public.',
}

export const revalidate = 3600

export default async function ChangelogPage() {
  const entries = await getChangelog(100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="section-rule pt-5 mb-9 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1.5">The Record</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Changelog</h1>
          <p className="mt-3 text-ink-soft">Every status change, dated, sourced, auditable.</p>
        </div>
        <a href="/changelog.xml" className="eyebrow border border-rule px-3 py-1.5 rounded-sm hover:border-oxblood hover:text-oxblood transition-colors">
          RSS
        </a>
      </div>

      {entries.length === 0 ? (
        <p className="text-ink-faint py-16 text-center">No changes recorded yet.</p>
      ) : (
        <div className="relative">
          {/* timeline rule */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-rule hidden sm:block" />
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="sm:pl-6 relative">
                <span className="absolute left-[-3px] top-5 w-1.5 h-1.5 rounded-full bg-oxblood hidden sm:block" />
                <div className="card-paper rounded-sm p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Link href={`/firms/${entry.firms?.slug}`} className="font-medium text-ink hover:text-oxblood transition-colors">
                        {entry.firms?.trading_name ?? 'Unknown firm'}
                      </Link>
                      {entry.old_status && <StatusBadge status={entry.old_status as FirmStatus} />}
                      {entry.old_status && <span className="text-ink-faint text-sm">→</span>}
                      <StatusBadge status={entry.new_status as FirmStatus} />
                    </div>
                    <time className="cd-cell text-xs text-ink-faint whitespace-nowrap">
                      {new Date(entry.published_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </time>
                  </div>
                  {entry.summary && <p className="text-sm text-ink-soft mt-2">{entry.summary}</p>}
                  <a href={entry.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-oxblood hover:text-oxblood-deep underline underline-offset-2 mt-2 inline-block">
                    source →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
