import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fetchAllEsmaAuthorized, ESMA_REGISTER_URL } from '@/lib/esma/parse'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Service-role client (server-only; bypasses RLS for the ingestion job).
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function GET(req: Request) {
  // Auth: Vercel Cron sends the CRON_SECRET as a bearer; allow manual run with same secret.
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = adminClient()

  let entities
  try {
    entities = await fetchAllEsmaAuthorized()
  } catch (err) {
    return NextResponse.json(
      { error: 'ESMA fetch failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    )
  }

  // Load current firms keyed by LEI and by normalized legal name.
  const { data: firms } = await sb
    .from('firms')
    .select('id, legal_name, lei, firm_statuses(status, source_type)')

  type FirmRow = {
    id: string
    legal_name: string
    lei: string | null
    firm_statuses?: { status: string; source_type?: string }[]
  }

  const byLei = new Map<string, { id: string; status?: string }>()
  const byName = new Map<string, { id: string; status?: string }>()
  for (const f of (firms ?? []) as FirmRow[]) {
    const status = f.firm_statuses?.[0]?.status
    const rec = { id: f.id, status }
    if (f.lei) byLei.set(f.lei.toUpperCase(), rec)
    byName.set(f.legal_name.toLowerCase().trim(), rec)
  }

  // Record the ingestion run.
  const { data: run, error: runErr } = await sb
    .from('esma_ingestion_runs')
    .insert({
      csv_filename: 'CASPS.csv+EMTWP.csv',
      rows_fetched: entities.length,
    })
    .select('id')
    .single()

  if (runErr || !run) {
    return NextResponse.json({ error: 'Failed to record run', detail: runErr?.message }, { status: 500 })
  }

  const pendingReviews: Array<Record<string, unknown>> = []
  let newEntries = 0
  let statusChanges = 0

  for (const e of entities) {
    const match =
      (e.lei && byLei.get(e.lei.toUpperCase())) ||
      byName.get(e.legal_name.toLowerCase().trim())

    if (!match) {
      // Not in our watchlist, propose adding.
      newEntries++
      pendingReviews.push({
        ingestion_run_id: run.id,
        review_type: 'new_entry',
        esma_entity_name: e.commercial_name || e.legal_name,
        esma_data: e,
        matched_firm_id: null,
        decision: 'pending',
      })
    } else if (match.status !== 'authorized') {
      // We have the firm but not marked authorized, propose status change.
      statusChanges++
      pendingReviews.push({
        ingestion_run_id: run.id,
        review_type: 'status_change',
        esma_entity_name: e.commercial_name || e.legal_name,
        esma_data: { ...e, current_status: match.status ?? 'none' },
        matched_firm_id: match.id,
        decision: 'pending',
      })
    }
    // else: already authorized, no action.
  }

  // Removal detection: firms we currently mark as ESMA-sourced authorized
  // that are no longer present in the fetched register file. Queue for human
  // review only — never auto-change status.
  const esmaLeiSet = new Set<string>()
  const esmaNameSet = new Set<string>()
  for (const e of entities) {
    if (e.lei) esmaLeiSet.add(e.lei.toUpperCase())
    esmaNameSet.add(e.legal_name.toLowerCase().trim())
  }

  let removals = 0
  for (const f of (firms ?? []) as FirmRow[]) {
    const st = f.firm_statuses?.[0]
    if (!st || st.status !== 'authorized' || st.source_type !== 'esma_csv') continue

    const leiPresent = f.lei ? esmaLeiSet.has(f.lei.toUpperCase()) : false
    const namePresent = esmaNameSet.has(f.legal_name.toLowerCase().trim())
    if (leiPresent || namePresent) continue

    removals++
    pendingReviews.push({
      ingestion_run_id: run.id,
      review_type: 'removal',
      esma_entity_name: f.legal_name,
      esma_data: {
        firm_id: f.id,
        reason: 'No longer present in the current ESMA register file',
      },
      matched_firm_id: f.id,
      decision: 'pending',
    })
  }

  if (pendingReviews.length > 0) {
    await sb.from('esma_pending_reviews').insert(pendingReviews)
  }

  await sb
    .from('esma_ingestion_runs')
    .update({ new_entries: newEntries, status_changes: statusChanges + removals })
    .eq('id', run.id)

  return NextResponse.json({
    ok: true,
    run_id: run.id,
    source: ESMA_REGISTER_URL,
    entities_fetched: entities.length,
    new_entries: newEntries,
    status_changes: statusChanges,
    removals,
    queued_for_review: pendingReviews.length,
  })
}
