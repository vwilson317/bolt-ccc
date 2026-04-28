/**
 * barraca-promo-config — Admin REST API
 *
 * Lets the admin application read and toggle the active status of every
 * barraca promo without requiring a code deploy.  The runtime `active` value
 * lives in the `barraca_promos` Supabase table; the static config in
 * barracaPromos.ts is the fallback default when no DB row exists yet.
 *
 * ─── Endpoints ──────────────────────────────────────────────────────────────
 *
 *  GET  /.netlify/functions/barraca-promo-config
 *       Returns all promos with their current active status.
 *       Response: { promos: BarracaPromoStatus[] }
 *
 *  PATCH /.netlify/functions/barraca-promo-config
 *        Toggle/set active for one promo.
 *        Body:     { id: string, active: boolean }
 *        Response: { promo: BarracaPromoStatus }
 *
 * ─── Authentication ──────────────────────────────────────────────────────────
 *
 *  Every request must include:
 *    Authorization: Bearer <ADMIN_API_KEY>
 *
 *  Set ADMIN_API_KEY in Netlify → Site Settings → Environment Variables.
 *  Use any strong random string (e.g. `openssl rand -hex 32`).
 *
 * ─── Required env vars ───────────────────────────────────────────────────────
 *
 *  ADMIN_API_KEY              Secret bearer token for the admin app
 *  SUPABASE_URL               Project URL  (same value as VITE_SUPABASE_URL)
 *  SUPABASE_ANON_KEY          Anon key (or VITE_SUPABASE_ANON_KEY as fallback)
 *  ADMIN_CORS_ORIGIN          (optional) Restrict CORS to a specific admin domain,
 *                             e.g. https://admin.cariocacoastalclub.com
 *                             Defaults to * when unset.
 *
 * ─── Database setup ──────────────────────────────────────────────────────────
 *
 *  Run the migration in supabase/migrations/barraca_promos.sql before first use.
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { BARRACA_PROMOS } from '../../src/data/barracaPromos';

// ---------------------------------------------------------------------------
// Supabase client
// ---------------------------------------------------------------------------
function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables.',
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Shape returned to the admin app
// ---------------------------------------------------------------------------
interface BarracaPromoStatus {
  id: string;
  slug: string;
  name: string;
  instagramHandle: string;
  discountCode: string;
  barracaLocation: string;
  active: boolean;
  /** "database" when the value comes from Supabase, "static_default" otherwise */
  activeSource: 'database' | 'static_default';
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Merge static config with DB rows
// ---------------------------------------------------------------------------
interface DbRow {
  id: string;
  active: boolean;
  updated_at: string;
}

function mergeWithDb(rows: DbRow[]): BarracaPromoStatus[] {
  const byId = new Map(rows.map((r) => [r.id, r]));

  return BARRACA_PROMOS.map((cfg) => {
    const row = byId.get(cfg.id);
    return {
      id: cfg.id,
      slug: cfg.slug,
      name: cfg.name,
      instagramHandle: cfg.instagramHandle,
      discountCode: cfg.discountCode,
      barracaLocation: cfg.barracaLocation,
      active: row ? row.active : cfg.active,
      activeSource: row ? 'database' : 'static_default',
      updatedAt: row ? row.updated_at : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------
function isAuthorized(event: HandlerEvent): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false; // misconfigured — fail closed
  const header =
    event.headers['authorization'] || event.headers['Authorization'] || '';
  return header === `Bearer ${adminKey}`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export const handler: Handler = async (event: HandlerEvent) => {
  const corsOrigin = process.env.ADMIN_CORS_ORIGIN || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  // Auth
  if (!isAuthorized(event)) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unauthorized. Provide a valid Bearer token.' }),
    };
  }

  // ── GET — list all promos ────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    try {
      const supabase = getAdminClient();
      const { data, error } = await supabase
        .from('barraca_promos')
        .select('id, active, updated_at');

      if (error) throw error;

      const promos = mergeWithDb((data as DbRow[]) ?? []);

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ promos }),
      };
    } catch (err) {
      console.error('barraca-promo-config GET error:', err);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Failed to fetch promo config.',
          detail: err instanceof Error ? err.message : String(err),
        }),
      };
    }
  }

  // ── PATCH — toggle active for one promo ─────────────────────────────────
  if (event.httpMethod === 'PATCH') {
    let id: string | undefined;
    let active: boolean | undefined;

    try {
      const body = JSON.parse(event.body || '{}');
      id = body.id;
      active = body.active;
    } catch {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid JSON body.' }),
      };
    }

    // Validate
    if (!id || typeof active !== 'boolean') {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Body must include "id" (string) and "active" (boolean).',
        }),
      };
    }

    const knownIds = BARRACA_PROMOS.map((b) => b.id);
    if (!knownIds.includes(id)) {
      return {
        statusCode: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: `Unknown promo id "${id}". Known ids: ${knownIds.join(', ')}`,
        }),
      };
    }

    try {
      const supabase = getAdminClient();
      const { error } = await supabase.from('barraca_promos').upsert(
        { id, active, updated_at: new Date().toISOString() },
        { onConflict: 'id' },
      );

      if (error) throw error;

      // Return the full merged state for the affected promo
      const { data: rows } = await supabase
        .from('barraca_promos')
        .select('id, active, updated_at');

      const all = mergeWithDb((rows as DbRow[]) ?? []);
      const updated = all.find((p) => p.id === id);

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo: updated }),
      };
    } catch (err) {
      console.error('barraca-promo-config PATCH error:', err);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Failed to update promo config.',
          detail: err instanceof Error ? err.message : String(err),
        }),
      };
    }
  }

  return {
    statusCode: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Method not allowed. Use GET or PATCH.' }),
  };
};
