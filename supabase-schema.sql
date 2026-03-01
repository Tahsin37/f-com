-- ============================================================
-- F-MANAGER SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- ============================================================

-- SELLERS (multi-tenant: each seller gets a storefront)
CREATE TABLE IF NOT EXISTS sellers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  phone        TEXT,
  email        TEXT,
  logo_url     TEXT,
  plan         TEXT DEFAULT 'free',
  api_keys     JSONB DEFAULT '{}',
  settings     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sellers_user ON sellers(user_id);

-- PRODUCTS (dynamic category + JSONB metadata)
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id      UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'others',
  description    TEXT,
  buying_price   NUMERIC(10,2) DEFAULT 0,
  selling_price  NUMERIC(10,2) NOT NULL,
  discount       NUMERIC(5,2) DEFAULT 0,
  images         TEXT[] DEFAULT '{}',
  metadata       JSONB DEFAULT '{}',
  has_variants   BOOLEAN DEFAULT false,
  stock          INT DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);

-- VARIANTS (size/color with per-variant stock)
CREATE TABLE IF NOT EXISTS variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  sku         TEXT,
  stock       INT DEFAULT 0,
  price_override NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number   TEXT UNIQUE NOT NULL,
  seller_id      UUID REFERENCES sellers(id),
  customer_name  TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  delivery_area  TEXT DEFAULT 'dhaka',
  delivery_charge NUMERIC(10,2) DEFAULT 60,
  subtotal       NUMERIC(10,2) NOT NULL,
  total          NUMERIC(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  trx_id         TEXT,
  status         TEXT DEFAULT 'pending',
  otp_code       TEXT,
  otp_verified   BOOLEAN DEFAULT false,
  courier_awb    TEXT,
  courier_status TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone  ON orders(customer_phone);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  variant_id   UUID REFERENCES variants(id),
  product_name TEXT NOT NULL,
  variant_label TEXT,
  quantity     INT DEFAULT 1,
  unit_price   NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- BLACKLIST (fraud detection)
CREATE TABLE IF NOT EXISTS blacklist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone      TEXT NOT NULL,
  reason     TEXT,
  flagged_by UUID REFERENCES sellers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_blacklist_phone ON blacklist(phone);

-- POS SALES (Quick Sell)
CREATE TABLE IF NOT EXISTS pos_sales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number   TEXT UNIQUE NOT NULL,
  seller_id     UUID REFERENCES sellers(id),
  customer_name TEXT,
  items         JSONB NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- WORKERS (agent/team management with role-based permissions)
CREATE TABLE IF NOT EXISTS workers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id   UUID REFERENCES sellers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  permissions JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workers_seller ON workers(seller_id);

-- CUSTOM DOMAINS
CREATE TABLE IF NOT EXISTS domains (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id          UUID REFERENCES sellers(id) ON DELETE CASCADE,
  domain             TEXT UNIQUE NOT NULL,
  verified           BOOLEAN DEFAULT false,
  verification_token TEXT NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT now(),
  verified_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_domains_seller ON domains(seller_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);

-- COUPONS
CREATE TABLE IF NOT EXISTS coupons (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id          UUID REFERENCES sellers(id) ON DELETE CASCADE,
  code               TEXT NOT NULL,
  discount_type      TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value     NUMERIC(10,2) NOT NULL,
  min_order_amount   NUMERIC(10,2) DEFAULT 0,
  max_uses           INT,
  uses_count         INT DEFAULT 0,
  is_active          BOOLEAN DEFAULT true,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coupons_seller ON coupons(seller_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_seller ON coupons(seller_id, code);

-- ============================================================
-- SEED DATA: Demo seller + sample products
-- ============================================================

INSERT INTO sellers (id, name, slug, phone, email, plan, settings)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Sifr Style',
  'sifr-style',
  '01700000000',
  'hello@sifrstyle.com',
  'pro',
  '{"delivery_inside": 60, "delivery_outside": 120}'
) ON CONFLICT (id) DO NOTHING;

-- Sample products
INSERT INTO products (seller_id, name, category, selling_price, buying_price, discount, images, metadata, has_variants, stock) VALUES
('a0000000-0000-0000-0000-000000000001', 'Premium Cotton Panjabi - Midnight Blue', 'fashion', 1850, 1200, 15, ARRAY['https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=400&h=400'], '{"fabric":"Cotton","color":"Blue"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Classic Drop-Shoulder T-Shirt', 'fashion', 650, 350, 0, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400&h=400'], '{"fabric":"Cotton Blend"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Luxury Silk Saree with Embroidery', 'fashion', 4500, 3000, 10, ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400&h=400'], '{"fabric":"Silk","color":"Red"}', false, 15),
('a0000000-0000-0000-0000-000000000001', 'Minimalist Leather Wallet', 'fashion', 1200, 600, 0, ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400&h=400'], '{"material":"Leather"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Handloom Cotton Kurti - Rose', 'fashion', 980, 500, 18, ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=400&h=400'], '{"fabric":"Handloom Cotton","color":"Rose"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Sports Sneakers - Urban Grey', 'fashion', 2800, 1800, 12, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400&h=400'], '{"material":"Synthetic"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Embroidered Salwar Kameez', 'fashion', 3200, 2000, 0, ARRAY['https://images.unsplash.com/photo-1583391733975-0b3a4cf77496?auto=format&fit=crop&q=80&w=400&h=400'], '{"fabric":"Cotton"}', true, 0),
('a0000000-0000-0000-0000-000000000001', 'Premium Sunglasses - Aviator', 'fashion', 550, 250, 0, ARRAY['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400&h=400'], '{"material":"Polycarbonate"}', false, 20);

-- Now insert variants for products that have has_variants=true
-- We'll use a DO block to get the product IDs

DO $$
DECLARE
  pid UUID;
BEGIN
  -- Panjabi variants
  SELECT id INTO pid FROM products WHERE name LIKE '%Panjabi%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, 'M', 10), (pid, 'L', 8), (pid, 'XL', 5);
  END IF;

  -- T-Shirt variants
  SELECT id INTO pid FROM products WHERE name LIKE '%T-Shirt%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, 'L', 15), (pid, 'XL', 12);
  END IF;

  -- Wallet variants
  SELECT id INTO pid FROM products WHERE name LIKE '%Wallet%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, 'Black', 8), (pid, 'Brown', 5);
  END IF;

  -- Kurti variants
  SELECT id INTO pid FROM products WHERE name LIKE '%Kurti%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, 'S', 6), (pid, 'M', 10), (pid, 'L', 8);
  END IF;

  -- Sneakers variants
  SELECT id INTO pid FROM products WHERE name LIKE '%Sneakers%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, '40', 3), (pid, '42', 5), (pid, '44', 2);
  END IF;

  -- Salwar Kameez variants
  SELECT id INTO pid FROM products WHERE name LIKE '%Salwar%' AND seller_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1;
  IF pid IS NOT NULL THEN
    INSERT INTO variants (product_id, label, stock) VALUES (pid, 'M', 6), (pid, 'L', 4), (pid, 'XL', 3);
  END IF;
END $$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — allow read/write for anon
-- For demo purposes, we enable permissive policies
-- In production, replace with proper auth-based policies
-- ============================================================

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Permissive policies for demo (anon can do everything)
CREATE POLICY "Allow all for sellers" ON sellers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for variants" ON variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for blacklist" ON blacklist FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for pos_sales" ON pos_sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for workers" ON workers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for domains" ON domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

