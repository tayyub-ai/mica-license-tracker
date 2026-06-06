import type { FirmStatus } from '@/types/database'
import { STATUS_LABELS } from '@/lib/constants/deadline'

const variants: Record<FirmStatus, string> = {
  authorized:             'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  application_pending:    'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  not_authorized:         'bg-red-500/15 text-red-400 border border-red-500/30',
  exited_restricting_eu:  'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
  out_of_scope:           'bg-blue-500/15 text-blue-400 border border-blue-500/30',
}

export function StatusBadge({ status }: { status: FirmStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
