// MiCA hard EU-wide deadline per Article 143(3)
export const MICA_DEADLINE = new Date('2026-07-01T00:00:00Z')
export const MICA_FULL_APPLICABILITY = new Date('2024-12-30T00:00:00Z')

// ESMA interim register CSV filenames
export const ESMA_CSV_FILES = [
  'CASPS.csv',
  'ARTZZ.csv',
  'EMTWP.csv',
  'OTHER.csv',
  'NCASP.csv',
] as const

export const STATUS_LABELS: Record<string, string> = {
  authorized: 'Licensed',
  application_pending: 'Application Pending',
  not_authorized: 'Not Licensed',
  exited_restricting_eu: 'Exited or Restricting',
  out_of_scope: 'Out of Scope',
}

export const CATEGORY_LABELS: Record<string, string> = {
  exchange: 'Exchange & Trading',
  custodian: 'Custodian',
  stablecoin_issuer: 'Stablecoin Issuer',
  broker: 'Broker & On-ramp',
  wallet_provider: 'Wallet Provider',
  defi_other: 'DeFi & Other',
  other: 'Other',
}

// The ten MiCA crypto-asset services (Annex I / Article 3) a CASP can be
// authorised for. Keys are the single-letter service codes ESMA publishes.
export const SERVICE_LABELS: Record<string, string> = {
  a: 'Custody & administration',
  b: 'Trading platform',
  c: 'Exchange for funds',
  d: 'Crypto-to-crypto exchange',
  e: 'Order execution',
  f: 'Placing',
  g: 'Reception & transmission of orders',
  h: 'Advice',
  i: 'Portfolio management',
  j: 'Transfer services',
}

// Display order for service-mix charts (custody → trading → exchange → broking → advisory → transfer).
export const SERVICE_ORDER = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  reported: 'Reported',
}

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  esma_csv: 'ESMA Register',
  nca_register: 'NCA Register',
  firm_announcement: 'Firm Announcement',
  press: 'Press',
  geoblock_evidence: 'Geoblock Evidence',
}
