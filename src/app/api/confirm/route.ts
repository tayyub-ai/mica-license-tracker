import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { sendEmail, welcomeEmail } from '@/lib/email/resend'

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const base = new URL(req.url).origin

  if (!token) {
    return NextResponse.redirect(`${base}/subscription?status=invalid`)
  }

  const supabase = createServiceClient()
  const { data: sub, error } = await supabase
    .from('email_subscribers')
    .select('id, email, confirmed')
    .eq('confirmation_token', token)
    .single()

  if (error || !sub) {
    return NextResponse.redirect(`${base}/subscription?status=invalid`)
  }

  if (!sub.confirmed) {
    await supabase
      .from('email_subscribers')
      .update({ confirmed: true })
      .eq('id', sub.id)

    // Welcome email with unsubscribe link (token reused as unsub token).
    const mail = welcomeEmail(token)
    await sendEmail({ to: sub.email, subject: mail.subject, html: mail.html })
  }

  return NextResponse.redirect(`${base}/subscription?status=confirmed`)
}
