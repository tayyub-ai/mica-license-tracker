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
      <h1 className="text-3xl font-bold text-white mb-2">Embed the Widget</h1>
      <p className="text-zinc-400 mb-10">
        Add a live MiCA authorization counter and countdown to the 1 July 2026 deadline on your own
        site, blog, or newsletter. Free to use — a link back is appreciated.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Preview</h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/30 p-4">
            <iframe
              src="/widget"
              title="MiCA Tracker widget preview"
              className="w-full max-w-[360px] h-[210px] border-0 mx-auto block"
            />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-3">Copy the snippet</h2>
          <p className="text-sm text-zinc-500 mb-3">
            Paste this anywhere in your HTML. The widget loads in an isolated iframe and updates automatically.
          </p>
          <pre className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 overflow-x-auto">
            <code>{SNIPPET}</code>
          </pre>
        </section>

        <section className="text-sm text-zinc-500 leading-relaxed border-t border-zinc-800 pt-6">
          The widget is read-only and pulls the same data as this site (authorized count, total tracked
          firms, and the live countdown). It respects the visitor's network only — no tracking cookies are set.
        </section>
      </div>
    </div>
  )
}
