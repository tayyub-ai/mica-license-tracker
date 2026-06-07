import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription',
  robots: { index: false },
}

const MESSAGES: Record<string, { title: string; body: string; tone: string }> = {
  confirmed: {
    title: 'Subscription confirmed ✓',
    body: "You're all set. You'll receive status-change alerts and weekly digests on EU MiCA authorizations.",
    tone: 'text-emerald-400',
  },
  unsubscribed: {
    title: 'Unsubscribed',
    body: "You've been removed from all MiCA Tracker emails. You can resubscribe any time from the homepage.",
    tone: 'text-zinc-300',
  },
  invalid: {
    title: 'Invalid or expired link',
    body: 'That confirmation link is no longer valid. Try subscribing again from the homepage.',
    tone: 'text-amber-400',
  },
}

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const msg = MESSAGES[status ?? 'invalid'] ?? MESSAGES.invalid

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <h1 className={`text-3xl font-bold mb-4 ${msg.tone}`}>{msg.title}</h1>
      <p className="text-zinc-400 leading-relaxed mb-8">{msg.body}</p>
      <Link
        href="/"
        className="inline-block px-6 py-2.5 rounded-lg bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  )
}
