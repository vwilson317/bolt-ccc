/**
 * claim-event-badge
 *
 * Called when an attendee clicks their self-service confirmation link.
 * Looks up the ticket by its confirmation_token, writes a promo_claims
 * entry for the linked barraca loyalty card, and returns enough data for
 * the frontend to unlock the badge in localStorage.
 *
 * Works for any barraca loyalty card — the promo_id on the ticket record
 * determines which card gets credited.  Defaults to escritorio120-follow
 * for the current Ryan's party (Escritório Carioca is the host barraca).
 *
 * GET /.netlify/functions/claim-event-badge?token=<CONFIRMATION_TOKEN>
 *
 * Response:
 *   {
 *     success: true,
 *     ticket:  { fullName, tier, quantity, paymentStatus },
 *     badge:   { promoId, storageKey, identifierStorageKey, identifier },
 *     alreadyClaimed: boolean
 *   }
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

// Mirrors PromoClaimService.normalizeIdentifier — kept in sync manually
// since Netlify functions can't import frontend services.
function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

function getIdentifier(
  whatsapp: string,
  cpf: string | null,
  email: string | null
): { type: string; value: string; normalized: string } | null {
  if (whatsapp && whatsapp.trim()) {
    const v = whatsapp.trim();
    return { type: 'phone', value: v, normalized: normalizePhone(v) };
  }
  if (cpf && cpf.trim()) {
    const digits = cpf.replace(/\D/g, '');
    return { type: 'cpf', value: cpf.trim(), normalized: digits };
  }
  if (email && email.trim()) {
    const v = email.trim().toLowerCase();
    return { type: 'email', value: v, normalized: v };
  }
  return null;
}

// Maps promo_id → { storageKey, identifierStorageKey }
// Add new entries here when other barracas start hosting events.
const BADGE_STORAGE_KEYS: Record<string, { storageKey: string; identifierStorageKey: string }> = {
  'escritorio120-follow': {
    storageKey:           'ccc_badge_escritorio120-follow',
    identifierStorageKey: 'ccc_identifier_escritorio120-follow',
  },
  'barraca155-follow': {
    storageKey:           'ccc_badge_barraca155-follow',
    identifierStorageKey: 'ccc_identifier_barraca155-follow',
  },
  'thais-follow': {
    storageKey:           'ccc_thais_follow_badge_unlocked',
    identifierStorageKey: 'ccc_thais_follow_identifier',
  },
  'marcinho33-follow': {
    storageKey:           'ccc_badge_marcinho33-follow',
    identifierStorageKey: 'ccc_identifier_marcinho33-follow',
  },
  'miriam53-follow': {
    storageKey:           'ccc_badge_miriam53-follow',
    identifierStorageKey: 'ccc_identifier_miriam53-follow',
  },
  'nino101-follow': {
    storageKey:           'ccc_badge_nino101-follow',
    identifierStorageKey: 'ccc_identifier_nino101-follow',
  },
  'joseantonio7-follow': {
    storageKey:           'ccc_badge_joseantonio7-follow',
    identifierStorageKey: 'ccc_identifier_joseantonio7-follow',
  },
  'jota86x-follow': {
    storageKey:           'ccc_badge_jota86x-follow',
    identifierStorageKey: 'ccc_identifier_jota86x-follow',
  },
  'hulk202-follow': {
    storageKey:           'ccc_badge_hulk202-follow',
    identifierStorageKey: 'ccc_identifier_hulk202-follow',
  },
  'ecologica26-follow': {
    storageKey:           'ccc_badge_ecologica26-follow',
    identifierStorageKey: 'ccc_identifier_ecologica26-follow',
  },
  'negao85-follow': {
    storageKey:           'ccc_badge_negao85-follow',
    identifierStorageKey: 'ccc_identifier_negao85-follow',
  },
};

const DEFAULT_PROMO_ID = 'escritorio120-follow';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const token = (event.queryStringParameters?.token || '').trim();
  if (!token) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'token required' }) };
  }

  try {
    const supabase = getClient();

    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select('id, full_name, cpf, whatsapp, email, tier, quantity, payment_status, promo_id, badge_linked_at, created_at')
      .eq('confirmation_token', token)
      .single();

    if (ticketError || !ticket) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: 'Ticket not found or link expired' }) };
    }

    const promoId      = (ticket.promo_id as string | null) || DEFAULT_PROMO_ID;
    const storageKeys  = BADGE_STORAGE_KEYS[promoId] ?? BADGE_STORAGE_KEYS[DEFAULT_PROMO_ID];
    const alreadyClaimed = !!ticket.badge_linked_at;
    const id           = getIdentifier(ticket.whatsapp, ticket.cpf, ticket.email);

    if (id) {
      // Upsert the promo_claims row — this is what "updates the loyalty card"
      const metadata = {
        event_name:   "Ryan's Going Away Party",
        event_date:   '2026-05-03',
        event_slug:   'ryans-farewell-party',
        tier:         ticket.tier,
        ticket_id:    ticket.id,
        quantity:     ticket.quantity,
        confirmed_at: new Date().toISOString(),
      };

      await supabase
        .from('promo_claims')
        .upsert(
          {
            promo_id:                   promoId,
            identifier_type:            id.type,
            identifier_value:           id.value,
            identifier_normalized:      id.normalized,
            instagram_follow_confirmed: false,
            badge_unlocked:             true,
            metadata,
            last_claimed_at:            new Date().toISOString(),
          },
          { onConflict: 'promo_id,identifier_normalized' }
        );

      if (!alreadyClaimed) {
        await supabase
          .from('event_tickets')
          .update({ badge_linked_at: new Date().toISOString() })
          .eq('id', ticket.id);
      }
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        ticket: {
          fullName:      ticket.full_name,
          tier:          ticket.tier,
          quantity:      ticket.quantity,
          paymentStatus: ticket.payment_status,
          eventName:     "Ryan's Going Away Party",
          eventDate:     '2026-05-03',
        },
        badge: {
          promoId,
          storageKey:           storageKeys.storageKey,
          identifierStorageKey: storageKeys.identifierStorageKey,
          identifier:           id?.value || '',
        },
        alreadyClaimed,
      }),
    };
  } catch (err: any) {
    console.error('claim-event-badge error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Failed to claim badge' }),
    };
  }
};
