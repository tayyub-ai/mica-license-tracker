import { createClient } from '@/lib/supabase/server'
import type { MemberState, NCA, FirmCategory, FirmStatus } from '@/types/database'

export interface CountryListItem {
  code: string
  name: string
  transitional_months: number | null
  transitional_end_date: string | null
  application_deadline: string | null
  notes: string | null
  licensedCount: number
  trackedCount: number
}

export interface CountryFirm {
  slug: string
  trading_name: string
  category: FirmCategory
  status: FirmStatus | null
}

export interface CountryDetail {
  state: MemberState
  nca: NCA | null
  firms: CountryFirm[]
}

// Status rank used to surface licensed firms first within a country.
const STATUS_RANK: Record<string, number> = {
  authorized: 0,
  application_pending: 1,
  exited_restricting_eu: 2,
  out_of_scope: 3,
  not_authorized: 4,
}

/**
 * Index data: every member state with licensed / tracked firm counts.
 * Sorted by country name.
 */
export async function getAllCountries(): Promise<CountryListItem[]> {
  const supabase = await createClient()

  const [statesRes, firmsRes] = await Promise.all([
    supabase
      .from('member_states')
      .select('code, name, transitional_months, transitional_end_date, application_deadline, notes'),
    supabase
      .from('firms')
      .select('home_state_code, firm_statuses (status)'),
  ])

  if (statesRes.error) throw statesRes.error
  if (firmsRes.error) throw firmsRes.error

  const states = (statesRes.data ?? []) as MemberState[]
  const firms = (firmsRes.data ?? []) as Array<{
    home_state_code: string | null
    firm_statuses: { status: FirmStatus }[]
  }>

  const tracked = new Map<string, number>()
  const licensed = new Map<string, number>()

  for (const firm of firms) {
    const code = firm.home_state_code
    if (!code) continue
    tracked.set(code, (tracked.get(code) ?? 0) + 1)
    const status = firm.firm_statuses?.[0]?.status
    if (status === 'authorized') {
      licensed.set(code, (licensed.get(code) ?? 0) + 1)
    }
  }

  return states
    .map((s) => ({
      code: s.code,
      name: s.name,
      transitional_months: s.transitional_months,
      transitional_end_date: s.transitional_end_date,
      application_deadline: s.application_deadline,
      notes: s.notes,
      licensedCount: licensed.get(s.code) ?? 0,
      trackedCount: tracked.get(s.code) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Detail data for a single country. `code` is matched case-insensitively
 * (callers pass the route param; we uppercase before querying).
 * Returns null when the code is not a known member state.
 */
export async function getCountry(code: string): Promise<CountryDetail | null> {
  const supabase = await createClient()
  const upper = code.toUpperCase()

  const stateRes = await supabase
    .from('member_states')
    .select('code, name, transitional_months, transitional_end_date, application_deadline, notes')
    .eq('code', upper)
    .single()

  if (stateRes.error) {
    if (stateRes.error.code === 'PGRST116') return null
    throw stateRes.error
  }
  const state = stateRes.data as MemberState

  const [ncaRes, firmsRes] = await Promise.all([
    supabase
      .from('ncas')
      .select('id, state_code, name, abbreviation, register_url, notes')
      .eq('state_code', upper)
      .maybeSingle(),
    supabase
      .from('firms')
      .select('slug, trading_name, category, firm_statuses (status)')
      .eq('home_state_code', upper),
  ])

  if (ncaRes.error) throw ncaRes.error
  if (firmsRes.error) throw firmsRes.error

  const firmsRaw = (firmsRes.data ?? []) as Array<{
    slug: string
    trading_name: string
    category: FirmCategory
    firm_statuses: { status: FirmStatus }[]
  }>

  const firms: CountryFirm[] = firmsRaw
    .map((f) => ({
      slug: f.slug,
      trading_name: f.trading_name,
      category: f.category,
      status: f.firm_statuses?.[0]?.status ?? null,
    }))
    .sort((a, b) => {
      const ra = STATUS_RANK[a.status ?? 'not_authorized'] ?? 5
      const rb = STATUS_RANK[b.status ?? 'not_authorized'] ?? 5
      if (ra !== rb) return ra - rb
      return a.trading_name.localeCompare(b.trading_name)
    })

  return {
    state,
    nca: (ncaRes.data as NCA | null) ?? null,
    firms,
  }
}
