/**
 * record-event-ticket
 *
 * Saves a ticket purchase after payment. For Stripe, verifies the session with
 * the Stripe API before writing. For PIX, creates a pending record. For free
 * (VIP/promoter) tickets, creates a confirmed record immediately.
 *
 * POST /.netlify/functions/record-event-ticket
 * Body (Stripe):
 *   { paymentMethod: 'stripe', sessionId: string }
 *   — attendee data is read from the Stripe session metadata
 *
 * Body (PIX / free):
 *   { paymentMethod: 'pix'|'free', fullName, cpf, whatsapp, email,
 *     tier, priceBrl, quantity, promoCode, promoterId? }
 *
 * Response:
 *   { success: true, ticketId: string, badgeUrl: string }
 */

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

// The barraca hosting Ryan's party — their loyalty card gets the ticket credit.
// Change this per event when other barracas host future parties.
const EVENT_PROMO_ID = 'escritorio120-follow';

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

// Increment used_count for codes with a usage cap (e.g. EARLYBIRD).
// Calls increment_promo_used_count() which does an atomic conditional UPDATE
// and returns false if the cap has already been reached.
async function incrementPromoUsage(
  supabase: ReturnType<typeof getClient>,
  code: string | null
): Promise<boolean> {
  if (!code) return true;
  const { data, error } = await (supabase.rpc as any)('increment_promo_used_count', { p_code: code });
  if (error) {
    // If the function doesn't exist (e.g. migration not yet run), fail open
    console.warn('increment_promo_used_count rpc error:', error.message);
    return true;
  }
  return data !== false;
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

  let body: Record<string, any> = {};
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const paymentMethod: string = body.paymentMethod || 'pix';

  try {
    const supabase = getClient();

    // ── Stripe: verify session & extract metadata ──────────────────────────
    if (paymentMethod === 'stripe') {
      const sessionId: string = body.sessionId || '';
      if (!sessionId) {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'sessionId required' }) };
      }

      // Avoid duplicate records
      const { data: existing } = await supabase
        .from('event_tickets')
        .select('id')
        .eq('stripe_session_id', sessionId)
        .single();

      if (existing) {
        const origin = event.headers.origin || 'https://cariocacoastalclub.com';
        return {
          statusCode: 200,
          headers: CORS,
          body: JSON.stringify({
            success:   true,
            ticketId:  existing.id,
            badgeUrl:  `${origin}/ryans-party-ticket`,
          }),
        };
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) throw new Error('STRIPE_SECRET_KEY not set');
      const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return { statusCode: 402, headers: CORS, body: JSON.stringify({ error: 'Payment not completed' }) };
      }

      const meta     = session.metadata || {};
      const quantity = parseInt(meta.quantity || '1', 10);
      const tier     = meta.tier || 'general';
      const promo    = (meta.promo_code || '').toUpperCase();

      // Resolve promoter_id if promo code maps to a promoter
      let promoterId: string | null = null;
      if (promo) {
        const { data: promoter } = await supabase
          .from('event_promoters')
          .select('id')
          .eq('code', promo)
          .eq('is_active', true)
          .single();
        if (promoter) promoterId = promoter.id;
      }

      const confirmationToken = randomUUID();
      const adminToken        = randomUUID();

      const { data: ticket, error } = await supabase
        .from('event_tickets')
        .insert({
          full_name:          meta.full_name || '',
          cpf:                meta.cpf        || null,
          whatsapp:           meta.whatsapp   || '',
          email:              session.customer_email || null,
          tier,
          price_paid_brl:     session.amount_total ?? 0,
          quantity,
          promo_code:         promo || null,
          promoter_id:        promoterId,
          payment_method:     'stripe',
          payment_status:     'confirmed',
          stripe_session_id:  sessionId,
          confirmation_token: confirmationToken,
          admin_token:        adminToken,
          promo_id:           EVENT_PROMO_ID,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Increment usage counter for capped promo codes (e.g. EARLYBIRD)
      await incrementPromoUsage(supabase, promo || null);

      const origin = event.headers.origin || 'https://cariocacoastalclub.com';
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          success:          true,
          ticketId:         ticket?.id,
          badgeUrl:         `${origin}/ryans-party-ticket`,
          confirmationToken,
          confirmationUrl:  `${origin}/confirm-ticket?token=${confirmationToken}`,
          adminToken,
          adminConfirmUrl:  `${origin}/admin-confirm?token=${adminToken}`,
        }),
      };
    }

    // ── PIX / Free: create record from body ───────────────────────────────
    const fullName  = (body.fullName  || '').trim();
    const whatsapp  = (body.whatsapp  || '').trim();
    const cpf       = (body.cpf       || '').replace(/\D/g, '') || null;
    const email     = (body.email     || '').trim() || null;
    const tier      = body.tier       || 'general';
    const priceBrl  = typeof body.priceBrl === 'number' ? body.priceBrl : 20000;
    const quantity  = Math.min(Math.max(parseInt(body.quantity) || 1, 1), 10);
    const promoCode = (body.promoCode || '').trim().toUpperCase() || null;
    const promoterId: string | null = body.promoterId || null;

    if (!fullName || !whatsapp) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'fullName and whatsapp are required' }) };
    }

    const status            = paymentMethod === 'free' ? 'confirmed' : 'pending';
    const confirmationToken = randomUUID();
    const adminToken        = randomUUID();

    const { data: ticket, error } = await supabase
      .from('event_tickets')
      .insert({
        full_name:          fullName,
        cpf,
        whatsapp,
        email,
        tier,
        price_paid_brl:     priceBrl,
        quantity,
        promo_code:         promoCode,
        promoter_id:        promoterId,
        payment_method:     paymentMethod,
        payment_status:     status,
        confirmation_token: confirmationToken,
        admin_token:        adminToken,
        promo_id:           EVENT_PROMO_ID,
      })
      .select('id')
      .single();

    if (error) throw error;

    // Increment usage counter for capped promo codes (e.g. EARLYBIRD)
    await incrementPromoUsage(supabase, promoCode);

    const origin = event.headers.origin || 'https://cariocacoastalclub.com';
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success:          true,
        ticketId:         ticket?.id,
        badgeUrl:         `${origin}/ryans-party-ticket`,
        confirmationToken,
        confirmationUrl:  `${origin}/confirm-ticket?token=${confirmationToken}`,
        adminToken,
        adminConfirmUrl:  `${origin}/admin-confirm?token=${adminToken}`,
      }),
    };

  } catch (err: any) {
    console.error('record-event-ticket error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Failed to record ticket' }),
    };
  }
};
