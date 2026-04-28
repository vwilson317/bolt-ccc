/**
 * confirm-ticket-payment
 *
 * Admin endpoint to confirm a pending PIX payment.
 * Requires Authorization: Bearer <ADMIN_API_KEY>
 *
 * POST /.netlify/functions/confirm-ticket-payment
 * Body: { ticketId: string }
 *
 * Response: { success: true }
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
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const adminKey = process.env.ADMIN_API_KEY;
  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let ticketId = '';
  try {
    const body = JSON.parse(event.body || '{}');
    ticketId = body.ticketId || '';
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!ticketId) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'ticketId required' }) };
  }

  try {
    const supabase = getClient();
    const { error } = await supabase
      .from('event_tickets')
      .update({ payment_status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', ticketId);

    if (error) throw error;

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true }),
    };
  } catch (err: any) {
    console.error('confirm-ticket-payment error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Failed to confirm ticket' }),
    };
  }
};
