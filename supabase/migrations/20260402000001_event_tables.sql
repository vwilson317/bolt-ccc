-- ─────────────────────────────────────────────────────────────────────────────
-- Ryan's Going Away Party — Event tables
-- ─────────────────────────────────────────────────────────────────────────────
-- Tables:
--   event_promoters    — promoter profiles with unique codes
--   event_promo_codes  — guest/VIP/early-bird unlock codes (with usage caps)
--   event_tickets      — ticket purchases
--   event_config       — admin-editable key/value config (costs, ticket cap)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── event_promoters ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_promoters (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name                TEXT        NOT NULL,
  code                TEXT        UNIQUE NOT NULL,          -- e.g. JOÃO10
  commission_rate_brl INTEGER     NOT NULL DEFAULT 25,      -- R$ per ticket sold
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── event_promo_codes ────────────────────────────────────────────────────────
-- Codes that unlock discounted/free tiers.
--   guest      → R$50
--   vip        → R$0 (unlimited)
--   early_bird → R$0 (capped via max_uses)
-- Promoter codes live in event_promoters.code instead.
CREATE TABLE IF NOT EXISTS event_promo_codes (
  code        TEXT        PRIMARY KEY,                      -- e.g. RYAN-GUEST
  type        TEXT        NOT NULL CHECK (type IN ('guest', 'vip', 'early_bird')),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  max_uses    INTEGER,                                      -- NULL = unlimited
  used_count  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed the early-bird promo (10 free tickets)
INSERT INTO event_promo_codes (code, type, max_uses, is_active)
VALUES ('EARLYBIRD', 'early_bird', 10, true)
ON CONFLICT (code) DO NOTHING;

-- ── event_tickets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_tickets (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- attendee
  full_name           TEXT        NOT NULL,
  cpf                 TEXT,                                 -- digits only (normalized)
  whatsapp            TEXT        NOT NULL,                 -- E.164 or local
  email               TEXT,
  -- ticket
  tier                TEXT        NOT NULL CHECK (tier IN ('general', 'guest', 'vip', 'promoter', 'early_bird')),
  price_paid_brl      INTEGER     NOT NULL DEFAULT 0,       -- in centavos (R$)
  quantity            INTEGER     NOT NULL DEFAULT 1,
  -- promo attribution
  promo_code          TEXT,
  promoter_id         UUID        REFERENCES event_promoters(id),
  -- payment
  payment_method      TEXT        CHECK (payment_method IN ('stripe', 'pix', 'free')),
  payment_status      TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded')),
  stripe_session_id   TEXT,
  -- badge / loyalty card link
  badge_claimed       BOOLEAN     NOT NULL DEFAULT false,
  confirmation_token  TEXT        UNIQUE,                   -- attendee's badge-claim token
  admin_token         TEXT        UNIQUE,                   -- owner's one-tap payment-confirm token
  promo_id            TEXT,                                 -- barraca loyalty card to credit (e.g. escritorio120-follow)
  badge_linked_at     TIMESTAMPTZ,                          -- when the loyalty badge was written
  -- internal
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── event_config ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_config (
  key         TEXT    PRIMARY KEY,
  value       TEXT    NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO event_config (key, value) VALUES
  ('ticket_cap',                    '100'),
  ('cost_band_brl',                 '4500'),
  ('cost_dj_brl',                   '300'),
  ('cost_bundle_per_person_brl',    '100'),
  ('cost_promo_local_brl',          '500'),
  ('cost_promo_instagram_brl',      '530'),
  ('price_general_brl',             '10000'),
  ('price_guest_brl',               '5000'),
  ('price_vip_brl',                 '0'),
  ('promoter_commission_brl',       '2500')
ON CONFLICT (key) DO NOTHING;

-- ── Access: all DB access goes through Netlify functions (service role key)
-- No RLS needed — functions handle all reads and writes directly.

-- ── Updated-at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_event_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER event_promoters_updated_at
  BEFORE UPDATE ON event_promoters
  FOR EACH ROW EXECUTE FUNCTION update_event_updated_at();

CREATE TRIGGER event_tickets_updated_at
  BEFORE UPDATE ON event_tickets
  FOR EACH ROW EXECUTE FUNCTION update_event_updated_at();

-- ── Atomic promo usage increment ─────────────────────────────────────────────
-- Returns TRUE if the increment succeeded, FALSE if the cap was already hit.
-- Called by record-event-ticket after a ticket is saved.
CREATE OR REPLACE FUNCTION increment_promo_used_count(p_code TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE event_promo_codes
  SET    used_count = used_count + 1
  WHERE  code = p_code
    AND  is_active = true
    AND  (max_uses IS NULL OR used_count < max_uses);

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$;
