import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('email_subscribers')
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: 'email' })

    if (error) {
      console.error('Supabase subscribe error:', error)
      return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
