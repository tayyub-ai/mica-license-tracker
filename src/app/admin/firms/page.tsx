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
        <h1 className="text-xl font-bold text-white">Firm Registry ({firms.length})</h1>
        <Link href="/admin/firms/new"
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors">
          + Add firm
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Firm</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Last Verified</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {firms.map((firm) => {
              const status = firm.firm_statuses?.[0]
              const isStale = status?.last_verified &&
                new Date(status.last_verified) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              return (
                <tr key={firm.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{firm.trading_name}</p>
                    {firm.trading_name !== firm.legal_name && (
                      <p className="text-xs text-zinc-500">{firm.legal_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {CATEGORY_LABELS[firm.category]}
                  </td>
                  <td className="px-4 py-3">
                    {status ? <StatusBadge status={status.status as FirmStatus} /> : <span className="text-zinc-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={isStale ? 'text-amber-400' : 'text-zinc-500'}>
                      {status?.last_verified
                        ? new Date(status.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                    {isStale && <span className="ml-1 text-xs text-amber-500">stale</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/firms/${firm.id}`}
                      className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-2 py-1 rounded transition-colors">
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
