import { getAllFirms } from '@/lib/queries/firms'

export const revalidate = 3600

export async function GET() {
  const firms = await getAllFirms()

  const header = 'slug,trading_name,legal_name,lei,category,home_state,status,source_type,source_url,confidence,last_verified\n'
  const rows = firms.map((f) => {
    const s = f.firm_statuses?.[0]
    const cols = [
      f.slug,
      f.trading_name,
      f.legal_name,
      f.lei ?? '',
      f.category,
      f.home_state_code ?? '',
      s?.status ?? '',
      s?.source_type ?? '',
      s?.source_url ?? '',
      s?.confidence ?? '',
      s?.last_verified ?? '',
    ]
    return cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  })

  const csv = header + rows.join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="mica-tracker-export.csv"',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}
