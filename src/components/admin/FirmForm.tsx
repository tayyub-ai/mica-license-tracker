'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_LABELS } from '@/lib/constants/deadline'
import type { FirmCategory, FirmStatus, SourceType, Confidence } from '@/types/database'

interface Props {
  initialFirmId?: string
  initialValues?: {
    trading_name: string
    legal_name: string
    lei?: string
    national_registration_number?: string
    category: FirmCategory
    home_state_code?: string
    description?: string
    website_url?: string
    status: FirmStatus
    source_url: string
    source_type: SourceType
    confidence: Confidence
    last_verified: string
    notes?: string
    out_of_scope_reason?: string
  }
}

const defaultValues = {
  trading_name: '',
  legal_name: '',
  lei: '',
  national_registration_number: '',
  category: 'exchange' as FirmCategory,
  home_state_code: '',
  description: '',
  website_url: '',
  status: 'not_authorized' as FirmStatus,
  source_url: '',
  source_type: 'esma_csv' as SourceType,
  confidence: 'high' as Confidence,
  last_verified: new Date().toISOString().split('T')[0],
  notes: '',
  out_of_scope_reason: '',
}

export function FirmForm({ initialFirmId, initialValues }: Props) {
  const [values, setValues] = useState({ ...defaultValues, ...initialValues })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  function set(field: string, value: string) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function slug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!values.source_url) { setError('Source URL is required'); return }
    if (!values.last_verified) { setError('Last verified date is required'); return }

    setLoading(true)
    const supabase = createClient()

    try {
      let firmId = initialFirmId

      if (!firmId) {
        const { data: firm, error: firmErr } = await supabase
          .from('firms')
          .insert({
            slug: slug(values.trading_name),
            trading_name: values.trading_name,
            legal_name: values.legal_name || values.trading_name,
            lei: values.lei || null,
            national_registration_number: values.national_registration_number || null,
            category: values.category,
            home_state_code: values.home_state_code || null,
            description: values.description || null,
            website_url: values.website_url || null,
          })
          .select('id')
          .single()

        if (firmErr) throw firmErr
        firmId = firm.id
      } else {
        const { error: updateErr } = await supabase
          .from('firms')
          .update({
            trading_name: values.trading_name,
            legal_name: values.legal_name || values.trading_name,
            lei: values.lei || null,
            national_registration_number: values.national_registration_number || null,
            category: values.category,
            home_state_code: values.home_state_code || null,
            description: values.description || null,
            website_url: values.website_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', firmId)
        if (updateErr) throw updateErr
      }

      // Get current status for history
      const { data: existing } = await supabase
        .from('firm_statuses')
        .select('status')
        .eq('firm_id', firmId)
        .single()

      // Upsert status
      const { error: statusErr } = await supabase
        .from('firm_statuses')
        .upsert({
          firm_id: firmId,
          status: values.status,
          source_url: values.source_url,
          source_type: values.source_type,
          confidence: values.confidence,
          last_verified: values.last_verified,
          notes: values.notes || null,
          out_of_scope_reason: values.out_of_scope_reason || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'firm_id' })

      if (statusErr) throw statusErr

      // Record history if status changed
      const { data: { user } } = await supabase.auth.getUser()
      const oldStatus = existing?.status ?? null
      if (oldStatus !== values.status || !initialFirmId) {
        await supabase.from('status_history').insert({
          firm_id: firmId,
          old_status: oldStatus,
          new_status: values.status,
          source_url: values.source_url,
          source_type: values.source_type,
          confidence: values.confidence,
          changed_by: user?.email ?? 'admin',
          notes: values.notes || null,
        })

        // Add changelog entry
        await supabase.from('changelog_entries').insert({
          firm_id: firmId,
          old_status: oldStatus,
          new_status: values.status,
          summary: `${values.trading_name} status ${oldStatus ? `changed from ${oldStatus} to ${values.status}` : `set to ${values.status}`}`,
          source_url: values.source_url,
        })
      }

      router.push('/admin/firms')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 text-sm'
  const labelCls = 'block text-sm text-zinc-400 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Trading name *</label>
          <input required className={inputCls} value={values.trading_name} onChange={(e) => set('trading_name', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Legal name *</label>
          <input required className={inputCls} value={values.legal_name} onChange={(e) => set('legal_name', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>LEI</label>
          <input className={inputCls} value={values.lei} onChange={(e) => set('lei', e.target.value)} placeholder="e.g. 213800LNKZ..." />
        </div>
        <div>
          <label className={labelCls}>National Reg. No.</label>
          <input className={inputCls} value={values.national_registration_number} onChange={(e) => set('national_registration_number', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Category *</label>
          <select required className={inputCls} value={values.category} onChange={(e) => set('category', e.target.value)}>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Home state (ISO code)</label>
          <input className={inputCls} value={values.home_state_code} onChange={(e) => set('home_state_code', e.target.value)} placeholder="e.g. DE, NL, FR" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Website URL</label>
        <input type="url" className={inputCls} value={values.website_url} onChange={(e) => set('website_url', e.target.value)} placeholder="https://..." />
      </div>

      <hr className="border-zinc-800" />
      <p className="text-sm font-medium text-zinc-300">Status (required fields)</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Status *</label>
          <select required className={inputCls} value={values.status} onChange={(e) => set('status', e.target.value)}>
            <option value="authorized">Authorized</option>
            <option value="application_pending">Application Pending</option>
            <option value="not_authorized">Not Authorized</option>
            <option value="exited_restricting_eu">Exited / Restricting EU</option>
            <option value="out_of_scope">Out of Scope</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Confidence *</label>
          <select required className={inputCls} value={values.confidence} onChange={(e) => set('confidence', e.target.value)}>
            <option value="high">High (ESMA/NCA register)</option>
            <option value="medium">Medium (press)</option>
            <option value="reported">Reported (firm/3rd party)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Source URL *</label>
        <input required type="url" className={inputCls} value={values.source_url} onChange={(e) => set('source_url', e.target.value)} placeholder="https://..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Source type *</label>
          <select required className={inputCls} value={values.source_type} onChange={(e) => set('source_type', e.target.value)}>
            <option value="esma_csv">ESMA CSV</option>
            <option value="nca_register">NCA Register</option>
            <option value="firm_announcement">Firm Announcement</option>
            <option value="press">Press</option>
            <option value="geoblock_evidence">Geoblock Evidence</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Last verified date *</label>
          <input required type="date" className={inputCls} value={values.last_verified} onChange={(e) => set('last_verified', e.target.value)} />
        </div>
      </div>

      {values.status === 'out_of_scope' && (
        <div>
          <label className={labelCls}>Out-of-scope rationale *</label>
          <input required className={inputCls} value={values.out_of_scope_reason} onChange={(e) => set('out_of_scope_reason', e.target.value)} />
        </div>
      )}

      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-100 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : initialFirmId ? 'Save changes' : 'Add firm'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:text-white transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}
