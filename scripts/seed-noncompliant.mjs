// Adds ESMA non-compliant entities (NCASP.csv — firms flagged by national
// authorities as operating without authorization) to the registry.
// Status: not_authorized, NCA-sourced, with the regulator's warning noted.
// Run: SEED_SUPABASE_SECRET=<secret> node scripts/seed-noncompliant.mjs
import { createClient } from '@supabase/supabase-js'

const SECRET = process.env.SEED_SUPABASE_SECRET
if (!SECRET) { console.error('Set SEED_SUPABASE_SECRET'); process.exit(1) }
const sb = createClient('https://vaibkrkcdorivvtsnayc.supabase.co', SECRET, { auth: { persistSession: false } })

const NCASP_URL = 'https://www.esma.europa.eu/sites/default/files/2024-12/NCASP.csv'
const ESMA_NC_URL = 'https://www.esma.europa.eu/publications-and-data/registers-and-data'
const TODAY = new Date().toISOString().split('T')[0]

function parseCSV(t) {
  const rows = []; let row = [], field = '', inQ = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (inQ) { if (c === '"') { if (t[i + 1] === '"') { field += '"'; i++ } else inQ = false } else field += c }
    else {
      if (c === '"') inQ = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = '' }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56)
}

function categorize(name) {
  const n = name.toLowerCase()
  if (/custod|wallet/.test(n)) return /wallet/.test(n) ? 'wallet_provider' : 'custodian'
  if (/capital|securities|broker|invest|markets/.test(n)) return 'broker'
  if (/exchange|trade|trading|coin|crypto|bit|token|finance|fx/.test(n)) return 'exchange'
  return 'other'
}

function isoDate(d) {
  if (!d) return null
  const m = d.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

async function main() {
  console.log('Fetching ESMA non-compliant list (NCASP.csv)...')
  const res = await fetch(NCASP_URL, { cache: 'no-store' })
  const txt = (await res.text()).replace(/^﻿/, '')
  // cols: 0 CA, 1 state, 2 lei_name, 3 lei, 5 commercial_name, 6 website, 7 infringement, 8 reason, 9 decision_date
  const rows = parseCSV(txt).filter((r) => r.length > 5 && r[1] && r[1].length === 2)

  // Existing firms to avoid duplicating against authorized/seeded names.
  const { data: existing } = await sb.from('firms').select('legal_name, trading_name, lei')
  const known = new Set()
  for (const f of existing ?? []) {
    if (f.lei) known.add(f.lei.toUpperCase())
    known.add(f.legal_name.toLowerCase().trim())
    known.add(f.trading_name.toLowerCase().trim())
  }

  const seen = new Set()
  const records = []
  for (const r of rows) {
    const legal = (r[2] || '').trim()
    const commercial = (r[5] || legal).trim()
    const lei = (r[3] || '').trim()
    const name = commercial || legal
    if (!name) continue
    const dedupKey = (lei || name).toLowerCase()
    if (seen.has(dedupKey)) continue
    seen.add(dedupKey)
    // Skip if already an authorized/known firm.
    if (known.has(name.toLowerCase()) || (lei && known.has(lei.toUpperCase()))) continue

    const ca = (r[0] || '').trim()
    const reason = (r[8] || r[7] || '').trim()
    const decided = isoDate(r[9])
    const website = (r[6] || '').split('|')[0].trim()
    records.push({
      firm: {
        slug: slugify(name) + '-nc-' + r[1].toLowerCase(),
        trading_name: name,
        legal_name: legal || name,
        lei: lei || null,
        category: categorize(name),
        home_state_code: r[1],
        website_url: website.startsWith('http') ? website : null,
      },
      status: {
        status: 'not_authorized',
        source_url: ESMA_NC_URL,
        source_type: 'nca_register',
        confidence: 'high',
        last_verified: TODAY,
        notes: `Listed on the ESMA / ${ca || 'national authority'} non-compliant-entities warning list${decided ? ` (decision ${decided})` : ''}${reason ? `: ${reason.slice(0, 240)}` : '.'}`,
      },
    })
  }

  console.log(`Prepared ${records.length} new non-compliant firms (deduped against existing). Inserting...`)

  let ok = 0, fail = 0
  for (const rec of records) {
    const { data: firmRow, error: fErr } = await sb.from('firms').upsert(rec.firm, { onConflict: 'slug' }).select('id').single()
    if (fErr) { fail++; if (fail <= 5) console.error('firm fail', rec.firm.slug, fErr.message); continue }
    await sb.from('firm_statuses').delete().eq('firm_id', firmRow.id)
    const { error: sErr } = await sb.from('firm_statuses').insert({ firm_id: firmRow.id, ...rec.status })
    if (sErr) { fail++; continue }
    // history + changelog
    await sb.from('status_history').insert({
      firm_id: firmRow.id, old_status: null, new_status: 'not_authorized',
      source_url: rec.status.source_url, source_type: 'nca_register', confidence: 'high',
      changed_by: 'system (NCA warning list)', changed_at: new Date(TODAY).toISOString(),
      notes: 'Initial record from ESMA non-compliant list.',
    })
    await sb.from('changelog_entries').insert({
      firm_id: firmRow.id, old_status: null, new_status: 'not_authorized',
      summary: `${rec.firm.trading_name} added — flagged on the ESMA non-compliant-entities list.`,
      source_url: rec.status.source_url, published_at: new Date(TODAY).toISOString(),
    })
    ok++
  }

  console.log(`Done. ${ok} added, ${fail} failed/skipped.`)
  const { count } = await sb.from('firms').select('*', { count: 'exact', head: true })
  const { data: dist } = await sb.from('firm_statuses').select('status')
  const counts = {}
  for (const d of dist ?? []) counts[d.status] = (counts[d.status] || 0) + 1
  console.log('Total firms now:', count, '· distribution:', counts)
}

main().catch((e) => { console.error(e); process.exit(1) })
