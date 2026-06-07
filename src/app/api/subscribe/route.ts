import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServiceClient } from '@/lib/supabase/admin'
import { sendEmail, confirmationEmail } from '@/lib/email/resend'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    const clean = email.toLowerCase().trim()
    const token = randomUUID()
    const supabase = createServiceClient()

    // Upsert subscriber with a fresh confirmation token (unconfirmed).
    const { error } = await supabase
      .from('email_subscribers')
      .upsert(
        { email: clean, confirmation_token: token, confirmed: false, unsubscribed_at: null },
        { onConflict: 'email' }
      )

    if (error) {
      console.error('Supabase subscribe error:', error)
      return NextResponse.json({ error: 'Signup failed, please try again' }, { status: 500 })
    }

    // Send double opt-in confirmation email (best-effort).
    const mail = confirmationEmail(token)
    const sent = await sendEmail({ to: clean, subject: mail.subject, html: mail.html })

    return NextResponse.json({ ok: true, emailSent: sent.ok })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
