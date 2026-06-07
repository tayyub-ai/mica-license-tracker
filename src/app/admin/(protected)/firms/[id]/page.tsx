import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FirmForm } from '@/components/admin/FirmForm'
import type { FirmStatus, SourceType, Confidence, FirmCategory } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditFirmPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: firm } = await supabase
    .from('firms')
    .select('*, firm_statuses(*)')
    .eq('id', id)
    .single()

  if (!firm) notFound()

  const status = firm.firm_statuses?.[0]

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-ink">Edit: {firm.trading_name}</h1>
      <FirmForm
        initialFirmId={firm.id}
        initialValues={{
          trading_name: firm.trading_name,
          legal_name: firm.legal_name,
          lei: firm.lei ?? '',
          national_registration_number: firm.national_registration_number ?? '',
          category: firm.category as FirmCategory,
          home_state_code: firm.home_state_code ?? '',
          description: firm.description ?? '',
          website_url: firm.website_url ?? '',
          status: (status?.status ?? 'not_authorized') as FirmStatus,
          source_url: status?.source_url ?? '',
          source_type: (status?.source_type ?? 'esma_csv') as SourceType,
          confidence: (status?.confidence ?? 'high') as Confidence,
          last_verified: status?.last_verified ?? new Date().toISOString().split('T')[0],
          notes: status?.notes ?? '',
          out_of_scope_reason: status?.out_of_scope_reason ?? '',
        }}
      />
    </div>
  )
}
