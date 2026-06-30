-- ══════════════════════════════════════════════════════
--  ADD CUSTOMERS TABLE — Run this in Supabase SQL Editor
--  Safe to run even if you already have other tables
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customers (
  id          BIGSERIAL PRIMARY KEY,
  company     TEXT NOT NULL,
  attn        TEXT,
  phone       TEXT,
  email       TEXT,
  cr          TEXT,
  vat         TEXT,
  addr        TEXT,
  city        TEXT,
  created_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_all_customers" ON customers;
CREATE POLICY "service_all_customers" ON customers FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company);

DROP TRIGGER IF EXISTS customers_updated_at ON customers;
CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
