/**
 * admin-confirm-ticket
 *
 * Token-gated endpoint for the event owner to view and confirm PIX payments.
 * The admin_token is generated at ticket creation and sent in the attendee's
 * WhatsApp receipt message — no API key needed in the URL.
 *
 * GET  /.netlify/functions/admin-confirm-ticket?token=<ADMIN_TOKEN>
 *   → { ticket: { id, fullName, whatsapp, cpf, email, tier, quantity,
 *                 pricePaidBrl, paymentMethod, paymentStatus, promoCode,
 *                 createdAt } }
 *
 * POST /.netlify/functions/admin-confirm-ticket?token=<ADMIN_TOKEN>
 *   → { success: true, paymentStatus: 'confirmed' }
 *   → { success: false, error: 'already confirmed' }  (if already confirmed)
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
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const TIER_LABELS: Record<string, string> = {
  general:    'General Admission — R$100',
  guest:      "Ryan's Guest — R$50",
  vip:        "Ryan's VIP — Free",
  promoter:   'Promoter ticket — R$100',
  early_bird: 'Early Bird — Free',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  const token = (event.queryStringParameters?.token || '').trim();
  if (!token) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'token required' }) };
  }

  const supabase = getClient();

  // ── GET: return ticket details ──────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const { data: ticket, error } = await supabase
      .from('event_tickets')
      .select('id, full_name, whatsapp, cpf, email, tier, quantity, price_paid_brl, payment_method, payment_status, promo_code, created_at')
      .eq('admin_token', token)
      .single();

    if (error || !ticket) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Ticket not found' }) };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        ticket: {
          id:            ticket.id,
          fullName:      ticket.full_name,
          whatsapp:      ticket.whatsapp,
          cpf:           ticket.cpf,
          email:         ticket.email,
          tier:          ticket.tier,
          tierLabel:     TIER_LABELS[ticket.tier as string] ?? ticket.tier,
          quantity:      ticket.quantity,
          pricePaidBrl:  ticket.price_paid_brl,
          paymentMethod: ticket.payment_method,
          paymentStatus: ticket.payment_status,
          promoCode:     ticket.promo_code,
          createdAt:     ticket.created_at,
        },
      }),
    };
  }

  // ── POST: confirm the payment ───────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    const { data: ticket, error: fetchErr } = await supabase
      .from('event_tickets')
      .select('id, payment_status')
      .eq('admin_token', token)
      .single();

    if (fetchErr || !ticket) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Ticket not found' }) };
    }

    if (ticket.payment_status === 'confirmed') {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({ success: false, error: 'Payment already confirmed' }),
      };
    }

    const { error: updateErr } = await supabase
      .from('event_tickets')
      .update({ payment_status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', ticket.id);

    if (updateErr) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: updateErr.message }) };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ success: true, paymentStatus: 'confirmed' }),
    };
  }

  return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
};
