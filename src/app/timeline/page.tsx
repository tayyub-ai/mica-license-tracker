import type { Metadata } from 'next'
import { TIMELINE } from '@/lib/constants/timeline'

export const metadata: Metadata = {
  title: 'Regulatory Timeline',
  description:
    'A sourced timeline of MiCA, the EU Markets in Crypto-Assets Regulation: from adoption in 2023 to the 1 July 2026 outer limit of the transitional period. Every event linked to its source.',
}

export const revalidate = 3600

export default function TimelinePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <header className="mb-12 md:mb-16">
        <p className="eyebrow mb-3">The road to MiCA</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-ink mb-4">Regulatory timeline</h1>
        <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">
          How the EU built a single rulebook for crypto, and how the window for unlicensed firms is closing. Each event
          below is dated and linked to its source, from the regulation’s adoption in 2023 to the outer limit of the
          transitional period on 1 July 2026.
        </p>
      </header>

      {/* Vertical rail timeline */}
      <ol className="relative border-l border-rule pl-6 sm:pl-8 space-y-10">
        {TIMELINE.map((event) => {
          const accent = event.milestone
          return (
            <li key={event.date} className="relative">
              {/* Date marker on the rail */}
              <span
                aria-hidden="true"
                className={[
                  'absolute -left-[1.625rem] sm:-left-[2.125rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-paper',
                  accent ? 'bg-gold' : event.future ? 'bg-ink-faint' : 'bg-rule-bold',
                ].join(' ')}
              />

              <div
                className={[
                  accent ? 'card-paper p-5 sm:p-6 -ml-1' : '',
                  !accent && event.future ? 'opacity-80' : '',
                ].join(' ')}
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span
                    className={[
                      'cd-cell text-xs uppercase tracking-wide',
                      accent ? 'text-gold' : 'text-ink-faint',
                    ].join(' ')}
                  >
                    {event.display}
                  </span>
                  {event.future && (
                    <span className="eyebrow text-[0.625rem] text-ink-faint border border-rule rounded-full px-2 py-0.5">
                      Upcoming
                    </span>
                  )}
                </div>

                <h2
                  className={[
                    'font-display font-medium leading-snug',
                    accent ? 'text-2xl text-gold' : 'text-xl text-ink',
                  ].join(' ')}
                >
                  {event.title}
                </h2>

                <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{event.description}</p>

                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press inline-block mt-3 text-sm text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold hover:text-gold-deep"
                  >
                    Source: {event.sourceLabel ?? 'Read more'}
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      <footer className="section-rule mt-14 pt-6 text-sm text-ink-faint leading-relaxed">
        <p>
          MiCA is Regulation (EU) 2023/1114. Article 143(3) let pre-existing firms continue under national regimes until
          1 July 2026, or until their authorisation was granted or refused, whichever came sooner. Member states could
          shorten this window but not lengthen it.
        </p>
      </footer>
    </div>
  )
}
