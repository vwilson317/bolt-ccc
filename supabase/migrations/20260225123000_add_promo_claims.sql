/*
  # Add promo_claims table for reusable promo badge access

  - Stores identifier-based promo claims (email or phone)
  - Supports lookup so returning users can restore badge access
  - Keeps promo-specific uniqueness on normalized identifier
*/

CREATE TABLE IF NOT EXISTS promo_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_id TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'phone')),
  identifier_value TEXT NOT NULL,
  identifier_normalized TEXT NOT NULL,
  instagram_follow_confirmed BOOLEAN NOT NULL DEFAULT false,
  badge_unlocked BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_claims_promo_identifier_unique
  ON promo_claims (promo_id, identifier_normalized);

CREATE INDEX IF NOT EXISTS idx_promo_claims_promo_id
  ON promo_claims (promo_id);

CREATE INDEX IF NOT EXISTS idx_promo_claims_identifier_normalized
  ON promo_claims (identifier_normalized);

ALTER TABLE promo_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read promo claims" ON promo_claims;
DROP POLICY IF EXISTS "Allow public insert promo claims" ON promo_claims;
DROP POLICY IF EXISTS "Allow public update promo claims" ON promo_claims;

CREATE POLICY "Allow public read promo claims" ON promo_claims
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert promo claims" ON promo_claims
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update promo claims" ON promo_claims
  FOR UPDATE USING (true);

CREATE OR REPLACE FUNCTION set_promo_claims_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_promo_claims_updated_at_trigger ON promo_claims;
CREATE TRIGGER set_promo_claims_updated_at_trigger
  BEFORE UPDATE ON promo_claims
  FOR EACH ROW
  EXECUTE FUNCTION set_promo_claims_updated_at();
