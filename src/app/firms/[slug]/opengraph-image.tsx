import { ImageResponse } from 'next/og'
import { getFirmBySlug } from '@/lib/queries/firms'
import { STATUS_LABELS, CATEGORY_LABELS } from '@/lib/constants/deadline'

export const alt = 'Firm MiCA authorization status'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const STATUS_COLOR: Record<string, string> = {
  authorized: '#34d399',
  application_pending: '#fbbf24',
  not_authorized: '#f87171',
  exited_restricting_eu: '#a1a1aa',
  out_of_scope: '#60a5fa',
}

export default async function Image({ params }: { params: { slug: string } }) {
  const firm = await getFirmBySlug(params.slug)
  const status = firm?.firm_statuses?.[0]?.status ?? 'not_authorized'
  const name = firm?.trading_name ?? 'Firm'
  const category = firm ? CATEGORY_LABELS[firm.category] : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, color: '#a1a1aa', letterSpacing: 3, textTransform: 'uppercase' }}>
          MiCA License Tracker
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 80, fontWeight: 800, color: '#ffffff', lineHeight: 1.05 }}>{name}</div>
          <div style={{ display: 'flex', fontSize: 30, color: '#a1a1aa', marginTop: 16 }}>{category}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: STATUS_COLOR[status] + '22',
              border: `2px solid ${STATUS_COLOR[status]}`,
              color: STATUS_COLOR[status],
              fontSize: 36,
              fontWeight: 700,
              padding: '16px 32px',
              borderRadius: 16,
            }}
          >
            {STATUS_LABELS[status]}
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#71717a' }}>Deadline 1 July 2026</div>
        </div>
      </div>
    ),
    { ...size }
  )
}
