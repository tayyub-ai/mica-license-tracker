import { getLiveEsmaFirms, type LiveFirm } from '@/lib/queries/esma-live'

export interface CodeCount {
  code: string
  count: number
}

export interface PassportingDataset {
  /** Per-firm rows (name, home state, passported states) — drives outbound mode. */
  firms: LiveFirm[]
  /** Inbound: how many licensed firms can serve each member state, sorted desc. */
  inbound: CodeCount[]
  /** How many licensed firms are home-authorised in each member state, sorted desc. */
  homeCounts: CodeCount[]
  totalFirms: number
  /** Total home→destination passport links (sum of all reaches). */
  totalLinks: number
  /** Mean number of markets a firm reaches. */
  avgReach: number
  /** Busiest single destination's inbound count (for colour-ramp ceilings). */
  maxInbound: number
}

/**
 * Builds the full passporting picture from the live ESMA register. Returns an
 * empty-but-valid dataset if the register is unreachable so the UI can degrade.
 */
export async function getPassportingDataset(): Promise<PassportingDataset> {
  const firms = await getLiveEsmaFirms()

  const inboundMap: Record<string, number> = {}
  const homeMap: Record<string, number> = {}
  let totalLinks = 0

  for (const f of firms) {
    if (f.home) homeMap[f.home] = (homeMap[f.home] ?? 0) + 1
    for (const dest of f.passportStates) {
      inboundMap[dest] = (inboundMap[dest] ?? 0) + 1
      totalLinks++
    }
  }

  const inbound = Object.entries(inboundMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
  const homeCounts = Object.entries(homeMap)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))

  return {
    firms,
    inbound,
    homeCounts,
    totalFirms: firms.length,
    totalLinks,
    avgReach: firms.length ? totalLinks / firms.length : 0,
    maxInbound: inbound[0]?.count ?? 0,
  }
}
