import { parseCSV, parseServiceCodes, parsePassportStates, ESMA_BASE } from '@/lib/esma/parse'

/**
 * A licensed CASP as published in the live ESMA MiCA register, with the two
 * fields that matter for passporting: where it is authorised (home) and every
 * member state it has notified the right to operate in (passportStates).
 */
export interface LiveFirm {
  name: string
  home: string
  services: string[]
  passportStates: string[]
}

/**
 * Fetches and parses the live ESMA CASPS register, cached for an hour. This is
 * the authoritative source for service codes and passporting — sourcing the
 * passporting and service-mix visualisations from here keeps them correct and
 * fresh without depending on a database backfill. Returns [] on any failure so
 * callers degrade gracefully.
 */
export async function getLiveEsmaFirms(): Promise<LiveFirm[]> {
  try {
    const res = await fetch(`${ESMA_BASE}/CASPS.csv`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const txt = (await res.text()).replace(/^﻿/, '')
    const rows = parseCSV(txt).filter((r) => r.length > 5 && r[1] && r[1].length === 2)

    const out: LiveFirm[] = []
    const seen = new Set<string>()
    for (const r of rows) {
      const legal = (r[2] || '').trim()
      const lei = (r[3] || '').trim()
      const name = (r[5] || legal).trim()
      const key = lei || legal
      if (!legal || seen.has(key)) continue
      seen.add(key)
      out.push({
        name: name || legal,
        home: r[1],
        services: parseServiceCodes(r[11]),
        passportStates: parsePassportStates(r[12]),
      })
    }
    return out
  } catch {
    return []
  }
}
