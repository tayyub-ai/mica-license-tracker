-- One active status row per firm. The app also enforces this via delete-then-insert,
-- but the constraint makes it authoritative at the DB level.
-- (Run after de-duplicating any existing rows.)
DELETE FROM firm_statuses a
USING firm_statuses b
WHERE a.firm_id = b.firm_id AND a.ctid < b.ctid;

ALTER TABLE firm_statuses
  ADD CONSTRAINT firm_statuses_firm_id_unique UNIQUE (firm_id);
