import { NextResponse } from 'next/server'
import { getFirmBySlug } from '@/lib/queries/firms'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const firm = await getFirmBySlug(slug)
    if (!firm) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const status = firm.firm_statuses?.[0]
    return NextResponse.json({
      slug: firm.slug,
      trading_name: firm.trading_name,
      legal_name: firm.legal_name,
      lei: firm.lei,
      category: firm.category,
      home_state: firm.home_state_code,
      status: status?.status ?? null,
      source_type: status?.source_type ?? null,
      source_url: status?.source_url ?? null,
      confidence: status?.confidence ?? null,
      last_verified: status?.last_verified ?? null,
      notes: status?.notes ?? null,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch firm' }, { status: 500 })
  }
}
