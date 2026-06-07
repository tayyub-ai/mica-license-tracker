import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How MiCA Tracker sources and verifies authorization data. Sources, update cadence, dispute process.',
}

const FAQ = [
  {
    q: 'What does "Authorized" mean on this tracker?',
    a: 'It means the firm holds a MiCA CASP authorization (or ART/EMT issuer authorization), confirmed via the ESMA interim MiCA register or a named national NCA register, with a direct source link.',
  },
  {
    q: 'Does "Not authorized" mean a firm is operating illegally?',
    a: 'No. "Not authorized" means "not found in any EU MiCA register as of the verification date." It is evidence of absence, not an accusation of illegality. A firm may be out of scope, in a jurisdiction that has not published its register, or not yet have applied.',
  },
  {
    q: 'What is the 1 July 2026 deadline?',
    a: 'Under MiCA Article 143(3), firms operating under prior national regimes may continue during a transitional window that ends no later than 1 July 2026 EU-wide, or when their authorization is granted or refused, whichever is sooner. Member states could shorten this window and many did.',
  },
  {
    q: 'How often is the data updated?',
    a: 'The ESMA register is checked weekly via an automated diff that surfaces changes for human verification before publishing. National NCA registers are checked monthly. Firms can submit corrections at any time.',
  },
  {
    q: 'How can a firm dispute its status?',
    a: 'Named firms can email corrections@mica-tracker.eu with their legal entity name, LEI or national registration number, the status in question, and a link to the relevant register entry. We aim to review within 5 business days.',
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section-rule pt-5">
      <h2 className="font-display text-2xl font-semibold text-ink mb-4">{title}</h2>
      {children}
    </section>
  )
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />

      <p className="eyebrow mb-2">Editorial Standards</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-3">Methodology</h1>
      <p className="text-ink-soft mb-12 text-lg">How we source, verify, and maintain this data.</p>

      <div className="space-y-10 text-ink-soft leading-relaxed">
        <Section title="What we track">
          <p>
            We maintain a curated watchlist of named crypto firms that operate in, or target, the EU market, major
            exchanges, custodians, stablecoin/EMT/ART issuers, brokers, wallet providers, and other in-scope services.
          </p>
          <p className="mt-3">
            Absence from our watchlist does <strong className="text-ink">not</strong> mean a firm is authorized. And
            absence from EU registers does not mean a firm is operating illegally, there are legitimate reasons a firm
            may not require MiCA authorization.
          </p>
        </Section>

        <Section title="Status definitions">
          <dl className="space-y-4">
            {[
              ['Licensed', 'The firm holds a MiCA licence (a CASP authorisation, or an issuer authorisation for stablecoins). Confirmed on the official European register or a national authority, with a direct link you can open.'],
              ['Application Pending', 'The firm has applied, or a regulator has confirmed an application is under way. We mark this as lower certainty than a confirmed licence.'],
              ['Not Licensed', 'Not found on any EU MiCA register as of the date shown. This tells you the firm is not listed yet. It is not a claim that the firm is breaking the law.'],
              ['Exited or Restricting', 'The firm has announced it is leaving, blocked EU users, or pulled back its EU service. We link to the announcement or the evidence.'],
              ['Out of Scope', "The firm's activity does not require a MiCA CASP authorization, e.g. a DeFi protocol with no identifiable issuer. A one-sentence rationale is provided."],
            ].map(([term, def]) => (
              <div key={term} className="grid sm:grid-cols-[180px_1fr] gap-1 sm:gap-4">
                <dt className="font-medium text-ink">{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Primary sources">
          <ul className="space-y-3">
            <li><strong className="text-ink">ESMA interim MiCA register</strong>, five weekly-updated CSV files (CASPS, ARTZZ, EMTWP, OTHER, NCASP). The authoritative source for EU-wide CASP authorizations.</li>
            <li><strong className="text-ink">National NCA registers</strong>, BaFin (DE), AFM (NL), AMF/GECO (FR), CBI (IE), MFSA (MT), CySEC (CY), CSSF (LU), CNMV (ES), Bank of Italy/CONSOB (IT), and others.</li>
            <li><strong className="text-ink">ESMA Article 93 list</strong>, maps each EU/EEA member state to its supervising NCA.</li>
            <li><strong className="text-ink">Firm announcements &amp; geoblock evidence</strong>, for "Exited / Restricting EU" status. Requires a direct URL.</li>
          </ul>
        </Section>

        <Section title="Update cadence">
          <ul className="space-y-2">
            <li>ESMA register: checked weekly (automated diff, human verification before publishing).</li>
            <li>NCA registers: checked monthly.</li>
            <li>Firm announcements: monitored on an ongoing basis.</li>
          </ul>
          <p className="mt-3">
            Every status row carries a <code className="cd-cell text-ink bg-paper-3 px-1.5 py-0.5 rounded-sm text-xs">last_verified</code> date.
            Rows older than 30 days are flagged for review.
          </p>
        </Section>

        <Section title="Accuracy standard">
          <p>
            Every status carries a <strong className="text-ink">source URL</strong>, <strong className="text-ink">source type</strong>,
            <strong className="text-ink"> last-verified date</strong>, and a <strong className="text-ink">confidence level</strong>.
            We never assert illegality, only register presence or absence. Firms are identified by legal entity name plus
            LEI or national registration number (not trading name alone) to prevent clone-firm confusion.
          </p>
        </Section>

        <Section title="Dispute &amp; correction">
          <p>
            Named firms that believe their status is incorrect can email{' '}
            <a href="mailto:corrections@mica-tracker.eu" className="text-oxblood hover:text-oxblood-deep underline underline-offset-2">corrections@mica-tracker.eu</a>. Include:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-3">
            <li>Your legal entity name and LEI or national registration number</li>
            <li>The status you believe is incorrect</li>
            <li>A link to the relevant register entry or official document</li>
          </ul>
          <p className="mt-3">
            We aim to review all corrections within <strong className="text-ink">5 business days</strong>. All changes are
            recorded in the public changelog with the correction source.
          </p>
        </Section>

        <p className="text-xs text-ink-faint leading-relaxed border-t border-rule pt-8">
          This tracker is an independent information resource, not affiliated with ESMA, any NCA, or any listed firm.
          Nothing here constitutes legal advice. Firms should consult qualified counsel on their MiCA obligations.
        </p>
      </div>
    </div>
  )
}
