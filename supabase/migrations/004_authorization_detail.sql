-- Capture the richer columns the ESMA MiCA register actually publishes but that
-- earlier ingestion discarded: the specific crypto-asset services each firm is
-- authorised for, the member states it has passported into, and the clean
-- authorisation/notification date. These power accurate categorisation, the
-- service-mix and passporting visualisations, and a robust authorisations timeline.

ALTER TABLE firm_statuses
  ADD COLUMN IF NOT EXISTS services TEXT[],          -- MiCA CASP service codes held, e.g. {a,c,d,e,f,g,j}
  ADD COLUMN IF NOT EXISTS passport_states TEXT[],   -- member-state codes the firm has passported into
  ADD COLUMN IF NOT EXISTS authorized_at DATE;       -- ESMA authorisation/notification date

-- Index for time-series / passporting aggregation.
CREATE INDEX IF NOT EXISTS idx_firm_statuses_authorized_at ON firm_statuses (authorized_at);
