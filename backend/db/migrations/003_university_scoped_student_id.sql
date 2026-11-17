-- ============================================================
-- Migration 003 — University-Scoped Student ID Uniqueness
-- Replaces global student_id UNIQUE constraint with a composite
-- UNIQUE(university_id, student_id) constraint.
-- Allows multiple universities to have identical batch numbers (e.g. Batch 54)
-- and department codes without ID collision.
-- ============================================================
BEGIN;

-- 1. Add university_id column to students table if not exists
ALTER TABLE students ADD COLUMN IF NOT EXISTS university_id INT REFERENCES universities(id) ON DELETE RESTRICT;

-- 2. Backfill university_id from departments table for existing records
UPDATE students s
SET university_id = d.university_id
FROM departments d
WHERE s.department_id = d.id AND s.university_id IS NULL;

-- 3. Set university_id as NOT NULL now that existing rows have been populated
ALTER TABLE students ALTER COLUMN university_id SET NOT NULL;

-- 4. Drop the global unique constraint on student_id
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_student_id_key;
ALTER TABLE students DROP CONSTRAINT IF EXISTS uq_students_student_id;

-- 5. Add the composite unique constraint (per-university uniqueness)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_students_uni_student_id'
    ) THEN
        ALTER TABLE students ADD CONSTRAINT uq_students_uni_student_id UNIQUE (university_id, student_id);
    END IF;
END $$;

-- 6. Add index for faster tenant-level queries
CREATE INDEX IF NOT EXISTS idx_students_uni ON students(university_id);

COMMIT;
