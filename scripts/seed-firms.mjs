// Seeds the firms + firm_statuses tables from the live ESMA MiCA register.
// Run: node scripts/seed-firms.mjs
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const URL = 'https://vaibkrkcdorivvtsnayc.supabase.co'
const SECRET = process.env.SEED_SUPABASE_SECRET
if (!SECRET) { console.error('Set SEED_SUPABASE_SECRET'); process.exit(1) }
const sb = createClient(URL, SECRET, { auth: { persistSession: false } })

const ESMA_CASP_URL = 'https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv'
const ESMA_EMT_URL = 'https://www.esma.europa.eu/sites/default/files/2024-12/EMTWP.csv'
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
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

// Extract MiCA service codes from the ac_serviceCode column.
// "a. providing custody... | c. exchange..." -> ['a','c']
function parseServiceCodes(raw) {
  if (!raw) return []
  return raw.split('|').map((s) => s.trim().match(/^([a-j])\./)).filter(Boolean).map((m) => m[1])
}

// Extract passported member-state codes from ac_serviceCode_cou ("AT|BE|BG|...").
function parsePassportStates(raw) {
  if (!raw) return []
  return raw.split('|').map((s) => s.trim()).filter((s) => /^[A-Z]{2}$/.test(s))
}

// Derive a primary category from the authoritative service codes the firm holds,
// most-distinctive-first. Far more accurate than guessing from the firm name.
function categoryFromServices(codes, fallbackName = '') {
  const s = new Set(codes)
  if (s.has('b') || s.has('c') || s.has('d')) return 'exchange'   // can run a venue / exchange crypto
  if (s.has('a')) return 'custodian'                              // custody without exchange
  if (s.has('e') || s.has('f') || s.has('g')) return 'broker'     // order handling / placing
  if (s.has('h') || s.has('i')) return 'broker'                   // advice / portfolio management
  if (s.has('j')) return 'wallet_provider'                        // transfer services only
  // No parseable services — fall back to a light name heuristic.
  const n = fallbackName.toLowerCase()
  if (/custod|depositar|verwahr|safekeep|vault/.test(n)) return 'custodian'
  if (/wallet/.test(n)) return 'wallet_provider'
  if (/exchange|trade|trading|coin|crypto|digital asset|bit/.test(n)) return 'exchange'
  return 'other'
}

function isoDate(d) {
  if (!d) return TODAY
  const m = d.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : TODAY
}

async function fetchCSV(url) {
  const res = await fetch(url)
  return (await res.text()).replace(/^﻿/, '')
}

