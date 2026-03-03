-- ─────────────────────────────────────────────────────────────────────────────
-- barraca_promos — runtime toggle table for CCC barraca promo active status
--
-- HOW TO RUN
--   Option A (recommended): Supabase Dashboard
--     1. Go to your project → SQL Editor
--     2. Paste this entire file and click Run
--
--   Option B: Supabase CLI
--     supabase db push  (if using local dev / linked project)
--
-- WHAT THIS DOES
--   Creates a lightweight table where each row represents a barraca promo.
--   The admin API (netlify/functions/barraca-promo-config.ts) writes here;
--   the frontend reads here to determine whether to show the promo or not.
--
--   The static `active` field in src/data/barracaPromos.ts is the fallback
--   default — it is used when no DB row exists for a given promo ID.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.barraca_promos (
  id          TEXT        PRIMARY KEY,          -- matches BarracaPromoConfig.id
  active      BOOLEAN     NOT NULL DEFAULT true,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.barraca_promos IS
  'Runtime on/off toggle for each barraca promo. Managed by the admin API.';

COMMENT ON COLUMN public.barraca_promos.id IS
  'Must match an id in src/data/barracaPromos.ts (e.g. "thais-follow").';

COMMENT ON COLUMN public.barraca_promos.active IS
  'true = promo is live; false = promo is paused/coming-soon.';

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Anyone (including anonymous browser users) can read active status.
-- Only the service-role key (used by the Netlify admin function) can write.

ALTER TABLE public.barraca_promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access"
  ON public.barraca_promos
  FOR SELECT
  USING (true);

-- No INSERT / UPDATE / DELETE policy for anon/authenticated roles.
-- The admin Netlify function uses the service-role key which bypasses RLS.

-- ─── Seed initial rows ────────────────────────────────────────────────────────
-- These match the static config in src/data/barracaPromos.ts.
-- Insert only when the row doesn't already exist so this is idempotent.

INSERT INTO public.barraca_promos (id, active)
VALUES
  ('thais-follow',      true),
  ('marcinho33-follow', true),
  ('nino101-follow',    true)
ON CONFLICT (id) DO NOTHING;
