/**
 * validate-event-promo
 *
 * POST /.netlify/functions/validate-event-promo
 * Body: { code: string }
 *
 * Returns:
 *   { valid: true,  type: 'promoter'|'guest'|'vip', tier: string, priceBrl: number,
 *     promoterName?: string, promoterId?: string }
 *   { valid: false, error: string }
 */

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let code = '';
  try {
    const body = JSON.parse(event.body || '{}');
    code = (body.code || '').trim().toUpperCase();
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ valid: false, error: 'Invalid request body' }) };
  }

  if (!code) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ valid: false, error: 'Code is required' }) };
  }

  try {
    const supabase = getClient();

    // 1. Check promoter codes first
    const { data: promoter } = await supabase
      .from('event_promoters')
      .select('id, name, code, commission_rate_brl')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (promoter) {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          valid: true,
          type: 'promoter',
          tier: 'general',       // promoters still sell general tickets
          priceBrl: 10000,       // R$100 — full price, promoter earns commission
          promoterName: promoter.name,
          promoterId: promoter.id,
          message: `Code attributed to promoter ${promoter.name}`,
        }),
      };
    }

    // 2. Check guest/VIP unlock codes
    const { data: promoCode } = await supabase
      .from('event_promo_codes')
      .select('code, type')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (promoCode) {
      const isVip   = promoCode.type === 'vip';
      const isGuest = promoCode.type === 'guest';
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          valid:    true,
          type:     promoCode.type,
          tier:     isVip ? 'vip' : 'guest',
          priceBrl: isVip ? 0 : 5000,   // R$0 or R$50
          message:  isVip ? "VIP code — free entry!" : "Guest code — R$50 ticket",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ valid: false, error: 'Code not recognised' }),
    };
  } catch (err: any) {
    console.error('validate-event-promo error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ valid: false, error: 'Validation service error' }),
    };
  }
};
