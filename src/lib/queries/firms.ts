import { createClient } from '@/lib/supabase/server'
import type { FirmWithStatus, DashboardStats } from '@/types/database'

export async function getAllFirms(): Promise<FirmWithStatus[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('firms')
    .select(`
      *,
      firm_statuses (*),
      member_states (*)
    `)
    .order('trading_name')

  if (error) throw error
  return (data ?? []) as FirmWithStatus[]
}

export async function getFirmBySlug(slug: string): Promise<FirmWithStatus | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('firms')
    .select(`
      *,
      firm_statuses (*),
      member_states (*)
    `)
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as FirmWithStatus
}

export async function getFirmStatusHistory(firmId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('status_history')
    .select('*')
    .eq('firm_id', firmId)
    .order('changed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('firm_statuses')
    .select('status, last_verified')

  if (error) throw error

  const rows = data ?? []
  const counts = {
    authorized: 0,
    application_pending: 0,
    not_authorized: 0,
    exited_restricting_eu: 0,
    out_of_scope: 0,
  }

  let latestVerified: string | null = null

  for (const row of rows) {
    if (row.status in counts) counts[row.status as keyof typeof counts]++
    if (!latestVerified || row.last_verified > latestVerified) {
      latestVerified = row.last_verified
    }
  }

  return {
    total: rows.length,
    ...counts,
    last_updated: latestVerified,
  }
}
