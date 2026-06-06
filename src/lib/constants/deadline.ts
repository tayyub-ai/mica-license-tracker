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
  authorized: 'Authorized',
  application_pending: 'Application Pending',
  not_authorized: 'Not Authorized',
  exited_restricting_eu: 'Exited / Restricting EU',
  out_of_scope: 'Out of Scope',
}

export const CATEGORY_LABELS: Record<string, string> = {
  exchange: 'Exchange / Trading Platform',
  custodian: 'Custodian',
  stablecoin_issuer: 'Stablecoin / EMT / ART Issuer',
  broker: 'Broker / On-ramp',
  wallet_provider: 'Wallet Provider',
  defi_other: 'DeFi / Other',
  other: 'Other',
}

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
