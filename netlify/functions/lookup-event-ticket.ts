/**
 * lookup-event-ticket
 *
 * GET /.netlify/functions/lookup-event-ticket?id=<cpf|whatsapp|email>
 *
 * Returns confirmed tickets matching the identifier.
 * No auth required — identifier is the "bearer token".
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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const raw = (event.queryStringParameters?.id || '').trim();
  if (!raw) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id query param required' }) };
  }

  try {
    const supabase = getClient();
    const digits   = raw.replace(/\D/g, '');
    const isEmail  = raw.includes('@');

    let query = supabase
      .from('event_tickets')
      .select('id, full_name, tier, quantity, payment_status, promo_code, promoter_id')
      .eq('payment_status', 'confirmed');

    if (isEmail) {
      query = query.eq('email', raw.toLowerCase());
    } else if (digits.length === 11) {
      // CPF
      query = query.eq('cpf', digits);
    } else {
      // WhatsApp — match raw or digits-only or +digits
      query = query.or(`whatsapp.eq.${raw},whatsapp.eq.${digits},whatsapp.eq.+${digits}`);
    }

    const { data: tickets, error } = await query;
    if (error) throw error;

    // Resolve promoter names
    const pIds = [...new Set((tickets || []).filter(t => t.promoter_id).map(t => t.promoter_id as string))];
    let promoters: { id: string; name: string }[] = [];
    if (pIds.length > 0) {
      const { data: pData } = await supabase
        .from('event_promoters')
        .select('id, name')
        .in('id', pIds);
      promoters = pData || [];
    }

    const result = (tickets || []).map(t => ({
      ...t,
      promoter_name: promoters.find(p => p.id === t.promoter_id)?.name ?? null,
    }));

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ tickets: result }),
    };
  } catch (err: any) {
    console.error('lookup-event-ticket error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: 'Lookup failed' }),
    };
  }
};
