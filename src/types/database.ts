export type FirmCategory =
  | 'exchange'
  | 'custodian'
  | 'stablecoin_issuer'
  | 'broker'
  | 'wallet_provider'
  | 'defi_other'
  | 'other'

export type FirmStatus =
  | 'authorized'
  | 'application_pending'
  | 'not_authorized'
  | 'exited_restricting_eu'
  | 'out_of_scope'

export type SourceType =
  | 'esma_csv'
  | 'nca_register'
  | 'firm_announcement'
  | 'press'
  | 'geoblock_evidence'

export type Confidence = 'high' | 'medium' | 'reported'

export interface MemberState {
  code: string
  name: string
  transitional_months: number | null
  transitional_end_date: string | null
  application_deadline: string | null
  notes: string | null
}

export interface NCA {
  id: string
  state_code: string
  name: string
  abbreviation: string
  register_url: string | null
  notes: string | null
}

export interface Firm {
  id: string
  slug: string
  trading_name: string
  legal_name: string
  lei: string | null
  national_registration_number: string | null
  category: FirmCategory
  home_state_code: string | null
  description: string | null
  website_url: string | null
  created_at: string
  updated_at: string
}

export interface FirmStatusRow {
  id: string
  firm_id: string
  status: FirmStatus
  source_url: string
  source_type: SourceType
  confidence: Confidence
  last_verified: string
  notes: string | null
  out_of_scope_reason: string | null
  created_at: string
  updated_at: string
  updated_by: string | null
}

export interface StatusHistory {
  id: string
  firm_id: string
  old_status: FirmStatus | null
  new_status: FirmStatus
  source_url: string
  source_type: SourceType
  confidence: Confidence
  changed_at: string
  changed_by: string
  notes: string | null
}

export interface ChangelogEntry {
  id: string
  firm_id: string
  old_status: FirmStatus | null
  new_status: FirmStatus
  summary: string
  source_url: string
  published_at: string
  status_history_id: string | null
  firms?: Pick<Firm, 'slug' | 'trading_name'>
}

export interface EmailSubscriber {
  id: string
  email: string
  confirmed: boolean
  subscribed_at: string
  unsubscribed_at: string | null
}

export interface EsmaIngestionRun {
  id: string
  run_at: string
  csv_filename: string
  rows_fetched: number
  new_entries: number
  status_changes: number
}

export interface EsmaPendingReview {
  id: string
  ingestion_run_id: string
  review_type: 'new_entry' | 'status_change' | 'removal'
  esma_entity_name: string
  esma_data: Record<string, unknown>
  matched_firm_id: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  decision: 'added' | 'updated' | 'skipped' | 'pending'
  created_at: string
}

// Joined types used in queries
export interface FirmWithStatus extends Firm {
  firm_statuses: FirmStatusRow[]
  member_states?: MemberState | null
}

export interface DashboardStats {
  total: number
  authorized: number
  application_pending: number
  not_authorized: number
  exited_restricting_eu: number
  out_of_scope: number
  last_updated: string | null
}
