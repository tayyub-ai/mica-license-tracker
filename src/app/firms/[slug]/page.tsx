import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFirmBySlug, getFirmStatusHistory } from '@/lib/queries/firms'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { CATEGORY_LABELS, CONFIDENCE_LABELS, SOURCE_TYPE_LABELS } from '@/lib/constants/deadline'
import type { Metadata } from 'next'
import type { FirmStatus } from '@/types/database'

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

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function FirmDetailPage({ params }: Props) {
  const { slug } = await params
  const firm = await getFirmBySlug(slug)
  if (!firm) notFound()
  const history = await getFirmStatusHistory(firm.id)
  const cur = firm.firm_statuses?.[0]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/firms" className="eyebrow hover:text-oxblood transition-colors inline-flex items-center gap-1.5 mb-8">
        ← Back to registry
      </Link>

      {/* Masthead */}
      <div className="section-rule pt-5 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <p className="eyebrow mb-2">{CATEGORY_LABELS[firm.category]}</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-none">{firm.trading_name}</h1>
          {firm.trading_name !== firm.legal_name && (
            <p className="text-ink-faint mt-2 cd-cell text-sm">{firm.legal_name}</p>
          )}
        </div>
        {cur && <StatusBadge status={cur.status} />}
      </div>

      <div className="mt-10 space-y-8">
        {/* Current status */}
        {cur && (
          <section className="card-paper rounded-sm p-6 space-y-5">
            <p className="eyebrow">Current Status</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
              <Field label="Status">
                <StatusBadge status={cur.status} />
              </Field>
              <Field label="Confidence">
                <span className="text-ink">{CONFIDENCE_LABELS[cur.confidence]}</span>
              </Field>
              <Field label="Last Verified">
                <span className="cd-cell text-ink">{fmt(cur.last_verified)}</span>
              </Field>
              <Field label="Source Type">
                <span className="text-ink">{SOURCE_TYPE_LABELS[cur.source_type]}</span>
              </Field>
            </div>
            <div>
              <p className="eyebrow mb-1.5">Source</p>
              <a
                href={cur.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-oxblood hover:text-oxblood-deep underline underline-offset-2 break-all"
              >
                {cur.source_url}
              </a>
            </div>
            {cur.status === 'not_authorized' && (
              <div className="border-t border-rule pt-4 space-y-1.5">
                <p className="text-xs text-ink-faint leading-relaxed">
                  "Not found in any EU MiCA register as of {fmt(cur.last_verified)}." This is evidence of absence, not an
                  accusation of illegality.{' '}
                  <Link href="/methodology" className="text-oxblood underline underline-offset-2">Methodology</Link>
                </p>
                <p className="text-xs text-ink-faint leading-relaxed">
                  Checked against: ESMA MiCA register (CASP and EMT/ART lists).
                </p>
              </div>
            )}
            {cur.out_of_scope_reason && (
              <p className="text-sm text-ink-soft">
                <span className="text-ink-faint">Out-of-scope rationale: </span>
                {cur.out_of_scope_reason}
              </p>
            )}
            {cur.notes && (
              <p className="text-sm text-ink-soft">
                <span className="text-ink-faint">Notes: </span>
                {cur.notes}
              </p>
            )}
          </section>
        )}

        {/* Firm details */}
        <section className="card-paper rounded-sm p-6">
          <p className="eyebrow mb-4">Firm Details</p>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            {firm.lei && (
              <>
                <dt className="text-ink-faint">LEI</dt>
                <dd className="cd-cell text-ink">{firm.lei}</dd>
              </>
            )}
            {firm.national_registration_number && (
              <>
                <dt className="text-ink-faint">National Reg. No.</dt>
                <dd className="cd-cell text-ink">{firm.national_registration_number}</dd>
              </>
            )}
            {firm.home_state_code && (
              <>
                <dt className="text-ink-faint">Home State</dt>
                <dd className="text-ink">{firm.member_states?.name ?? firm.home_state_code}</dd>
              </>
            )}
            {firm.website_url && safeHostname(firm.website_url) && (
              <>
                <dt className="text-ink-faint">Website</dt>
                <dd>
                  <a href={firm.website_url} target="_blank" rel="noopener noreferrer" className="text-oxblood hover:text-oxblood-deep underline underline-offset-2">
                    {safeHostname(firm.website_url)}
                  </a>
                </dd>
              </>
            )}
          </dl>
        </section>

        {/* History */}
        {history.length > 0 && (
          <section>
            <p className="eyebrow section-rule pt-4 mb-4">Status History</p>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="card-paper rounded-sm px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    {h.old_status && <StatusBadge status={h.old_status as FirmStatus} />}
                    {h.old_status && <span className="text-ink-faint">→</span>}
                    <StatusBadge status={h.new_status as FirmStatus} />
                  </div>
                  <div className="flex items-center gap-3 text-ink-faint">
                    <span className="cd-cell">{new Date(h.changed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    <a href={h.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-oxblood underline underline-offset-2">
                      source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      {children}
    </div>
  )
}
