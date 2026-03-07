-- ═══════════════════════════════════════════════════════════════════════════════
-- F-Manager: SMS Transactions Table + Orders Schema Updates for RuxSpeed
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Create sms_transactions table
CREATE TABLE IF NOT EXISTS sms_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    trx_id TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    sender_number TEXT,
    provider TEXT DEFAULT 'bKash',  -- bKash, Nagad, etc.
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT unique_trx_per_seller UNIQUE (seller_id, trx_id)
);

-- Index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_sms_trx_seller_trx ON sms_transactions(seller_id, trx_id);
CREATE INDEX IF NOT EXISTS idx_sms_trx_unused ON sms_transactions(seller_id, is_used) WHERE is_used = false;

-- RLS: Sellers can only see their own SMS transactions
ALTER TABLE sms_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own sms_transactions"
    ON sms_transactions FOR SELECT
    USING (seller_id IN (
        SELECT id FROM sellers WHERE user_id = auth.uid()
    ));

-- Allow API inserts (webhook is server-side with anon key + app_secret validation)
CREATE POLICY "Allow inserts from API"
    ON sms_transactions FOR INSERT
    WITH CHECK (true);


-- 2. Add partial payment columns to orders table (if not exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'advance_paid') THEN
        ALTER TABLE orders ADD COLUMN advance_paid NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'due_amount') THEN
        ALTER TABLE orders ADD COLUMN due_amount NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'provided_trx_id') THEN
        ALTER TABLE orders ADD COLUMN provided_trx_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'sender_number') THEN
        ALTER TABLE orders ADD COLUMN sender_number TEXT;
    END IF;
END $$;

-- Index for TrxID verification lookups
CREATE INDEX IF NOT EXISTS idx_orders_trx_lookup ON orders(seller_id, provided_trx_id) WHERE status = 'payment_pending';
