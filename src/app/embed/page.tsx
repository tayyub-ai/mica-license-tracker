import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Embed the Widget',
  description: 'Embed the MiCA License Tracker countdown and authorization stat on your own site.',
}

const SNIPPET = `<div id="mica-tracker-widget"></div>
<script src="https://mica-tracker.eu/embed.js" async></script>`

export default function EmbedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="eyebrow mb-2">Open Data</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-3">Embed the Widget</h1>
      <p className="text-ink-soft mb-10 text-lg">
        Add a live MiCA authorization counter and countdown to the 1 July 2026 deadline on your own site, blog, or
        newsletter. Free to use, a link back is appreciated.
      </p>

      <div className="space-y-8">
        <section className="section-rule pt-5">
          <h2 className="font-display text-2xl font-semibold text-ink mb-4">Preview</h2>
          <div className="card-paper rounded-sm p-6 flex justify-center">
            <iframe src="/widget" title="MiCA Tracker widget preview" className="w-full max-w-[360px] h-[210px] border-0" />
          </div>
        </section>

        <section className="section-rule pt-5">
          <h2 className="font-display text-2xl font-semibold text-ink mb-3">Copy the snippet</h2>
          <p className="text-sm text-ink-soft mb-3">
            Paste this anywhere in your HTML. The widget loads in an isolated iframe and updates automatically.
          </p>
          <pre className="rounded-sm border border-rule-bold/30 bg-ink text-paper p-4 text-sm overflow-x-auto cd-cell">
            <code>{SNIPPET}</code>
          </pre>
        </section>

        <p className="text-sm text-ink-faint leading-relaxed border-t border-rule pt-6">
          The widget is read-only and pulls the same data as this site. It sets no tracking cookies.
        </p>
      </div>
    </div>
  )
}
