'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { CATEGORY_LABELS } from '@/lib/constants/deadline'
import type { FirmWithStatus } from '@/types/database'

interface Props {
  firms: FirmWithStatus[]
  initialState?: string
}

const inputCls =
  'px-3.5 py-2 rounded-sm bg-paper border border-rule-bold/25 text-ink placeholder-ink-faint focus:outline-none focus:border-oxblood text-sm transition-colors'

export function FirmTable({ firms, initialState }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState(initialState ?? 'all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    // Show licensed and recognised firms first; push unverified/no-LEI entries down.
    const rank: Record<string, number> = {
      authorized: 0, application_pending: 1, exited_restricting_eu: 2, out_of_scope: 3, not_authorized: 4,
    }
    return firms
      .filter((f) => {
        const status = f.firm_statuses?.[0]?.status ?? 'not_authorized'
        const matchSearch =
          !q || f.trading_name.toLowerCase().includes(q) || f.legal_name.toLowerCase().includes(q)
        const matchStatus = statusFilter === 'all' || status === statusFilter
        const matchCategory = categoryFilter === 'all' || f.category === categoryFilter
        const matchState = stateFilter === 'all' || f.home_state_code === stateFilter
        return matchSearch && matchStatus && matchCategory && matchState
      })
      .sort((a, b) => {
        const ra = rank[a.firm_statuses?.[0]?.status ?? 'not_authorized'] ?? 5
        const rb = rank[b.firm_statuses?.[0]?.status ?? 'not_authorized'] ?? 5
        if (ra !== rb) return ra - rb
        // within a status, real (LEI-bearing) entities before unverified ones
        const la = a.lei ? 0 : 1
        const lb = b.lei ? 0 : 1
        if (la !== lb) return la - lb
        return a.trading_name.localeCompare(b.trading_name)
      })
  }, [firms, search, statusFilter, categoryFilter, stateFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <input
          type="search"
          placeholder="Search firms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`flex-1 ${inputCls}`}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputCls}>
          <option value="all">All statuses</option>
          <option value="authorized">Authorized</option>
          <option value="application_pending">Application Pending</option>
          <option value="not_authorized">Not Authorized</option>
          <option value="exited_restricting_eu">Exited / Restricting EU</option>
          <option value="out_of_scope">Out of Scope</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={inputCls}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <p className="eyebrow">
          <span className="cd-cell text-ink">{filtered.length}</span> firms
        </p>
        {stateFilter !== 'all' && (
          <button
            onClick={() => setStateFilter('all')}
            className="cd-cell text-xs bg-paper-3 text-ink border border-rule px-2.5 py-1 rounded-sm hover:border-oxblood transition-colors"
          >
            {stateFilter} ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card-paper rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-rule-bold bg-paper-2">
              {['Firm', 'Category', 'Status', 'Verified', 'Source'].map((h, i) => (
                <th
                  key={h}
                  className={`text-left px-4 py-3 eyebrow ${i === 1 ? 'hidden md:table-cell' : ''} ${i >= 3 ? 'hidden lg:table-cell' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((firm, i) => {
              const status = firm.firm_statuses?.[0]
              return (
                <tr
                  key={firm.id}
                  className={`border-b border-rule/60 hover:bg-paper-2 transition-colors ${i % 2 ? 'bg-paper-3/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/firms/${firm.slug}`} className="group">
                      <p className="font-medium text-ink group-hover:text-oxblood transition-colors">{firm.trading_name}</p>
                      {firm.trading_name !== firm.legal_name && (
                        <p className="text-xs text-ink-faint">{firm.legal_name}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft hidden md:table-cell">{CATEGORY_LABELS[firm.category] ?? firm.category}</td>
                  <td className="px-4 py-3">{status ? <StatusBadge status={status.status} /> : <span className="text-ink-faint">·</span>}</td>
                  <td className="px-4 py-3 cd-cell text-ink-faint hidden lg:table-cell">
                    {status?.last_verified
                      ? new Date(status.last_verified).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '·'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {status?.source_url ? (
                      <a
                        href={status.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-ink-faint hover:text-oxblood underline underline-offset-2 truncate max-w-[160px] inline-block"
                      >
                        {status.source_type.replace(/_/g, ' ')}
                      </a>
                    ) : (
                      ', '
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-ink-faint">No firms match your filters.</div>}
      </div>
    </div>
  )
}
