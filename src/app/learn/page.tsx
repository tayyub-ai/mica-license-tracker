import type { Metadata } from 'next'
import Link from 'next/link'
import { JsonLd } from '@/components/seo/JsonLd'
import { GLOSSARY } from '@/lib/constants/glossary'

export const metadata: Metadata = {
  title: 'Explainers & Glossary',
  description:
    'MiCA, explained in plain language. What the EU Markets in Crypto-Assets Regulation is, who needs a licence, what changes on 1 July 2026, and a glossary of the key terms.',
}

export const revalidate = 3600

const EXPLAINERS: { q: string; a: string; render?: React.ReactNode }[] = [
  {
    q: 'What is MiCA?',
    a: "MiCA is the EU's Markets in Crypto-Assets Regulation, formally Regulation (EU) 2023/1114. It creates a single rulebook for crypto across the EU and the wider EEA, replacing the older patchwork of national rules. It covers both the firms that provide crypto services and the companies that issue tokens such as stablecoins.",
  },
  {
    q: 'Who needs a licence?',
    a: 'Firms that provide crypto-asset services to people in the EU, known as crypto-asset service providers or CASPs, need a MiCA authorisation. That includes exchanges, custodians, and brokers. Issuers of stablecoins, the asset-referenced tokens and e-money tokens, also need authorisation. Once a firm is authorised in one country it can passport its services across the EU and EEA.',
  },
  {
    q: 'What changes on 1 July 2026?',
    a: '1 July 2026 is the EU-wide outer limit of the transitional period set by Article 143(3). It is the latest date any member state could let pre-existing firms keep operating under old national rules without a MiCA licence. After this date a firm must hold a MiCA authorisation to provide crypto-asset services in the EU. Many countries set shorter deadlines, so some firms had to be authorised well before then.',
  },
  {
    q: "What does 'Not licensed' mean here?",
    a: "On this tracker, 'Not licensed' means a firm was not found on any EU MiCA register as of the date shown. It is a statement about the public register, not an accusation that the firm is breaking the law. A firm may be out of scope, based in a country that has not published its register, or still waiting on a decision.",
    render: (
      <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">
        On this tracker, &lsquo;Not licensed&rsquo; means a firm was not found on any EU MiCA register as of the date
        shown. It is a statement about the public register, not an accusation that the firm is breaking the law. A firm
        may be out of scope, based in a country that has not published its register, or still waiting on a decision. See
        our{' '}
        <Link
          href="/methodology"
          className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold hover:text-gold-deep"
        >
          methodology
        </Link>{' '}
        for the full status definitions.
      </p>
    ),
  },
]

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: EXPLAINERS.map((e) => ({
            '@type': 'Question',
            name: e.q,
            acceptedAnswer: { '@type': 'Answer', text: e.a },
          })),
        }}
      />

      <header className="mb-12 md:mb-16">
        <p className="eyebrow mb-3">Understand the rules</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink mb-4">MiCA, explained</h1>
        <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">
          A plain-language guide to the EU rules for crypto. What MiCA is, who needs a licence, and what the
          1 July 2026 deadline means. For the dated sequence of events, see the{' '}
          <Link
            href="/timeline"
            className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold hover:text-gold-deep"
          >
            regulatory timeline
          </Link>
          .
        </p>
      </header>

      {/* Explainers */}
      <section className="space-y-10">
        {EXPLAINERS.map((e) => (
          <article key={e.q} className="section-rule pt-6 first:border-t-0 first:pt-0">
            <h2 className="font-display text-2xl font-medium text-ink">{e.q}</h2>
            {e.render ?? <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{e.a}</p>}
          </article>
        ))}
      </section>

      <p className="mt-10 text-[15px] leading-relaxed text-ink-soft">
        Want to see where each country stands?{' '}
        <Link
          href="/countries"
          className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold hover:text-gold-deep"
        >
          Browse firms by country
        </Link>
        .
      </p>

      {/* Glossary */}
      <section className="mt-16">
        <div className="section-rule pt-6 mb-8">
          <p className="eyebrow mb-2">Reference</p>
          <h2 className="font-display text-3xl font-semibold text-ink">Glossary</h2>
        </div>

        <dl className="space-y-8">
          {GLOSSARY.map((entry) => (
            <div key={entry.term} className="grid sm:grid-cols-[12rem_1fr] gap-1 sm:gap-6">
              <dt className="font-display text-lg font-medium text-ink leading-snug">{entry.term}</dt>
              <dd className="text-[15px] leading-relaxed text-ink-soft">{entry.body}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
