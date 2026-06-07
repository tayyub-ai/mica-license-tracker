import Link from 'next/link'
import { getAllFirms } from '@/lib/queries/firms'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { CATEGORY_LABELS } from '@/lib/constants/deadline'
import type { FirmStatus } from '@/types/database'

export default async function AdminFirmsPage() {
  const firms = await getAllFirms()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">Firm Registry ({firms.length})</h1>
        <Link href="/admin/firms/new"
          className="px-4 py-2 rounded-lg bg-ink text-paper text-sm font-semibold hover:bg-oxblood transition-colors">
          + Add firm
        </Link>
      </div>

      <div className="rounded-xl border border-rule overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rule bg-paper-2">
              <th className="text-left px-4 py-3 text-ink-soft font-medium">Firm</th>
              <th className="text-left px-4 py-3 text-ink-soft font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-ink-soft font-medium">Status</th>
              <th className="text-left px-4 py-3 text-ink-soft font-medium hidden lg:table-cell">Last Verified</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => {
              const status = firm.firm_statuses?.[0]
              const isStale = status?.last_verified &&
                new Date(status.last_verified) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              return (
                <tr key={firm.id} className="border-b border-rule hover:bg-paper-3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{firm.trading_name}</p>
                    {firm.trading_name !== firm.legal_name && (
                      <p className="text-xs text-ink-faint">{firm.legal_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-soft hidden md:table-cell">
                    {CATEGORY_LABELS[firm.category]}
                  </td>
                  <td className="px-4 py-3">
                    {status ? <StatusBadge status={status.status as FirmStatus} /> : <span className="text-ink-faint text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={isStale ? 'text-ochre' : 'text-ink-faint'}>
                      {status?.last_verified
                        ? new Date(status.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                    {isStale && <span className="ml-1 text-xs text-ochre">stale</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/firms/${firm.id}`}
                      className="text-xs text-ink-soft hover:text-ink border border-rule px-2 py-1 rounded transition-colors">
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
