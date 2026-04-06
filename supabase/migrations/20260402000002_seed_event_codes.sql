-- ── Seed: Ryan's Going Away Party promo codes ────────────────────
-- Guest codes  → R$150 (Ryan's friends)
-- VIP codes    → Free  (Ryan's inner circle)

INSERT INTO event_promo_codes (code, type) VALUES
  ('AMIGO',    'guest'),   -- share with friends who get the discount
  ('RYANVIP',  'vip'),     -- Ryan's inner circle — free entry
  ('RSVP150',  'guest')    -- alternate guest code
ON CONFLICT (code) DO NOTHING;
