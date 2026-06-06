-- Member states (EU-27 + EEA)
CREATE TABLE member_states (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transitional_months INTEGER,
  transitional_end_date DATE,
  application_deadline DATE,
  notes TEXT
);

-- National Competent Authorities
CREATE TABLE ncas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code TEXT NOT NULL REFERENCES member_states(code),
  name TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  register_url TEXT,
  notes TEXT
);

-- Firms watchlist
CREATE TABLE firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  trading_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  lei TEXT,
  national_registration_number TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'exchange', 'custodian', 'stablecoin_issuer', 'broker',
    'wallet_provider', 'defi_other', 'other'
  )),
  home_state_code TEXT REFERENCES member_states(code),
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Current status per firm (one active row per firm)
CREATE TABLE firm_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN (
    'authorized', 'application_pending', 'not_authorized',
    'exited_restricting_eu', 'out_of_scope'
  )),
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'esma_csv', 'nca_register', 'firm_announcement', 'press', 'geoblock_evidence'
  )),
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'reported')),
  last_verified DATE NOT NULL,
  notes TEXT,
  out_of_scope_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT
);

-- Append-only status history
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL,
  confidence TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  changed_by TEXT NOT NULL,
  notes TEXT
);

-- Public changelog
CREATE TABLE changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status_history_id UUID REFERENCES status_history(id)
);

-- Email subscribers
CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  confirmed BOOLEAN NOT NULL DEFAULT false,
  confirmation_token TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  gdpr_consent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ESMA ingestion tracking
CREATE TABLE esma_ingestion_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  csv_filename TEXT NOT NULL,
  rows_fetched INTEGER NOT NULL,
  new_entries INTEGER NOT NULL DEFAULT 0,
  status_changes INTEGER NOT NULL DEFAULT 0
);

-- Pending review queue for admins
CREATE TABLE esma_pending_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingestion_run_id UUID NOT NULL REFERENCES esma_ingestion_runs(id),
  review_type TEXT NOT NULL CHECK (review_type IN ('new_entry', 'status_change', 'removal')),
  esma_entity_name TEXT NOT NULL,
  esma_data JSONB NOT NULL,
  matched_firm_id UUID REFERENCES firms(id),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  decision TEXT CHECK (decision IN ('added', 'updated', 'skipped', 'pending')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_firm_statuses_firm_id ON firm_statuses(firm_id);
CREATE INDEX idx_status_history_firm_id ON status_history(firm_id);
CREATE INDEX idx_status_history_changed_at ON status_history(changed_at DESC);
CREATE INDEX idx_changelog_published_at ON changelog_entries(published_at DESC);
CREATE INDEX idx_firms_slug ON firms(slug);
CREATE INDEX idx_firms_category ON firms(category);
CREATE INDEX idx_firms_home_state ON firms(home_state_code);
CREATE INDEX idx_esma_pending_reviews_decision ON esma_pending_reviews(decision);

-- Row Level Security
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE firm_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE esma_pending_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE esma_ingestion_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE ncas ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_firms" ON firms FOR SELECT USING (true);
CREATE POLICY "public_read_firm_statuses" ON firm_statuses FOR SELECT USING (true);
CREATE POLICY "public_read_status_history" ON status_history FOR SELECT USING (true);
CREATE POLICY "public_read_changelog" ON changelog_entries FOR SELECT USING (true);
CREATE POLICY "public_read_member_states" ON member_states FOR SELECT USING (true);
CREATE POLICY "public_read_ncas" ON ncas FOR SELECT USING (true);

-- Public insert for email signup
CREATE POLICY "public_insert_email_subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);

-- Authenticated (admin) full access
CREATE POLICY "auth_all_firms" ON firms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_firm_statuses" ON firm_statuses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_status_history" ON status_history FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_changelog" ON changelog_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_email_subscribers" ON email_subscribers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_esma_reviews" ON esma_pending_reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_all_esma_runs" ON esma_ingestion_runs FOR ALL USING (auth.role() = 'authenticated');
