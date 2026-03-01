-- F-Manager Production Migration
-- Run in Supabase SQL Editor

-- 1. Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    banner_image TEXT,
    discount_percent NUMERIC DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    product_ids UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Order tracking table
CREATE TABLE IF NOT EXISTS order_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 Custom Domains table
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

-- 2.6 Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id          UUID REFERENCES sellers(id) ON DELETE CASCADE,
  code               TEXT NOT NULL,
  discount_type      TEXT NOT NULL DEFAULT 'percentage',
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

-- 3. Atomic stock decrement function
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id UUID, p_variant_id UUID, p_qty INT)
RETURNS VOID AS $$
BEGIN
    IF p_variant_id IS NOT NULL THEN
        UPDATE variants SET stock = stock - p_qty WHERE id = p_variant_id AND stock >= p_qty;
        IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient variant stock'; END IF;
    ELSE
        UPDATE products SET stock = stock - p_qty WHERE id = p_product_id AND stock >= p_qty;
        IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient product stock'; END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. RLS Policies
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_tracking ENABLE ROW LEVEL SECURITY;

-- Sellers: owner can read/write own row, public can read by slug
CREATE POLICY "sellers_owner_all" ON sellers FOR ALL USING (user_id = auth.uid());
CREATE POLICY "sellers_public_read" ON sellers FOR SELECT USING (true);

-- Products: seller can manage, public can read active
CREATE POLICY "products_seller_all" ON products FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));
CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true);

-- Orders: seller can manage their orders, public can insert (checkout)
CREATE POLICY "orders_seller_all" ON orders FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);

-- Order items: follow order access
CREATE POLICY "order_items_seller_read" ON order_items FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
CREATE POLICY "order_items_public_insert" ON order_items FOR INSERT WITH CHECK (true);

-- Workers: seller can manage
CREATE POLICY "workers_seller_all" ON workers FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Campaigns: seller can manage
CREATE POLICY "campaigns_seller_all" ON campaigns FOR ALL USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Order tracking: seller can view, system can insert
CREATE POLICY "tracking_seller_read" ON order_tracking FOR SELECT USING (order_id IN (SELECT id FROM orders WHERE seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid())));
CREATE POLICY "tracking_public_insert" ON order_tracking FOR INSERT WITH CHECK (true);

-- Domains: permissive policy for demo mode matching others
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "domains_public_all" ON domains FOR ALL USING (true);

-- Coupons: permissive policy for demo mode matching others
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons_public_all" ON coupons FOR ALL USING (true);
