// Backfills status_history + changelog_entries for seeded firms that have none,
// recording the initial authorization as provenance. Idempotent.
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://vaibkrkcdorivvtsnayc.supabase.co',
  process.env.SEED_SUPABASE_SECRET,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: firms } = await sb
    .from('firms')
    .select('id, slug, trading_name, firm_statuses(status, source_url, source_type, confidence, last_verified)')

  const { data: existingHistory } = await sb.from('status_history').select('firm_id')
  const hasHistory = new Set((existingHistory ?? []).map((h) => h.firm_id))

  const historyRows = []
  const changelogRows = []

  for (const f of firms ?? []) {
    if (hasHistory.has(f.id)) continue
    const s = f.firm_statuses?.[0]
    if (!s) continue
    historyRows.push({
      firm_id: f.id,
      old_status: null,
      new_status: s.status,
      source_url: s.source_url,
      source_type: s.source_type,
      confidence: s.confidence,
      changed_by: 'system (initial load)',
      changed_at: new Date(s.last_verified).toISOString(),
      notes: 'Initial record at tracker launch.',
    })
    // Only surface authorized + not_authorized in the public changelog (the meaningful states).
    changelogRows.push({
      firm_id: f.id,
      old_status: null,
      new_status: s.status,
      summary: `${f.trading_name} recorded as ${s.status.replace(/_/g, ' ')} at tracker launch.`,
      source_url: s.source_url,
      published_at: new Date(s.last_verified).toISOString(),
    })
  }

  console.log(`Backfilling ${historyRows.length} history + ${changelogRows.length} changelog rows...`)

  for (let i = 0; i < historyRows.length; i += 100) {
    await sb.from('status_history').insert(historyRows.slice(i, i + 100))
    await sb.from('changelog_entries').insert(changelogRows.slice(i, i + 100))
  }

  const { count: hc } = await sb.from('status_history').select('*', { count: 'exact', head: true })
  const { count: cc } = await sb.from('changelog_entries').select('*', { count: 'exact', head: true })
  console.log(`Done. status_history=${hc}, changelog_entries=${cc}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
