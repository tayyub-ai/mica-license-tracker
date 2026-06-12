// Shared ESMA interim MiCA register fetching + parsing.

export const ESMA_BASE = 'https://www.esma.europa.eu/sites/default/files/2024-12'
// Official searchable MiCA register (human-facing, resolves). The interim
// landing pages 404; the direct CSV files below are the verifiable raw source.
export const ESMA_REGISTER_URL =
  'https://registers.esma.europa.eu/publication/searchRegister?core=esma_registers_mica'
export const ESMA_CASPS_CSV = `${ESMA_BASE}/CASPS.csv`
export const ESMA_EMTWP_CSV = `${ESMA_BASE}/EMTWP.csv`
export const ESMA_NCASP_CSV = `${ESMA_BASE}/NCASP.csv`

export interface EsmaEntity {
  competent_authority: string
  home_state: string
  legal_name: string
  lei: string | null
  commercial_name: string
  website: string | null
  auth_date: string | null
  services: string[]
  passport_states: string[]
  kind: 'casp' | 'emt'
}

// Extract the single-letter MiCA service codes from the pipe-separated
// ac_serviceCode column, e.g. "a. providing custody... | c. exchange..." -> ['a','c'].
export function parseServiceCodes(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split('|')
    .map((s) => s.trim().match(/^([a-j])\./))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => m[1])
}

// Extract passported member-state codes from the pipe-separated ac_serviceCode_cou column.
export function parsePassportStates(raw: string | undefined): string[] {
  if (!raw) return []
  return raw
    .split('|')
    .map((s) => s.trim())
    .filter((s) => /^[A-Z]{2}$/.test(s))
}

// Minimal RFC-4180-ish CSV parser handling quoted fields and embedded newlines.
export function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else inQ = false
      } else field += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++
        row.push(field); rows.push(row); row = []; field = ''
      } else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

function isoDate(d: string | undefined): string | null {
  if (!d) return null
  const m = d.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}

async function fetchCSV(filename: string): Promise<string> {
  const res = await fetch(`${ESMA_BASE}/${filename}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`ESMA fetch failed for ${filename}: ${res.status}`)
  return (await res.text()).replace(/^﻿/, '')
}

export async function fetchCASPs(): Promise<EsmaEntity[]> {
  const txt = await fetchCSV('CASPS.csv')
  const rows = parseCSV(txt).filter((r) => r.length > 5 && r[1] && r[1].length === 2)
  const seen = new Set<string>()
  const out: EsmaEntity[] = []
  for (const r of rows) {
    const legal = (r[2] || '').trim()
    const lei = (r[3] || '').trim()
    const key = lei || legal
    if (!legal || seen.has(key)) continue
    seen.add(key)
    out.push({
      competent_authority: r[0],
      home_state: r[1],
      legal_name: legal,
      lei: lei || null,
      commercial_name: (r[5] || legal).trim(),
      website: (r[7] || '').trim().startsWith('http') ? r[7].trim() : null,
      auth_date: isoDate(r[9]),
      services: parseServiceCodes(r[11]),
      passport_states: parsePassportStates(r[12]),
      kind: 'casp',
    })
  }
  return out
}

export async function fetchEMTs(): Promise<EsmaEntity[]> {
  const txt = await fetchCSV('EMTWP.csv')
  const rows = parseCSV(txt).filter((r) => r.length > 5 && r[1] && r[1].length === 2)
  const seen = new Set<string>()
  const out: EsmaEntity[] = []
  for (const r of rows) {
    const legal = (r[2] || '').trim()
    const lei = (r[3] || '').trim()
    const key = lei || legal
    if (!legal || seen.has(key)) continue
    seen.add(key)
    out.push({
      competent_authority: r[0],
      home_state: r[1],
      legal_name: legal,
      lei: lei || null,
      commercial_name: (r[5] || legal).trim(),
      website: (r[7] || '').trim().startsWith('http') ? r[7].trim() : null,
      auth_date: isoDate(r[8]),
      services: [],
      passport_states: [],
      kind: 'emt',
    })
  }
  return out
}

export async function fetchAllEsmaAuthorized(): Promise<EsmaEntity[]> {
  const [casps, emts] = await Promise.all([fetchCASPs(), fetchEMTs()])
  return [...casps, ...emts]
}
