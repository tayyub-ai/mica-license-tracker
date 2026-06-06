import { getAllFirms } from '@/lib/queries/firms'
import { FirmTable } from '@/components/registry/FirmTable'
import { EmailCapture } from '@/components/email/EmailCapture'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firm Registry',
  description: 'Search and filter all tracked crypto firms and their EU MiCA authorization status.',
}

export const revalidate = 3600

export default async function FirmsPage() {
  const firms = await getAllFirms()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Firm Registry</h1>
          <p className="text-zinc-400">
            {firms.length} named firms tracked. Every status sourced from ESMA or a national NCA register.
          </p>
        </div>
        <div className="max-w-sm w-full space-y-1">
          <p className="text-xs text-zinc-500">Get status-change alerts</p>
          <EmailCapture variant="compact" />
        </div>
      </div>

      <FirmTable firms={firms} />

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-sm text-zinc-500 leading-relaxed">
        <strong className="text-zinc-400">"Not authorized"</strong> means not found in any EU MiCA register as of the
        date shown — not an accusation of illegality.{' '}
        <a href="/methodology" className="underline underline-offset-2 hover:text-zinc-300">
          Read our methodology →
        </a>
      </div>
    </div>
  )
}
