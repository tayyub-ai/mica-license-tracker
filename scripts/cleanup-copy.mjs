// One-off: clean stored copy in the DB — strip em-dashes from summaries/notes,
// rewrite raw-status-code summaries to friendly wording, remove QA artifacts.
import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.SEED_SUPABASE_SECRET
if (!SECRET) { console.error('Set SEED_SUPABASE_SECRET'); process.exit(1) }
const sb = createClient('https://vaibkrkcdorivvtsnayc.supabase.co', SECRET, { auth: { persistSession: false } })

const LABEL = {
  authorized: 'Licensed', application_pending: 'Application Pending',
  not_authorized: 'Not Licensed', exited_restricting_eu: 'Exited or Restricting', out_of_scope: 'Out of Scope',
}
const clean = (s) => s ? s.replace(/ — /g, ', ').replace(/—/g, ', ').replace(/ , /g, ', ') : s

async function fixTable(table, field) {
  const { data } = await sb.from(table).select(`id, ${field}`)
  let n = 0
  for (const row of data ?? []) {
    let v = row[field]
    if (!v) continue
    let nv = clean(v)
    // rewrite raw status codes if present
    for (const [code, label] of Object.entries(LABEL)) nv = nv.replaceAll(code, label)
    nv = nv.replace(/\badded,\s*flagged/i, 'added, flagged') // tidy
    if (nv !== v) { await sb.from(table).update({ [field]: nv }).eq('id', row.id); n++ }
  }
  console.log(`${table}.${field}: cleaned ${n} rows`)
}

async function main() {
  // Remove the QA test artifact (Bitget status-change entry from qa-edit run).
  const { data: artifacts } = await sb.from('changelog_entries').select('id, summary').ilike('summary', '%not_authorized to application_pending%')
  for (const a of artifacts ?? []) { await sb.from('changelog_entries').delete().eq('id', a.id); console.log('removed QA artifact:', a.summary) }
  const { data: arts2 } = await sb.from('status_history').select('id, notes').ilike('notes', '%QA%')
  for (const a of arts2 ?? []) await sb.from('status_history').delete().eq('id', a.id)

  await fixTable('changelog_entries', 'summary')
  await fixTable('status_history', 'notes')
  await fixTable('firm_statuses', 'notes')
  console.log('done')
}

main().catch((e) => { console.error(e); process.exit(1) })
