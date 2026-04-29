-- Add optional per-code price override (centavos). NULL = use default for type.
ALTER TABLE event_promo_codes
  ADD COLUMN IF NOT EXISTS price_brl INTEGER;

-- Cap early bird at 5 (was 10)
UPDATE event_promo_codes
   SET max_uses = 5
 WHERE code = 'EARLYBIRD';

-- Anja guest code — R$80
INSERT INTO event_promo_codes (code, type, price_brl, is_active)
VALUES ('ANJA', 'guest', 8000, true)
ON CONFLICT (code) DO UPDATE
  SET price_brl = 8000, type = 'guest', is_active = true;
