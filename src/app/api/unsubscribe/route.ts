import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  const base = new URL(req.url).origin

  if (!token) {
    return NextResponse.redirect(`${base}/subscription?status=invalid`)
  }

  const supabase = createServiceClient()
  const { data: sub } = await supabase
    .from('email_subscribers')
    .select('id')
    .eq('confirmation_token', token)
    .single()

  if (!sub) {
    return NextResponse.redirect(`${base}/subscription?status=invalid`)
  }

  await supabase
    .from('email_subscribers')
    .update({ unsubscribed_at: new Date().toISOString(), confirmed: false })
    .eq('id', sub.id)

  return NextResponse.redirect(`${base}/subscription?status=unsubscribed`)
}
