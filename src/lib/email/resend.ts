import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const FROM = process.env.EMAIL_FROM || 'MiCA Tracker <onboarding@resend.dev>'

const resend = apiKey ? new Resend(apiKey) : null

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

interface SendArgs {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping send to', to)
    return { ok: false, error: 'Email not configured' }
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'send failed' }
  }
}

const wrap = (body: string) => `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b">
  <div style="font-weight:700;font-size:18px;margin-bottom:16px">MiCA License Tracker</div>
  ${body}
  <hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0" />
  <p style="font-size:12px;color:#71717a">
    You're receiving this because you subscribed at MiCA License Tracker. This is an independent
    information resource and not legal advice.
  </p>
</div>`

export function confirmationEmail(token: string) {
  const url = `${siteUrl()}/api/confirm?token=${token}`
  return {
    subject: 'Confirm your MiCA Tracker subscription',
    html: wrap(`
      <p style="font-size:15px;line-height:1.6">Thanks for subscribing. Please confirm your email to start receiving
      <strong>a weekly email summarising what changed on the EU MiCA register</strong>.</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#18181b;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;display:inline-block">Confirm subscription</a>
      </p>
      <p style="font-size:13px;color:#71717a">Or paste this link: ${url}</p>
    `),
  }
}

export function welcomeEmail(unsubToken: string) {
  const unsub = `${siteUrl()}/api/unsubscribe?token=${unsubToken}`
  return {
    subject: 'You are subscribed to MiCA Tracker',
    html: wrap(`
      <p style="font-size:15px;line-height:1.6">You're confirmed. You'll receive <strong>a weekly email summarising what changed on the EU MiCA register</strong>
      as firms gain or lose their MiCA licence ahead of the 1 July 2026 deadline.</p>
      <p style="margin:20px 0"><a href="${siteUrl()}/firms" style="color:#18181b;font-weight:600">Browse the firm registry →</a></p>
      <p style="font-size:12px;color:#71717a"><a href="${unsub}" style="color:#71717a">Unsubscribe</a></p>
    `),
  }
}

export function digestEmail(
  changes: Array<{ trading_name: string; old_status: string | null; new_status: string; slug: string }>,
  unsubToken: string
) {
  const unsub = `${siteUrl()}/api/unsubscribe?token=${unsubToken}`
  const rows = changes
    .map(
      (c) => `<li style="margin-bottom:8px;font-size:14px">
        <a href="${siteUrl()}/firms/${c.slug}" style="color:#18181b;font-weight:600">${c.trading_name}</a>
       , ${c.old_status ? c.old_status + ' → ' : ''}<strong>${c.new_status}</strong>
      </li>`
    )
    .join('')
  return {
    subject: `MiCA Tracker, ${changes.length} status change${changes.length !== 1 ? 's' : ''} this week`,
    html: wrap(`
      <p style="font-size:15px;line-height:1.6">Here's what changed in EU MiCA authorizations this week:</p>
      <ul style="padding-left:18px">${rows}</ul>
      <p style="margin:20px 0"><a href="${siteUrl()}/changelog" style="color:#18181b;font-weight:600">View full changelog →</a></p>
      <p style="font-size:12px;color:#71717a"><a href="${unsub}" style="color:#71717a">Unsubscribe</a></p>
    `),
  }
}
