-- supabase/migrations/20260901151500_orders_and_payments.sql
-- JUST RSA Drop 001: orders, line items, EFT payments (server-only via service role)

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'awaiting_eft'
    CHECK (status IN ('awaiting_eft', 'paid', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  total INTEGER NOT NULL CHECK (total > 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS order_lines (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price > 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'eft',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'proof_uploaded', 'confirmed', 'failed')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  proof_filename TEXT,
  proof_mime TEXT,
  proof_path TEXT,
  proof_uploaded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE orders FROM anon, authenticated;
REVOKE ALL ON TABLE order_lines FROM anon, authenticated;
REVOKE ALL ON TABLE payments FROM anon, authenticated;
GRANT ALL ON TABLE orders TO service_role;
GRANT ALL ON TABLE order_lines TO service_role;
GRANT ALL ON TABLE payments TO service_role;
