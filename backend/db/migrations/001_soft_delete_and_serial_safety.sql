-- ============================================================
-- Migration 001 — safe to run on an EXISTING database (does not delete data)
--   • adds the deleted_at (Recycle Bin) columns if they are missing
--   • repairs batch serial counters lowered by the old "recalibration" logic
--   • adds a UNIQUE (batch_id, serial_number) safety constraint
-- Run once:  psql "$DATABASE_URL" -f db/migrations/001_soft_delete_and_serial_safety.sql
-- (or paste it into the Supabase SQL editor)
-- ============================================================
BEGIN;

ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE batches     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE students    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- current_serial must never be lower than the highest serial ever used (Recycle Bin included)
UPDATE batches b
SET current_serial = m.max_serial
FROM (SELECT batch_id, MAX(serial_number) AS max_serial FROM students GROUP BY batch_id) m
WHERE m.batch_id = b.id AND b.current_serial < m.max_serial;

DO $$ BEGIN
  ALTER TABLE students ADD CONSTRAINT uq_students_batch_serial UNIQUE (batch_id, serial_number);
EXCEPTION WHEN duplicate_object OR duplicate_table THEN NULL; END $$;

COMMIT;
