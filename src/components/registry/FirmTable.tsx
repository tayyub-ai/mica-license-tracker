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

export function FirmTable({ firms, initialState }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState(initialState ?? 'all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return firms.filter((f) => {
      const status = f.firm_statuses?.[0]?.status ?? 'not_authorized'
      const matchSearch =
        !q ||
        f.trading_name.toLowerCase().includes(q) ||
        f.legal_name.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || status === statusFilter
      const matchCategory = categoryFilter === 'all' || f.category === categoryFilter
      const matchState = stateFilter === 'all' || f.home_state_code === stateFilter
      return matchSearch && matchStatus && matchCategory && matchState
    })
  }, [firms, search, statusFilter, categoryFilter, stateFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search firms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="authorized">Authorized</option>
          <option value="application_pending">Application Pending</option>
          <option value="not_authorized">Not Authorized</option>
          <option value="exited_restricting_eu">Exited / Restricting EU</option>
          <option value="out_of_scope">Out of Scope</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 focus:outline-none"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-zinc-500">{filtered.length} firms</p>
        {stateFilter !== 'all' && (
          <button
            onClick={() => setStateFilter('all')}
            className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2.5 py-1 rounded-full hover:bg-zinc-700 transition-colors"
          >
            {stateFilter} ✕
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Firm</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Last Verified</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden lg:table-cell">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((firm, i) => {
              const status = firm.firm_statuses?.[0]
              return (
                <tr
                  key={firm.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-zinc-900/20'
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link href={`/firms/${firm.slug}`} className="hover:text-white transition-colors">
                      <p className="font-medium text-white">{firm.trading_name}</p>
                      {firm.trading_name !== firm.legal_name && (
                        <p className="text-xs text-zinc-500">{firm.legal_name}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 hidden md:table-cell">
                    {CATEGORY_LABELS[firm.category] ?? firm.category}
                  </td>
                  <td className="px-4 py-3">
                    {status ? (
                      <StatusBadge status={status.status} />
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 hidden lg:table-cell">
                    {status?.last_verified
                      ? new Date(status.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {status?.source_url ? (
                      <a
                        href={status.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 truncate max-w-[160px] inline-block"
                      >
                        {status.source_type.replace('_', ' ')}
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-zinc-500">No firms match your filters.</div>
        )}
      </div>
    </div>
  )
}
