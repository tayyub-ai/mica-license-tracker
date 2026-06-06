import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Methodology',
  description: 'How MiCA Tracker sources and verifies authorization data. Sources, update cadence, dispute process.',
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Methodology</h1>
      <p className="text-zinc-400 mb-12">How we source, verify, and maintain this data.</p>

      <div className="prose prose-invert prose-zinc max-w-none space-y-10">

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">What we track</h2>
          <p className="text-zinc-400 leading-relaxed">
            We maintain a curated watchlist of named crypto firms that operate in, or
            target, the EU market. The watchlist covers major exchanges, custodians,
            stablecoin/EMT/ART issuers, brokers, wallet providers, and other in-scope services.
            Our target is ≥150 named firms at launch, growing over time.
          </p>
          <p className="text-zinc-400 leading-relaxed mt-3">
            Absence from our watchlist does <strong className="text-zinc-200">not</strong> mean
            a firm is authorized. And absence from EU registers does not mean a firm is operating
            illegally — there are legitimate reasons a firm may not require MiCA authorization.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Status definitions</h2>
          <dl className="space-y-4">
            {[
              ['Authorized', 'The firm holds a MiCA CASP authorization (or ART/EMT issuer authorization). Confirmed via the ESMA interim MiCA register or a named NCA register — a direct link is always provided.'],
              ['Application Pending', 'The firm has applied, or a regulator has confirmed an application is in process. Confidence level is "reported" — lower certainty than register-confirmed.'],
              ['Not Authorized', '"Not found in any EU MiCA register as of [date]." This is evidence of absence — not an accusation of illegality. A firm may be out of scope, in a jurisdiction that has not yet published its register, or simply not have applied yet.'],
              ['Exited / Restricting EU', 'The firm has announced a withdrawal, geoblocked EU users, or materially restricted EU service. Requires a firm announcement URL or documented geoblock evidence.'],
              ['Out of Scope', 'The firm\'s activity does not require a MiCA CASP authorization — e.g., a DeFi protocol with no identifiable issuer. A one-sentence rationale is provided.'],
            ].map(([term, def]) => (
              <div key={term}>
                <dt className="font-medium text-white">{term}</dt>
                <dd className="text-zinc-400 leading-relaxed mt-1">{def}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Primary sources</h2>
          <ul className="space-y-3 text-zinc-400">
            <li>
              <strong className="text-zinc-200">ESMA interim MiCA register</strong> — five weekly-updated
              CSV files (CASPS.csv, ARTZZ.csv, EMTWP.csv, OTHER.csv, NCASP.csv) published at esma.europa.eu.
              This is the authoritative source for EU-wide CASP authorizations.
            </li>
            <li>
              <strong className="text-zinc-200">National NCA registers</strong> — BaFin (DE), AFM (NL),
              AMF/GECO (FR), CBI (IE), MFSA (MT), CySEC (CY), CSSF (LU), CNMV (ES), Bank of Italy/CONSOB (IT),
              and others as needed.
            </li>
            <li>
              <strong className="text-zinc-200">ESMA Article 93 competent-authorities list</strong> — maps
              each EU/EEA member state to its supervising NCA.
            </li>
            <li>
              <strong className="text-zinc-200">Firm announcements and geoblock evidence</strong> — for
              "Exited / Restricting EU" status. Requires a direct URL.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Update cadence</h2>
          <ul className="space-y-2 text-zinc-400">
            <li>ESMA register: checked weekly (automated diff, human verification before publishing).</li>
            <li>NCA registers: checked monthly.</li>
            <li>Firm announcements: monitored on an ongoing basis.</li>
          </ul>
          <p className="text-zinc-400 mt-3">
            Every status row carries a <code className="text-zinc-300 bg-zinc-800 px-1 rounded text-xs">last_verified</code> date.
            Rows older than 30 days are flagged for review.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Accuracy standard</h2>
          <p className="text-zinc-400 leading-relaxed">
            Every status carries a <strong className="text-zinc-200">source URL</strong>,{' '}
            <strong className="text-zinc-200">source type</strong>,{' '}
            <strong className="text-zinc-200">last-verified date</strong>, and a{' '}
            <strong className="text-zinc-200">confidence level</strong> (high / medium / reported).
            We never assert illegality — only register presence or absence.
          </p>
          <p className="text-zinc-400 leading-relaxed mt-3">
            Legal entity disambiguation: each firm is identified by its legal entity name plus LEI or
            national registration number (not trading name alone) to prevent clone-firm confusion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Dispute and correction</h2>
          <p className="text-zinc-400 leading-relaxed">
            Named firms that believe their status is incorrect can submit a correction request to{' '}
            <a href="mailto:corrections@mica-tracker.eu" className="text-zinc-200 underline underline-offset-2 hover:text-white">
              corrections@mica-tracker.eu
            </a>. Include:
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 mt-3">
            <li>Your legal entity name and LEI or national registration number</li>
            <li>The status you believe is incorrect</li>
            <li>A link to the relevant register entry or official document</li>
          </ul>
          <p className="text-zinc-400 mt-3">
            We aim to review all correction requests within <strong className="text-zinc-200">5 business days</strong>.
            All changes are recorded in the public changelog with the correction source.
          </p>
        </section>

        <section className="border-t border-zinc-800 pt-8">
          <p className="text-xs text-zinc-600 leading-relaxed">
            This tracker is an independent information resource. It is not affiliated with ESMA, any NCA,
            or any of the firms listed. Nothing on this site constitutes legal advice. Firms and
            individuals should consult qualified counsel on their MiCA compliance obligations.
          </p>
        </section>
      </div>
    </div>
  )
}
