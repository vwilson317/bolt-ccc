-- ─────────────────────────────────────────────────────────────────────────────
-- Admin confirmation token for PIX payments
-- ─────────────────────────────────────────────────────────────────────────────
-- admin_token is a UUID generated at ticket creation and included in the
-- WhatsApp message sent to the event owner (+16789826137).  The owner taps
-- the link, sees the ticket details, and confirms with a single button press —
-- no admin API key required in the URL.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE event_tickets
  ADD COLUMN IF NOT EXISTS admin_token TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS event_tickets_admin_token_idx
  ON event_tickets (admin_token)
  WHERE admin_token IS NOT NULL;