// Firms that publicly restrict / are not authorized — curated, sourced
const NOT_AUTHORIZED = [
  { trading: 'Binance', legal: 'Binance Holdings Ltd', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date. Binance has stated it is pursuing MiCA authorization via an EU entity.' },
  { trading: 'Nexo', legal: 'Nexo AG', cat: 'broker', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
  { trading: 'Bitget', legal: 'Bitget Limited', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
  { trading: 'KuCoin', legal: 'MEK Global Limited', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
  { trading: 'MEXC', legal: 'MEXC Global Ltd', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
  { trading: 'Gate.io', legal: 'Gate Technology Inc', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
  { trading: 'HTX', legal: 'HTX (Huobi Global) Ltd', cat: 'exchange', state: null,
    src: 'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica',
    note: 'Not found in the ESMA MiCA CASP register as of verification date.' },
]

async function main() {
  console.log('Fetching ESMA register...')
  const caspTxt = await fetchCSV(ESMA_CASP_URL)
  const emtTxt = await fetchCSV(ESMA_EMT_URL)

  const caspRows = parseCSV(caspTxt).filter(r => r.length > 5 && r[1] && r[1].length === 2)
  const emtRows = parseCSV(emtTxt).filter(r => r.length > 5 && r[1] && r[1].length === 2)

  const seen = new Set()
  const records = []

  // Authorized CASPs
  for (const r of caspRows) {
    const legal = (r[2] || '').trim()
    const lei = (r[3] || '').trim()
    const commercial = (r[5] || legal).trim()
    const key = lei || legal
    if (!legal || seen.has(key)) continue
    seen.add(key)
    const services = parseServiceCodes(r[11])
    const passportStates = parsePassportStates(r[12])
    const authorizedAt = isoDate(r[9])
    records.push({
      slug: slugify(commercial || legal) + '-' + (lei ? lei.slice(0, 4).toLowerCase() : r[1].toLowerCase()),
      trading_name: commercial || legal,
      legal_name: legal,
      lei: lei || null,
      category: categoryFromServices(services, commercial + ' ' + legal),
      home_state_code: r[1],
      website_url: (r[7] || '').trim().startsWith('http') ? r[7].trim() : null,
      status: 'authorized',
      source_url: 'https://www.esma.europa.eu/sites/default/files/2024-12/CASPS.csv',
      source_type: 'esma_csv',
      confidence: 'high',
      last_verified: TODAY,
      services,
      passport_states: passportStates,
      authorized_at: authorizedAt,
      notes: `Authorized CASP per ESMA interim register (${r[0]}, notified ${authorizedAt}).`,
    })
  }

  // Authorized EMT (stablecoin) issuers
  for (const r of emtRows) {
    const legal = (r[2] || '').trim()
    const lei = (r[3] || '').trim()
    const commercial = (r[5] || legal).trim()
    const key = lei || legal
    if (!legal || seen.has(key)) continue
    seen.add(key)
    records.push({
      slug: slugify(commercial || legal) + '-emt',
      trading_name: commercial || legal,
      legal_name: legal,
      lei: lei || null,
      category: 'stablecoin_issuer',
      home_state_code: r[1],
      website_url: (r[7] || '').trim().startsWith('http') ? r[7].trim() : null,
      status: 'authorized',
      source_url: 'https://www.esma.europa.eu/sites/default/files/2024-12/EMTWP.csv',
      source_type: 'esma_csv',
      confidence: 'high',
      last_verified: TODAY,
      services: [],
      passport_states: [],
      authorized_at: isoDate(r[8]),
      notes: `Authorized EMT/ART issuer per ESMA interim register (${r[0]}, notified ${isoDate(r[8])}).`,
    })
  }

  // Curated not-authorized majors
  for (const f of NOT_AUTHORIZED) {
    if (seen.has(f.legal)) continue
    seen.add(f.legal)
    records.push({
      slug: slugify(f.trading),
      trading_name: f.trading,
      legal_name: f.legal,
      lei: null,
      category: f.cat,
      home_state_code: f.state,
      website_url: null,
      status: 'not_authorized',
      source_url: f.src,
      source_type: 'esma_csv',
      confidence: 'high',
      last_verified: TODAY,
      services: null,
      passport_states: null,
      authorized_at: null,
      notes: f.note,
    })
  }

  console.log(`Prepared ${records.length} firm records. Upserting...`)

  let ok = 0, fail = 0
  for (const rec of records) {
    const { status, source_url, source_type, confidence, last_verified, notes,
            services, passport_states, authorized_at, ...firm } = rec
    // upsert firm
    const { data: firmRow, error: fErr } = await sb.from('firms')
      .upsert(firm, { onConflict: 'slug' }).select('id').single()
    if (fErr) { console.error('firm fail', firm.slug, fErr.message); fail++; continue }
    // replace status (one row per firm)
    await sb.from('firm_statuses').delete().eq('firm_id', firmRow.id)
    const { error: sErr } = await sb.from('firm_statuses').insert({
      firm_id: firmRow.id, status, source_url, source_type, confidence, last_verified, notes,
      services, passport_states, authorized_at,
    })
    if (sErr) { console.error('status fail', firm.slug, sErr.message); fail++; continue }
    ok++
  }

  console.log(`Done. ${ok} ok, ${fail} failed.`)

  // Report distribution
  const { data: dist } = await sb.from('firm_statuses').select('status')
  const counts = {}
  for (const d of dist || []) counts[d.status] = (counts[d.status] || 0) + 1
  console.log('Status distribution:', counts)
  const { data: cats } = await sb.from('firms').select('category')
  const catCounts = {}
  for (const c of cats || []) catCounts[c.category] = (catCounts[c.category] || 0) + 1
  console.log('Category distribution:', catCounts)
  const { count } = await sb.from('firms').select('*', { count: 'exact', head: true })
  console.log('Total firms:', count)
}

main().catch(e => { console.error(e); process.exit(1) })
