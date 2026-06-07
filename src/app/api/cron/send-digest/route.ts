import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail, digestEmail } from '@/lib/email/resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = adminClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Recent changelog entries.
  const { data: changes } = await sb
    .from('changelog_entries')
    .select('old_status, new_status, firms(slug, trading_name)')
    .gte('published_at', weekAgo)
    .order('published_at', { ascending: false })

  if (!changes || changes.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, reason: 'no changes this week' })
  }

  const formatted = changes.map((c) => {
    const firmsField = (c as { firms?: { slug: string; trading_name: string } | { slug: string; trading_name: string }[] }).firms
    const firm = Array.isArray(firmsField) ? firmsField[0] : firmsField
    return {
      trading_name: firm?.trading_name ?? 'A firm',
      slug: firm?.slug ?? '',
      old_status: c.old_status,
      new_status: c.new_status,
    }
  })

  // Confirmed, not-unsubscribed subscribers.
  const { data: subs } = await sb
    .from('email_subscribers')
    .select('email, confirmation_token')
    .eq('confirmed', true)
    .is('unsubscribed_at', null)

  let sent = 0
  for (const s of subs ?? []) {
    const mail = digestEmail(formatted, s.confirmation_token ?? '')
    const res = await sendEmail({ to: s.email, subject: mail.subject, html: mail.html })
    if (res.ok) sent++
  }

  return NextResponse.json({ ok: true, sent, changes: formatted.length, subscribers: subs?.length ?? 0 })
}
