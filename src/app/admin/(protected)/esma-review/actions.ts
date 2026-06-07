'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ESMA_REGISTER_URL } from '@/lib/esma/parse'

interface EsmaData {
  home_state?: string
  legal_name?: string
  lei?: string | null
  commercial_name?: string
  website?: string | null
  kind?: 'casp' | 'emt'
  current_status?: string
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function approveReview(reviewId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: review } = await supabase
    .from('esma_pending_reviews')
    .select('*')
    .eq('id', reviewId)
    .single()

  if (!review) return { error: 'Review not found' }

  const data = review.esma_data as EsmaData
  const today = new Date().toISOString().split('T')[0]
  let firmId = review.matched_firm_id as string | null

  // New entry → create firm.
  if (review.review_type === 'new_entry' && !firmId) {
    const commercial = data.commercial_name || data.legal_name || review.esma_entity_name
    const { data: firm, error: firmErr } = await supabase
      .from('firms')
      .insert({
        slug: slugify(commercial) + '-' + (data.lei ? data.lei.slice(0, 4).toLowerCase() : (data.home_state || 'eu').toLowerCase()),
        trading_name: commercial,
        legal_name: data.legal_name || commercial,
        lei: data.lei || null,
        category: data.kind === 'emt' ? 'stablecoin_issuer' : 'exchange',
        home_state_code: data.home_state || null,
        website_url: data.website || null,
      })
      .select('id')
      .single()
    if (firmErr) return { error: firmErr.message }
    firmId = firm.id
  }

  if (!firmId) return { error: 'No firm to update' }

  // Capture previous status for history.
  const { data: existing } = await supabase
    .from('firm_statuses')
    .select('status')
    .eq('firm_id', firmId)
    .single()
  const oldStatus = existing?.status ?? null

  // Apply authorized status (delete-then-insert).
  await supabase.from('firm_statuses').delete().eq('firm_id', firmId)
  const { error: statusErr } = await supabase.from('firm_statuses').insert({
    firm_id: firmId,
    status: 'authorized',
    source_url: ESMA_REGISTER_URL,
    source_type: 'esma_csv',
    confidence: 'high',
    last_verified: today,
    notes: 'Confirmed via ESMA interim register ingestion (admin-approved).',
  })
  if (statusErr) return { error: statusErr.message }

  // History + changelog.
  if (oldStatus !== 'authorized') {
    await supabase.from('status_history').insert({
      firm_id: firmId,
      old_status: oldStatus,
      new_status: 'authorized',
      source_url: ESMA_REGISTER_URL,
      source_type: 'esma_csv',
      confidence: 'high',
      changed_by: user.email ?? 'admin',
      notes: 'ESMA ingestion review approved.',
    })
    await supabase.from('changelog_entries').insert({
      firm_id: firmId,
      old_status: oldStatus,
      new_status: 'authorized',
      summary: `${review.esma_entity_name} confirmed authorized via ESMA register.`,
      source_url: ESMA_REGISTER_URL,
    })
  }

  // Mark review resolved.
  await supabase
    .from('esma_pending_reviews')
    .update({ decision: review.review_type === 'new_entry' ? 'added' : 'updated', reviewed_at: today, reviewed_by: user.email })
    .eq('id', reviewId)

  revalidatePath('/admin/esma-review')
  revalidatePath('/firms')
  return { ok: true }
}

export async function skipReview(reviewId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  await supabase
    .from('esma_pending_reviews')
    .update({ decision: 'skipped', reviewed_at: new Date().toISOString().split('T')[0], reviewed_by: user.email })
    .eq('id', reviewId)

  revalidatePath('/admin/esma-review')
  return { ok: true }
}
