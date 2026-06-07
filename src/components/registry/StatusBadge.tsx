import type { FirmStatus } from '@/types/database'
import { STATUS_LABELS } from '@/lib/constants/deadline'

const dot: Record<FirmStatus, string> = {
  authorized: 'var(--forest)',
  application_pending: 'var(--ochre)',
  not_authorized: 'var(--oxblood)',
  exited_restricting_eu: 'var(--slate)',
  out_of_scope: 'var(--indigo)',
}

export function StatusBadge({ status }: { status: FirmStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-medium border bg-paper"
      style={{ borderColor: 'var(--rule)', color: 'var(--ink)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot[status] }} />
      {STATUS_LABELS[status]}
    </span>
  )
}
