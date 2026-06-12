import { getAllFirms } from '@/lib/queries/firms'
import { getLiveEsmaFirms } from '@/lib/queries/esma-live'
import {
  CATEGORY_LABELS,
  SERVICE_LABELS,
  SERVICE_ORDER,
  SOURCE_TYPE_LABELS,
} from '@/lib/constants/deadline'
import type { FirmWithStatus, FirmStatusRow } from '@/types/database'

/**
 * Returns the primary status row for a firm (first one present).
 */
function statusOf(firm: FirmWithStatus): FirmStatusRow | undefined {
  return firm.firm_statuses?.[0]
}

function isLicensed(firm: FirmWithStatus): boolean {
  return statusOf(firm)?.status === 'authorized'
}

/**
 * Licensed firms per home member state, sorted descending, count > 0 only.
 */
export async function getLicensedByCountry(): Promise<
  { code: string; name: string; count: number }[]
> {
  const firms = await getAllFirms()

  const counts: Record<string, number> = {}
  const names: Record<string, string> = {}

  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    const code = firm.home_state_code
    if (!code) continue
    counts[code] = (counts[code] ?? 0) + 1
    if (firm.member_states?.name) names[code] = firm.member_states.name
  }

  return Object.entries(counts)
    .map(([code, count]) => ({ code, name: names[code] ?? code, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

/**
 * Licensed firms per category, sorted descending, using CATEGORY_LABELS for label.
 */
export async function getLicensedByCategory(): Promise<
  { category: string; label: string; count: number }[]
> {
  const firms = await getAllFirms()

  const counts: Record<string, number> = {}
  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    const category = firm.category ?? 'other'
    counts[category] = (counts[category] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      label: CATEGORY_LABELS[category] ?? category,
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/**
 * Licensed firms per MiCA crypto-asset service authorised. A firm is counted
 * once for every service it holds, so this is a service-coverage view (the
 * counts sum to more than the number of firms). Sourced from the ESMA
 * ac_serviceCode column. Sorted descending by count.
 */
export async function getLicensedByService(): Promise<
  { code: string; label: string; count: number }[]
> {
  const firms = await getAllFirms()

  const counts: Record<string, number> = {}
  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    for (const code of statusOf(firm)?.services ?? []) {
      counts[code] = (counts[code] ?? 0) + 1
    }
  }

  // Fall back to the live ESMA register if the DB has no service data backfilled.
  if (Object.keys(counts).length === 0) {
    for (const f of await getLiveEsmaFirms()) {
      for (const code of f.services) counts[code] = (counts[code] ?? 0) + 1
    }
  }

  return SERVICE_ORDER.filter((code) => counts[code])
    .map((code) => ({ code, label: SERVICE_LABELS[code] ?? code, count: counts[code] }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Inbound passporting reach: how many licensed firms have notified the right to
 * passport INTO each member state. Sourced from the ESMA ac_serviceCode_cou
 * column. Sorted descending. Powers the passporting map / "most-served markets".
 */
export async function getPassportingReach(): Promise<
  { code: string; count: number }[]
> {
  const firms = await getAllFirms()

  const counts: Record<string, number> = {}
  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    for (const code of statusOf(firm)?.passport_states ?? []) {
      counts[code] = (counts[code] ?? 0) + 1
    }
  }

  // Fall back to the live ESMA register if the DB has no passport data backfilled.
  if (Object.keys(counts).length === 0) {
    for (const f of await getLiveEsmaFirms()) {
      for (const code of f.passportStates) counts[code] = (counts[code] ?? 0) + 1
    }
  }

  return Object.entries(counts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
}

/**
 * Cumulative count of authorizations bucketed by month. Prefers the structured
 * `authorized_at` column from the ESMA register and falls back to the legacy
 * "notified YYYY-MM-DD" note for any row not yet backfilled.
 * Returns [] only if fewer than 2 monthly data points are available.
 */
export async function getCumulativeAuthorizations(): Promise<
  { month: string; cumulative: number }[]
> {
  const firms = await getAllFirms()

  const perMonth: Record<string, number> = {}
  const notifiedRe = /notified (\d{4})-(\d{2})-(\d{2})/

  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    const status = statusOf(firm)
    let month: string | null = null
    if (status?.authorized_at) {
      month = status.authorized_at.slice(0, 7)
    } else {
      const match = status?.notes?.match(notifiedRe)
      if (match) month = `${match[1]}-${match[2]}`
    }
    if (!month) continue
    perMonth[month] = (perMonth[month] ?? 0) + 1
  }

  const months = Object.keys(perMonth).sort()
  if (months.length < 2) return []

  let cumulative = 0
  return months.map((month) => {
    cumulative += perMonth[month]
    return { month, cumulative }
  })
}

/**
 * Provenance: how many tracked firms get their current status from each source
 * type (ESMA register, NCA register, press, …). Demonstrates the evidence base.
 * Works on existing data — no backfill required.
 */
export async function getSourceBreakdown(): Promise<
  { key: string; label: string; count: number }[]
> {
  const firms = await getAllFirms()

  const counts: Record<string, number> = {}
  for (const firm of firms) {
    const key = statusOf(firm)?.source_type
    if (!key) continue
    counts[key] = (counts[key] ?? 0) + 1
  }

  return Object.entries(counts)
    .map(([key, count]) => ({ key, label: SOURCE_TYPE_LABELS[key] ?? key, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Headline split: licensed (authorized), not licensed (not_authorized), total firms.
 */
export async function getStatusSplit(): Promise<{
  licensed: number
  notLicensed: number
  total: number
}> {
  const firms = await getAllFirms()

  let licensed = 0
  let notLicensed = 0
  for (const firm of firms) {
    const status = statusOf(firm)?.status
    if (status === 'authorized') licensed++
    else if (status === 'not_authorized') notLicensed++
  }

  return { licensed, notLicensed, total: firms.length }
}
