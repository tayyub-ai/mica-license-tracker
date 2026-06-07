import { getChangelog } from '@/lib/queries/changelog'

export const revalidate = 3600

export async function GET(req: Request) {
  const entries = await getChangelog(50)
  const base = new URL(req.url).origin

  const items = entries.map((e) => `
    <item>
      <title><![CDATA[${e.firms?.trading_name ?? 'Unknown'}: ${e.old_status ?? 'new'} → ${e.new_status}]]></title>
      <link>${base}/firms/${e.firms?.slug ?? ''}</link>
      <description><![CDATA[${e.summary}]]></description>
      <pubDate>${new Date(e.published_at).toUTCString()}</pubDate>
      <guid>${base}/firms/${e.firms?.slug ?? ''}#${e.id}</guid>
    </item>
  `).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>MiCA Tracker, Status Changelog</title>
    <link>${base}</link>
    <description>Updates to EU MiCA licence statuses</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml',
      'Cache-Control': 'public, s-maxage=3600',
    },
  })
}
