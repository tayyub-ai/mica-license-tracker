import type { FirmStatus } from '@/types/database'

const LABELS: Record<FirmStatus, string> = {
  authorized: 'Licensed',
  application_pending: 'Application Pending',
  not_authorized: 'Not Licensed',
  exited_restricting_eu: 'Exited or Restricting',
  out_of_scope: 'Out of Scope',
}

const dot: Record<FirmStatus, string> = {
  authorized: 'var(--forest)',
  application_pending: 'var(--ochre)',
  not_authorized: 'var(--coral)',
  exited_restricting_eu: 'var(--slate)',
  out_of_scope: 'var(--indigo)',
}

export function StatusBadge({ status }: { status: FirmStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{
        borderColor: `color-mix(in srgb, ${dot[status]} 35%, var(--rule))`,
        color: 'var(--ink)',
        background: `color-mix(in srgb, ${dot[status]} 8%, transparent)`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot[status] }} />
      {LABELS[status]}
    </span>
  )
}
