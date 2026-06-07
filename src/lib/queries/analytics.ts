import { getAllFirms } from '@/lib/queries/firms'
import { CATEGORY_LABELS } from '@/lib/constants/deadline'
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
 * Cumulative count of authorizations bucketed by month, derived from the
 * "notified YYYY-MM-DD" substring in licensed firms' status notes.
 * Returns [] if fewer than 4 monthly data points are parseable.
 */
export async function getCumulativeAuthorizations(): Promise<
  { month: string; cumulative: number }[]
> {
  const firms = await getAllFirms()

  const perMonth: Record<string, number> = {}
  const notifiedRe = /notified (\d{4})-(\d{2})-(\d{2})/

  for (const firm of firms) {
    if (!isLicensed(firm)) continue
    const notes = statusOf(firm)?.notes
    if (!notes) continue
    const match = notes.match(notifiedRe)
    if (!match) continue
    const month = `${match[1]}-${match[2]}`
    perMonth[month] = (perMonth[month] ?? 0) + 1
  }

  const months = Object.keys(perMonth).sort()
  if (months.length < 4) return []

  let cumulative = 0
  return months.map((month) => {
    cumulative += perMonth[month]
    return { month, cumulative }
  })
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
