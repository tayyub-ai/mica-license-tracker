import { createClient } from '@/lib/supabase/server'
import type { ChangelogEntry } from '@/types/database'

export async function getChangelog(limit = 50): Promise<ChangelogEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('changelog_entries')
    .select(`
      *,
      firms (slug, trading_name)
    `)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as ChangelogEntry[]
}
