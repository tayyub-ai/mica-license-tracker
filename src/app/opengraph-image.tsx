import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MiCA License Tracker, EU Crypto Authorization Status'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#a1a1aa', letterSpacing: 4, textTransform: 'uppercase' }}>
          EU MiCA Regulation · Article 143(3)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
            Which crypto firms
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#fbbf24', lineHeight: 1.1 }}>
            are licensed for the EU?
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#d4d4d8', marginTop: 32 }}>
          Live tracker · Deadline 1 July 2026 · Sourced from ESMA
        </div>
      </div>
    ),
    { ...size }
  )
}
