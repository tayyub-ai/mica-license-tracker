import { createClient } from '@/lib/supabase/server'
import type { MemberState } from '@/types/database'

export interface StateWithCount extends MemberState {
  authorized_count: number
  total_count: number
}

export async function getStateCounts(): Promise<StateWithCount[]> {
  const supabase = await createClient()

  const [{ data: states }, { data: firms }] = await Promise.all([
    supabase.from('member_states').select('*').order('name'),
    supabase.from('firms').select('home_state_code, firm_statuses(status)'),
  ])

  const authorizedByState: Record<string, number> = {}
  const totalByState: Record<string, number> = {}

  for (const f of firms ?? []) {
    const code = (f as { home_state_code: string | null }).home_state_code
    if (!code) continue
    totalByState[code] = (totalByState[code] ?? 0) + 1
    const status = (f as { firm_statuses?: { status: string }[] }).firm_statuses?.[0]?.status
    if (status === 'authorized') {
      authorizedByState[code] = (authorizedByState[code] ?? 0) + 1
    }
  }

  return (states ?? []).map((s) => ({
    ...s,
    authorized_count: authorizedByState[s.code] ?? 0,
    total_count: totalByState[s.code] ?? 0,
  }))
}
