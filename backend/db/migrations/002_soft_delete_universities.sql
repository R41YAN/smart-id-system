-- ============================================================
-- Migration 002 — Add deleted_at column to universities
-- Enables soft-delete and Recycle Bin recovery for universities
-- ============================================================
BEGIN;

ALTER TABLE universities ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMIT;
