import { createClient } from '@/lib/supabase/server'

export interface Freshness {
  registerLastChecked: string | null
  latestChange: string | null
}

export async function getFreshness(): Promise<Freshness> {
  const supabase = await createClient()

  const [runRes, changeRes] = await Promise.all([
    supabase
      .from('esma_ingestion_runs')
      .select('run_at')
      .order('run_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('changelog_entries')
      .select('published_at')
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  return {
    registerLastChecked: runRes.data?.run_at ?? null,
    latestChange: changeRes.data?.published_at ?? null,
  }
}
