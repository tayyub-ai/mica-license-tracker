import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFirmBySlug, getFirmStatusHistory } from '@/lib/queries/firms'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { CATEGORY_LABELS, CONFIDENCE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/constants/deadline'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const firm = await getFirmBySlug(slug)
  if (!firm) return {}
  return {
    title: firm.trading_name,
    description: `MiCA authorization status for ${firm.trading_name} (${firm.legal_name}). Sourced from ESMA and national NCA registers.`,
  }
}

export const revalidate = 3600

export default async function FirmDetailPage({ params }: Props) {
  const { slug } = await params
  const [firm, history] = await Promise.all([
    getFirmBySlug(slug),
    getFirmBySlug(slug).then((f) => (f ? getFirmStatusHistory(f.id) : [])),
  ])

  if (!firm) notFound()

  const currentStatus = firm.firm_statuses?.[0]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/firms" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-flex items-center gap-1">
        ← Back to registry
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{firm.trading_name}</h1>
            {firm.trading_name !== firm.legal_name && (
              <p className="text-zinc-500 mt-1">Legal name: {firm.legal_name}</p>
            )}
            <p className="text-sm text-zinc-500 mt-1">{CATEGORY_LABELS[firm.category]}</p>
          </div>
          {currentStatus && <StatusBadge status={currentStatus.status} />}
        </div>

        {/* Current status card */}
        {currentStatus && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
            <h2 className="font-semibold text-white">Current Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-zinc-500 mb-1">Status</p>
                <StatusBadge status={currentStatus.status} />
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Confidence</p>
                <p className="text-white">{CONFIDENCE_LABELS[currentStatus.confidence]}</p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Last Verified</p>
                <p className="text-white">
                  {new Date(currentStatus.last_verified).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-zinc-500 mb-1">Source Type</p>
                <p className="text-white">{SOURCE_TYPE_LABELS[currentStatus.source_type]}</p>
              </div>
            </div>
            <div>
              <p className="text-zinc-500 text-sm mb-1">Source</p>
              <a
                href={currentStatus.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-300 underline underline-offset-2 hover:text-white break-all"
              >
                {currentStatus.source_url}
              </a>
            </div>
            {currentStatus.status === 'not_authorized' && (
              <p className="text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                "Not found in any EU MiCA register as of {new Date(currentStatus.last_verified).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}."
                This is evidence of absence, not an accusation of illegality.{' '}
                <Link href="/methodology" className="underline underline-offset-2 hover:text-zinc-300">Methodology</Link>
              </p>
            )}
            {currentStatus.out_of_scope_reason && (
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-500">Out-of-scope rationale: </span>
                {currentStatus.out_of_scope_reason}
              </p>
            )}
            {currentStatus.notes && (
              <p className="text-sm text-zinc-400">
                <span className="text-zinc-500">Notes: </span>
                {currentStatus.notes}
              </p>
            )}
          </div>
        )}

        {/* Firm details */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-3">
          <h2 className="font-semibold text-white">Firm Details</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {firm.lei && (
              <>
                <dt className="text-zinc-500">LEI</dt>
                <dd className="text-white font-mono">{firm.lei}</dd>
              </>
            )}
            {firm.national_registration_number && (
              <>
                <dt className="text-zinc-500">National Reg. No.</dt>
                <dd className="text-white font-mono">{firm.national_registration_number}</dd>
              </>
            )}
            {firm.home_state_code && (
              <>
                <dt className="text-zinc-500">Home State</dt>
                <dd className="text-white">{firm.member_states?.name ?? firm.home_state_code}</dd>
              </>
            )}
            {firm.website_url && safeHostname(firm.website_url) && (
              <>
                <dt className="text-zinc-500">Website</dt>
                <dd>
                  <a href={firm.website_url} target="_blank" rel="noopener noreferrer"
                    className="text-zinc-300 underline underline-offset-2 hover:text-white">
                    {safeHostname(firm.website_url)}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>

        {/* Status history */}
        {history.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-white">Status History</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    {h.old_status && (
                      <StatusBadge status={h.old_status as any} />
                    )}
                    {h.old_status && <span className="text-zinc-600">→</span>}
                    <StatusBadge status={h.new_status as any} />
                  </div>
                  <div className="flex items-center gap-3 text-zinc-500">
                    <span>{new Date(h.changed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <a href={h.source_url} target="_blank" rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-zinc-300 text-xs">
                      source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
