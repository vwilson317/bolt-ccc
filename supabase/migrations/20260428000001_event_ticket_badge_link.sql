-- ─────────────────────────────────────────────────────────────────────────────
-- Event ticket → loyalty badge link
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds:
--   confirmation_token  — unique token for self-service badge claim links
--   promo_id            — which barraca loyalty card to credit (e.g. escritorio120-follow)
--   badge_linked_at     — when the user confirmed and the badge was written to promo_claims
--
-- This pattern is generic: any future barraca event just needs a different promo_id
-- on its tickets and the claim-event-badge function handles the rest.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE event_tickets
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT,
  ADD COLUMN IF NOT EXISTS promo_id           TEXT,
  ADD COLUMN IF NOT EXISTS badge_linked_at    TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS event_tickets_confirmation_token_idx
  ON event_tickets (confirmation_token)
  WHERE confirmation_token IS NOT NULL;
