import { getAllFirms } from '@/lib/queries/firms'
import { FirmTable } from '@/components/registry/FirmTable'
import { EmailCapture } from '@/components/email/EmailCapture'
import { JsonLd } from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants/site'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firm Registry',
  description: 'Search and filter all tracked crypto firms and their EU MiCA authorization status.',
}

export const revalidate = 3600

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>
}) {
  const { state } = await searchParams
  const firms = await getAllFirms()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: 'EU MiCA Crypto Authorization Tracker',
          description:
            'A curated registry of crypto firms and their MiCA authorization status in the EU, sourced from the ESMA interim register and national competent authorities.',
          url: `${SITE_URL}/firms`,
          creator: { '@type': 'Organization', name: 'MiCA License Tracker' },
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          keywords: ['MiCA', 'crypto regulation', 'CASP', 'ESMA', 'EU', 'authorization'],
          distribution: [
            { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `${SITE_URL}/api/firms` },
            { '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `${SITE_URL}/api/export` },
          ],
          numberOfItems: firms.length,
        }}
      />

      <div className="section-rule pt-5 mb-9 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-1.5">The Register</p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink">Firm Registry</h1>
          <p className="mt-3 text-ink-soft max-w-xl">
            <span className="cd-cell text-ink">{firms.length}</span> named firms tracked. Every status sourced from
            ESMA or a national authority register.
          </p>
        </div>
        <div className="max-w-sm w-full">
          <p className="eyebrow mb-2">Status-change alerts</p>
          <EmailCapture variant="compact" />
        </div>
      </div>

      <FirmTable firms={firms} initialState={state} />

      <div className="mt-8 card-paper rounded-sm p-5 text-sm text-ink-soft leading-relaxed">
        <strong className="text-ink">"Not authorized"</strong> means not found in any EU MiCA register as of the date
        shown, not an accusation of illegality.{' '}
        <a href="/methodology" className="text-oxblood hover:text-oxblood-deep underline underline-offset-2">
          Read our methodology →
        </a>
      </div>
    </div>
  )
}
