-- ─────────────────────────────────────────────────────────────────────────────
-- Early-bird promo support
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds:
--   max_uses   — optional cap on redemptions (NULL = unlimited)
--   used_count — atomic counter incremented when a ticket is recorded
-- Extends the type check to include 'early_bird'.
-- Inserts the EARLYBIRD code (10 free tickets for the first 10 claimants).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE event_promo_codes
  ADD COLUMN IF NOT EXISTS max_uses   INTEGER,
  ADD COLUMN IF NOT EXISTS used_count INTEGER NOT NULL DEFAULT 0;

-- Widen the type check to accept 'early_bird'
ALTER TABLE event_promo_codes
  DROP CONSTRAINT IF EXISTS event_promo_codes_type_check;

ALTER TABLE event_promo_codes
  ADD CONSTRAINT event_promo_codes_type_check
  CHECK (type IN ('guest', 'vip', 'early_bird'));

-- Seed the early-bird code (idempotent)
INSERT INTO event_promo_codes (code, type, max_uses, is_active)
VALUES ('EARLYBIRD', 'early_bird', 10, true)
ON CONFLICT (code) DO NOTHING;

-- ── Atomic usage-count increment ─────────────────────────────────────────────
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
