import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCountry } from '@/lib/queries/countries'
import { StatusBadge } from '@/components/registry/StatusBadge'
import { CATEGORY_LABELS } from '@/lib/constants/deadline'
import type { Metadata } from 'next'

const COUNTRY_CODES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'NO', 'IS', 'LI',
]

const ESMA_REGISTER =
  'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica'

interface Props {
  params: Promise<{ code: string }>
}

export function generateStaticParams() {
  return COUNTRY_CODES.map((code) => ({ code: code.toLowerCase() }))
}

export const revalidate = 3600

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  const country = await getCountry(code)
  if (!country) return {}
  return {
    title: `${country.state.name} — MiCA licensing`,
    description: `MiCA transitional deadline, national regulator, and licensed crypto firms in ${country.state.name}. Sourced from the ESMA register and national competent authorities.`,
  }
}

export default async function CountryDetailPage({ params }: Props) {
  const { code } = await params
  const country = await getCountry(code)
  if (!country) notFound()

  const { state, nca, firms } = country
  const isEEA = state.notes?.includes('EEA') ?? false
  const hasTransitional = state.transitional_months != null && state.transitional_months > 0
  const licensedCount = firms.filter((f) => f.status === 'authorized').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/countries"
        className="eyebrow hover:text-oxblood transition-colors inline-flex items-center gap-1.5 mb-8"
      >
        ← All country guides
      </Link>

      {/* Masthead */}
      <div className="section-rule pt-5">
        <p className="eyebrow mb-2">
          {state.code} · {isEEA ? 'EEA' : 'EU'}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink leading-none">
          {state.name}
        </h1>
      </div>

      <div className="mt-10 space-y-8">
        {/* Transitional period */}
        <section className="card-paper rounded-xl p-6 space-y-5">
          <p className="eyebrow">Transitional period</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 text-sm">
            <Field label="Window length">
              <span className="text-ink">
                {hasTransitional ? `${state.transitional_months} months` : 'No transitional period'}
              </span>
            </Field>
            <Field label="National deadline">
              <span className="cd-cell text-ink">{fmt(state.transitional_end_date) ?? 'None'}</span>
            </Field>
            {fmt(state.application_deadline) && (
              <Field label="Application deadline">
                <span className="cd-cell text-ink">{fmt(state.application_deadline)}</span>
              </Field>
            )}
          </div>

          {state.notes && (
            <div className="border-t border-rule pt-4">
              <p className="eyebrow mb-1.5">Notes</p>
              <p className="text-sm text-ink-soft leading-relaxed">{state.notes}</p>
            </div>
          )}

          <p className="text-xs text-ink-faint leading-relaxed border-t border-rule pt-4">
            1 July 2026 is the EU-wide outer limit under MiCA Article 143(3). This country’s own
            transitional limit is shown above; firms must hold (or have applied for) authorization
            by that date to keep operating here.
          </p>
        </section>

        {/* Regulator */}
        <section className="card-paper rounded-xl p-6 space-y-4">
          <p className="eyebrow">Regulator</p>
          {nca ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-ink font-medium">{nca.name}</p>
                {nca.abbreviation && <p className="cd-cell text-ink-faint mt-0.5">{nca.abbreviation}</p>}
              </div>
              {nca.notes && <p className="text-ink-soft leading-relaxed">{nca.notes}</p>}
              {nca.register_url && (
                <a
                  href={nca.register_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-oxblood hover:text-oxblood-deep underline underline-offset-2 break-all"
                >
                  Official register →
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-soft">National authority details to be added.</p>
          )}
        </section>

        {/* Licensed firms domiciled here */}
        <section className="card-paper rounded-xl overflow-hidden">
          <div className="p-6 pb-4">
            <p className="eyebrow">Firms domiciled here</p>
            <p className="mt-2 text-sm text-ink-soft">
              <span className="cd-cell text-ink">{firms.length}</span> tracked,{' '}
              <span className="cd-cell text-forest">{licensedCount}</span> licensed.
            </p>
          </div>

          {firms.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-rule bg-paper-2">
                  <th className="text-left px-6 py-3 eyebrow">Firm</th>
                  <th className="text-left px-6 py-3 eyebrow hidden sm:table-cell">Category</th>
                  <th className="text-left px-6 py-3 eyebrow">Status</th>
                </tr>
              </thead>
              <tbody>
                {firms.slice(0, 50).map((firm, i) => (
                  <tr
                    key={firm.slug}
                    className={`border-b border-rule/60 last:border-0 hover:bg-paper-2 transition-colors ${i % 2 ? 'bg-paper-3/30' : ''}`}
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/firms/${firm.slug}`}
                        className="font-medium text-ink hover:text-oxblood transition-colors"
                      >
                        {firm.trading_name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-ink-soft hidden sm:table-cell">
                      {CATEGORY_LABELS[firm.category] ?? firm.category}
                    </td>
                    <td className="px-6 py-3">
                      {firm.status ? (
                        <StatusBadge status={firm.status} />
                      ) : (
                        <span className="text-ink-faint">·</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 pb-6 text-sm text-ink-faint">
              No firms domiciled in {state.name} are tracked yet.
            </div>
          )}

          {firms.length > 50 && (
            <div className="px-6 py-4 border-t border-rule">
              <Link
                href={`/firms?state=${state.code}`}
                className="text-sm text-oxblood hover:text-oxblood-deep underline underline-offset-2"
              >
                View all {firms.length} firms in the registry →
              </Link>
            </div>
          )}
        </section>

        {/* Sources */}
        <div className="section-rule pt-5 text-xs text-ink-faint leading-relaxed space-y-2">
          <p>
            <span className="text-ink-soft">Sources.</span> Authorization data is drawn from the{' '}
            <a
              href={ESMA_REGISTER}
              target="_blank"
              rel="noopener noreferrer"
              className="text-oxblood hover:text-oxblood-deep underline underline-offset-2"
            >
              official ESMA MiCA register
            </a>
            {nca?.register_url && (
              <>
                {' '}and the{' '}
                <a
                  href={nca.register_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-oxblood hover:text-oxblood-deep underline underline-offset-2"
                >
                  {nca.abbreviation || nca.name} register
                </a>
              </>
            )}
            . Each entry is verified per our{' '}
            <Link href="/methodology" className="text-oxblood hover:text-oxblood-deep underline underline-offset-2">
              methodology
            </Link>
            .
          </p>
          <p>
            Suggested citation: “MiCA License Tracker, {state.name} country guide,” accessed{' '}
            {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="eyebrow">{label}</p>
      {children}
    </div>
  )
}
