-- ─────────────────────────────────────────────────────────────────────────────
-- Ryan's Going Away Party — Event tables
-- ─────────────────────────────────────────────────────────────────────────────
-- Tables:
--   event_promoters    — promoter profiles with unique codes
--   event_promo_codes  — guest/VIP unlock codes
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
-- Codes that unlock discounted tiers (guest = R$150, vip = R$0).
-- Promoter codes live in event_promoters.code instead.
CREATE TABLE IF NOT EXISTS event_promo_codes (
  code        TEXT        PRIMARY KEY,                      -- e.g. RYAN-GUEST
  type        TEXT        NOT NULL CHECK (type IN ('guest', 'vip')),
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── event_tickets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_tickets (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  -- attendee
  full_name         TEXT        NOT NULL,
  cpf               TEXT,                                   -- digits only (normalized)
  whatsapp          TEXT        NOT NULL,                   -- E.164 or local
  email             TEXT,
  -- ticket
  tier              TEXT        NOT NULL CHECK (tier IN ('general', 'guest', 'vip', 'promoter')),
  price_paid_brl    INTEGER     NOT NULL DEFAULT 0,         -- in centavos (R$)
  quantity          INTEGER     NOT NULL DEFAULT 1,
  -- promo attribution
  promo_code        TEXT,
  promoter_id       UUID        REFERENCES event_promoters(id),
  -- payment
  payment_method    TEXT        CHECK (payment_method IN ('stripe', 'pix', 'free')),
  payment_status    TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded')),
  stripe_session_id TEXT,
  -- badge
  badge_claimed     BOOLEAN     NOT NULL DEFAULT false,
  -- internal
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
  ('price_general_brl',             '20000'),
  ('price_guest_brl',               '15000'),
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
