/**
 * get-promoter-stats
 *
 * Returns a promoter's dashboard data — no auth required (data is not sensitive).
 * Promoters share the link; it only reveals their own stats.
 *
 * GET /.netlify/functions/get-promoter-stats?code=JOÃO10
 *
 * Response:
 *   { promoter: { name, code, commissionPerTicket },
 *     ticketsSold: number, totalCommission: number,
 *     shareMessage: string }
 */

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const code = ((event.queryStringParameters?.code) || '').trim().toUpperCase();
  if (!code) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'code query param required' }) };
  }

  try {
    const supabase = getClient();

    const { data: promoter, error: pErr } = await supabase
      .from('event_promoters')
      .select('id, name, code, commission_rate_brl')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (pErr || !promoter) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Promoter not found' }) };
    }

    // Count confirmed tickets attributed to this promoter
    const { data: tickets, error: tErr } = await supabase
      .from('event_tickets')
      .select('quantity')
      .eq('promoter_id', promoter.id)
      .eq('payment_status', 'confirmed');

    if (tErr) throw tErr;

    const ticketsSold = (tickets || []).reduce((sum, t) => sum + (t.quantity || 1), 0);
    const totalCommission = ticketsSold * promoter.commission_rate_brl;

    const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://cariocacoastalclub.com';
    const eventUrl = `${origin}/?promo=${encodeURIComponent(code)}`;
    const shareMessage =
      `🌴 Ryan's Going Away Party — May 1, Ipanema!\n` +
      `Get your ticket here 👇\n${eventUrl}\n` +
      `Use code *${code}* at checkout 🎉`;

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        promoter: {
          name:               promoter.name,
          code:               promoter.code,
          commissionPerTicket: promoter.commission_rate_brl,
        },
        ticketsSold,
        totalCommission,
        shareMessage,
      }),
    };
  } catch (err: any) {
    console.error('get-promoter-stats error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Failed to fetch promoter stats' }),
    };
  }
};
