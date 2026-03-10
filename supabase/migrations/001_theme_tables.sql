-- ═══════════════════════════════════════════════════════════════════════════════
-- F-Manager: Theme System Migration
-- Creates themes, theme_history, audit_logs tables + RLS policies
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Themes Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS themes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id   UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL,
    author      TEXT DEFAULT 'Custom',
    version     TEXT DEFAULT '1.0.0',
    preview_image TEXT,
    tokens      JSONB NOT NULL DEFAULT '{}',
    components  JSONB NOT NULL DEFAULT '{}',
    assets      JSONB NOT NULL DEFAULT '{}',
    safe_css    TEXT DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'pending_review', 'rejected', 'approved')),
    risk_score  REAL DEFAULT 0,
    source      TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import_json', 'import_html', 'import_zip', 'ai_generated')),
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_themes_seller ON themes(seller_id);
CREATE INDEX IF NOT EXISTS idx_themes_status ON themes(status);

-- ─── Theme History (for rollback) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS theme_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id   UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    theme_id    UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
    action      TEXT NOT NULL CHECK (action IN ('applied', 'reverted', 'updated')),
    snapshot    JSONB DEFAULT '{}',
    applied_at  TIMESTAMPTZ DEFAULT now(),
    reverted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_theme_history_seller ON theme_history(seller_id);

-- ─── Audit Logs ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id   UUID REFERENCES sellers(id) ON DELETE SET NULL,
    user_id     UUID,
    action      TEXT NOT NULL,
    resource    TEXT,
    metadata    JSONB DEFAULT '{}',
    ip          TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_seller ON audit_logs(seller_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ─── Add active_theme_id to sellers ────────────────────────────────────────────
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'sellers' AND column_name = 'active_theme_id'
    ) THEN
        ALTER TABLE sellers ADD COLUMN active_theme_id UUID REFERENCES themes(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ─── RLS Policies ──────────────────────────────────────────────────────────────
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE theme_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Themes: sellers can only CRUD their own themes
CREATE POLICY "Sellers can view own themes"
    ON themes FOR SELECT
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can create own themes"
    ON themes FOR INSERT
    WITH CHECK (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can update own themes"
    ON themes FOR UPDATE
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can delete own themes"
    ON themes FOR DELETE
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Theme History: sellers can only view their own
CREATE POLICY "Sellers can view own theme history"
    ON theme_history FOR SELECT
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "Sellers can create own theme history"
    ON theme_history FOR INSERT
    WITH CHECK (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

-- Audit Logs: sellers can view their own logs
CREATE POLICY "Sellers can view own audit logs"
    ON audit_logs FOR SELECT
    USING (seller_id IN (SELECT id FROM sellers WHERE user_id = auth.uid()));

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ─── Updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER themes_updated_at
    BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
