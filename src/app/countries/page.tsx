import Link from 'next/link'
import { getAllCountries } from '@/lib/queries/countries'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Country Guides',
  description:
    'Per-country MiCA licensing status across the EU-27 and EEA: each jurisdiction’s transitional deadline, national regulator, and the firms licensed there, consolidated in one place.',
}

export const revalidate = 3600

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'None'

export default async function CountriesPage() {
  const countries = await getAllCountries()
  const hasEEA = countries.some((c) => c.notes?.includes('EEA'))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="section-rule pt-5 mb-9">
        <p className="eyebrow mb-1.5">By Jurisdiction</p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Country guides</h1>
        <p className="mt-3 text-ink-soft max-w-2xl leading-relaxed">
          MiCA is a single EU regulation, but each member state set its own transitional
          window and is supervised by its own national competent authority. These guides put
          every EU and EEA country’s transitional deadline, regulator, and licensed firms in
          one place, so you don’t have to reconcile 30 separate registers.
        </p>
      </div>

      {/* Table */}
      <div className="card-paper rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-rule-bold bg-paper-2">
              <th className="text-left px-4 py-3 eyebrow">Country</th>
              <th className="text-left px-4 py-3 eyebrow">Transitional deadline</th>
              <th className="text-right px-4 py-3 eyebrow">Licensed</th>
              <th className="text-right px-4 py-3 eyebrow hidden sm:table-cell">Tracked</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c, i) => {
              const isEEA = c.notes?.includes('EEA')
              return (
                <tr
                  key={c.code}
                  className={`border-b border-rule/60 hover:bg-paper-2 transition-colors ${i % 2 ? 'bg-paper-3/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/countries/${c.code.toLowerCase()}`}
                      className="group inline-flex items-center gap-2"
                    >
                      <span className="cd-cell text-ink-faint text-xs">{c.code}</span>
                      <span className="font-medium text-ink group-hover:text-oxblood transition-colors">
                        {c.name}
                      </span>
                      {isEEA && (
                        <span className="cd-cell text-[0.625rem] uppercase tracking-wider text-ink-faint border border-rule rounded px-1 py-0.5">
                          EEA
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 cd-cell text-ink-soft">
                    {fmtDate(c.transitional_end_date)}
                  </td>
                  <td className="px-4 py-3 text-right cd-cell text-ink">{c.licensedCount}</td>
                  <td className="px-4 py-3 text-right cd-cell text-ink-faint hidden sm:table-cell">
                    {c.trackedCount}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {countries.length === 0 && (
          <div className="py-16 text-center text-ink-faint">No countries available.</div>
        )}
      </div>

      {hasEEA && (
        <p className="mt-5 text-xs text-ink-faint leading-relaxed max-w-2xl">
          Rows marked <span className="cd-cell">EEA</span> are European Economic Area states
          (Norway, Iceland, Liechtenstein) outside the EU-27. MiCA applies to them through the
          EEA Agreement, on each country’s own implementation timeline.
        </p>
      )}

      <p className="mt-3 text-xs text-ink-faint leading-relaxed max-w-2xl">
        “Licensed” counts firms domiciled in that country with an authorization on the ESMA MiCA
        register. Transitional deadlines and regulators are detailed on each country page.{' '}
        <Link href="/methodology" className="text-oxblood hover:text-oxblood-deep underline underline-offset-2">
          Methodology
        </Link>
        .
      </p>
    </div>
  )
}
