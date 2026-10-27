-- ============================================================
-- Smart ID System — PostgreSQL Schema
-- ============================================================

DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS batches CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS universities CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ENUM types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'client_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE university_type AS ENUM ('open_credit', 'close_credit');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Users table (no FK to universities yet)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'client_admin',
  university_id INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Universities table
CREATE TABLE IF NOT EXISTS universities (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  type        university_type NOT NULL,
  is_locked   BOOLEAN DEFAULT FALSE,
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK from users -> universities
ALTER TABLE users
  ADD CONSTRAINT fk_user_university
  FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id            SERIAL PRIMARY KEY,
  university_id INT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name          VARCHAR(50) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(university_id, name)
);

-- Batches / Semester Intakes table
-- Close-credit: uses batch_number + year
-- Open-credit:  uses semester_code + semester_index + year
CREATE TABLE IF NOT EXISTS batches (
  id              SERIAL PRIMARY KEY,
  department_id   INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  year            INT NOT NULL,
  batch_number    INT,
  semester_code   VARCHAR(2) CHECK (semester_code IN ('SP','SM','FL')),
  semester_index  INT CHECK (semester_index IN (1,2,3)),
  current_serial  INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id            SERIAL PRIMARY KEY,
  batch_id      INT NOT NULL REFERENCES batches(id) ON DELETE RESTRICT,
  department_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  student_id    VARCHAR(30) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150),
  phone         VARCHAR(20),
  serial_number INT NOT NULL,
  admitted_by   INT REFERENCES users(id) ON DELETE SET NULL,
  admitted_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_dept   ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_batch  ON students(batch_id);
CREATE INDEX IF NOT EXISTS idx_batches_dept    ON batches(department_id);
CREATE INDEX IF NOT EXISTS idx_depts_uni       ON departments(university_id);
