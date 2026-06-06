import Link from 'next/link'
import { getChangelog } from '@/lib/queries/changelog'
import { StatusBadge } from '@/components/registry/StatusBadge'
import type { Metadata } from 'next'
import type { FirmStatus } from '@/types/database'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Every MiCA authorization status change — dated, sourced, public.',
}

export const revalidate = 3600

export default async function ChangelogPage() {
  const entries = await getChangelog(100)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Changelog</h1>
          <p className="text-zinc-400">Every status change — dated, sourced, auditable.</p>
        </div>
        <a href="/changelog.xml" className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition-colors">
          RSS feed
        </a>
      </div>

      {entries.length === 0 ? (
        <p className="text-zinc-500 py-16 text-center">No changes recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href={`/firms/${entry.firms?.slug}`} className="font-medium text-white hover:text-zinc-300 transition-colors">
                    {entry.firms?.trading_name ?? 'Unknown firm'}
                  </Link>
                  {entry.old_status && (
                    <StatusBadge status={entry.old_status as FirmStatus} />
                  )}
                  {entry.old_status && <span className="text-zinc-600 text-sm">→</span>}
                  <StatusBadge status={entry.new_status as FirmStatus} />
                </div>
                <time className="text-sm text-zinc-500 whitespace-nowrap">
                  {new Date(entry.published_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </time>
              </div>
              {entry.summary && (
                <p className="text-sm text-zinc-400 mt-2">{entry.summary}</p>
              )}
              <a
                href={entry.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2 mt-2 inline-block"
              >
                source →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
