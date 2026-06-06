import { NextResponse } from 'next/server'
import { getAllFirms } from '@/lib/queries/firms'

export const revalidate = 3600

export async function GET() {
  try {
    const firms = await getAllFirms()
    const payload = firms.map((f) => {
      const status = f.firm_statuses?.[0]
      return {
        slug: f.slug,
        trading_name: f.trading_name,
        legal_name: f.legal_name,
        lei: f.lei,
        category: f.category,
        home_state: f.home_state_code,
        status: status?.status ?? null,
        source_type: status?.source_type ?? null,
        source_url: status?.source_url ?? null,
        confidence: status?.confidence ?? null,
        last_verified: status?.last_verified ?? null,
      }
    })
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch firms' }, { status: 500 })
  }
}
