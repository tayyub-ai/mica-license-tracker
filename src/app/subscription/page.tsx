import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subscription',
  robots: { index: false },
}

const MESSAGES: Record<string, { title: string; body: string; tone: string }> = {
  confirmed: {
    title: 'Subscription confirmed',
    body: "You're all set. You'll receive status-change alerts and weekly digests on EU MiCA authorizations.",
    tone: 'text-forest',
  },
  unsubscribed: {
    title: 'Unsubscribed',
    body: "You've been removed from all MiCA Tracker emails. You can resubscribe any time from the homepage.",
    tone: 'text-ink',
  },
  invalid: {
    title: 'Invalid or expired link',
    body: 'That confirmation link is no longer valid. Try subscribing again from the homepage.',
    tone: 'text-oxblood',
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
    <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
      <p className="eyebrow mb-4">Email Preferences</p>
      <h1 className={`font-display text-4xl font-semibold mb-4 ${msg.tone}`}>{msg.title}</h1>
      <p className="text-ink-soft leading-relaxed mb-8">{msg.body}</p>
      <Link
        href="/"
        className="inline-block px-6 py-2.5 rounded-sm bg-ink text-paper text-sm font-semibold hover:bg-oxblood transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  )
}
