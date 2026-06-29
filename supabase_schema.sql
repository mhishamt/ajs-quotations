-- ══════════════════════════════════════════════════════
--  AJS QUOTATION SYSTEM — Run this ONCE in Supabase
--  Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ══════════════════════════════════════════════════════

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  branch        TEXT DEFAULT 'all',
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

-- QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
  id               BIGSERIAL PRIMARY KEY,
  qnum             TEXT NOT NULL UNIQUE,
  branch           TEXT NOT NULL DEFAULT 'main',
  branch_label     TEXT,
  quot_date        DATE,
  customer_company TEXT,
  customer_attn    TEXT,
  customer_phone   TEXT,
  customer_email   TEXT,
  customer_cr      TEXT,
  customer_vat     TEXT,
  customer_addr    TEXT,
  customer_city    TEXT,
  comp_name_en     TEXT,
  comp_name_ar     TEXT,
  comp_cr          TEXT,
  comp_vat         TEXT,
  comp_addr        TEXT,
  comp_city        TEXT,
  comp_tel         TEXT,
  comp_email       TEXT,
  comp_person      TEXT,
  comp_addr_ar     TEXT,
  our_ref          TEXT,
  your_ref         TEXT,
  currency         TEXT DEFAULT 'SAR',
  vat_on           BOOLEAN DEFAULT TRUE,
  discount         NUMERIC(12,2) DEFAULT 0,
  subtotal         NUMERIC(12,2) DEFAULT 0,
  vat_amount       NUMERIC(12,2) DEFAULT 0,
  total            NUMERIC(12,2) DEFAULT 0,
  notes            TEXT,
  term_validity    TEXT DEFAULT '60 Days',
  term_payment     TEXT DEFAULT 'Credit',
  term_delivery    TEXT DEFAULT 'Ex Stock',
  term_warranty    TEXT,
  rows             JSONB DEFAULT '[]',
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Allow all (auth handled in API layer)
DROP POLICY IF EXISTS "service_all_users" ON users;
DROP POLICY IF EXISTS "service_all_quotations" ON quotations;
CREATE POLICY "service_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_quotations" ON quotations FOR ALL USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quotations_branch ON quotations(branch);
CREATE INDEX IF NOT EXISTS idx_quotations_qnum   ON quotations(qnum);
CREATE INDEX IF NOT EXISTS idx_users_username     ON users(username);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quotations_updated_at ON quotations;
CREATE TRIGGER quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ══════════════════════════════════════════════════════
--  DEFAULT ADMIN USER
--  Username : admin
--  Password : Admin@AJS2025
-- ══════════════════════════════════════════════════════
INSERT INTO users (username, password_hash, full_name, role, branch)
VALUES (
  'admin',
  '$2b$10$M074UMIWu/K/8RkVMIjKwOivBEBMwnkEVcqCoNMLX0zI6.9oxIPVG',
  'System Administrator',
  'admin',
  'all'
) ON CONFLICT (username) DO UPDATE
  SET password_hash = '$2b$10$M074UMIWu/K/8RkVMIjKwOivBEBMwnkEVcqCoNMLX0zI6.9oxIPVG',
      role = 'admin',
      full_name = 'System Administrator';
