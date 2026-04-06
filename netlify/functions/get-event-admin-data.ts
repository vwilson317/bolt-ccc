/**
 * get-event-admin-data
 *
 * Returns full event stats for the admin dashboard.
 * Requires Authorization: Bearer <ADMIN_API_KEY>
 *
 * GET  /.netlify/functions/get-event-admin-data
 *   Returns aggregate stats, promoter breakdown, guest list
 *
 * POST /.netlify/functions/get-event-admin-data
 *   Body: { action: 'update_config', key: string, value: string }
 *   Updates event_config key
 *
 *   Body: { action: 'create_promoter', name: string, code: string, commissionRate?: number }
 *   Creates a new promoter
 *
 *   Body: { action: 'create_promo_code', code: string, type: 'guest'|'vip' }
 *   Creates a guest or VIP unlock code
 *
 *   Body: { action: 'toggle_promoter', id: string, isActive: boolean }
 *   Enables/disables a promoter
 */

import type { Handler, HandlerEvent } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars');
  return createClient(url, key, { auth: { persistSession: false } });
}

function isAuthorized(event: HandlerEvent): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const header = event.headers['authorization'] || event.headers['Authorization'] || '';
  return header === `Bearer ${adminKey}`;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };

  if (!isAuthorized(event)) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const supabase = getClient();

    // ── POST: mutations ──────────────────────────────────────────────────────
    if (event.httpMethod === 'POST') {
      let body: Record<string, any> = {};
      try { body = JSON.parse(event.body || '{}'); } catch {
        return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Invalid JSON' }) };
      }

      const action: string = body.action || '';

      if (action === 'update_config') {
        const { key, value } = body;
        if (!key || value === undefined) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'key and value required' }) };
        }
        await supabase.from('event_config').upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
      }

      if (action === 'create_promoter') {
        const { name, code, commissionRate } = body;
        if (!name || !code) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'name and code required' }) };
        }
        const { data, error } = await supabase
          .from('event_promoters')
          .insert({ name, code: code.toUpperCase(), commission_rate_brl: commissionRate || 25 })
          .select('*')
          .single();
        if (error) throw error;
        return { statusCode: 201, headers: CORS, body: JSON.stringify({ success: true, promoter: data }) };
      }

      if (action === 'create_promo_code') {
        const { code, type } = body;
        if (!code || !type) {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'code and type required' }) };
        }
        const { data, error } = await supabase
          .from('event_promo_codes')
          .insert({ code: code.toUpperCase(), type })
          .select('*')
          .single();
        if (error) throw error;
        return { statusCode: 201, headers: CORS, body: JSON.stringify({ success: true, promoCode: data }) };
      }

      if (action === 'toggle_promoter') {
        const { id, isActive } = body;
        if (!id || typeof isActive !== 'boolean') {
          return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'id and isActive required' }) };
        }
        await supabase.from('event_promoters').update({ is_active: isActive }).eq('id', id);
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
      }

      if (action === 'delete_promo_code') {
        const { code } = body;
        await supabase.from('event_promo_codes').update({ is_active: false }).eq('code', code.toUpperCase());
        return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
      }

      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    // ── GET: full dashboard data ─────────────────────────────────────────────
    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    // Fetch all tickets
    const { data: tickets } = await supabase
      .from('event_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all promoters
    const { data: promoters } = await supabase
      .from('event_promoters')
      .select('*')
      .order('created_at', { ascending: true });

    // Fetch promo codes
    const { data: promoCodes } = await supabase
      .from('event_promo_codes')
      .select('*')
      .order('created_at', { ascending: true });

    // Fetch config
    const { data: configRows } = await supabase
      .from('event_config')
      .select('key, value');

    const config: Record<string, string> = {};
    (configRows || []).forEach(r => { config[r.key] = r.value; });

    const allTickets = tickets || [];
    const confirmed  = allTickets.filter(t => t.payment_status === 'confirmed');
    const pending    = allTickets.filter(t => t.payment_status === 'pending');

    // Totals by tier (confirmed only)
    const byTier: Record<string, number> = {};
    confirmed.forEach(t => {
      const tier = t.tier || 'general';
      byTier[tier] = (byTier[tier] || 0) + (t.quantity || 1);
    });

    const totalConfirmed   = confirmed.reduce((s, t) => s + (t.quantity || 1), 0);
    const totalRevenueBrl  = confirmed.reduce((s, t) => s + ((t.price_paid_brl || 0) * (t.quantity || 1)), 0);
    const ticketCapRaw     = parseInt(config['ticket_cap'] || '100', 10);

    // Costs
    const costBandBrl     = parseFloat(config['cost_band_brl']              || '4500');
    const costDjBrl       = parseFloat(config['cost_dj_brl']                || '300');
    const costBundleBrl   = parseFloat(config['cost_bundle_per_person_brl'] || '100');
    const costPromoLocal  = parseFloat(config['cost_promo_local_brl']       || '500');
    const costPromoInsta  = parseFloat(config['cost_promo_instagram_brl']   || '530');

    const totalBundleCost      = totalConfirmed * costBundleBrl;
    const totalPromoCommission = confirmed
      .filter(t => t.promoter_id)
      .reduce((s, t) => {
        const p = (promoters || []).find(p => p.id === t.promoter_id);
        return s + (p ? p.commission_rate_brl * (t.quantity || 1) : 0);
      }, 0);

    const totalCostsBrl  = costBandBrl + costDjBrl + totalBundleCost + costPromoLocal + costPromoInsta + totalPromoCommission;
    const profitLossBrl  = totalRevenueBrl - totalCostsBrl;

    // Promoter breakdown
    const promoterBreakdown = (promoters || []).map(p => {
      const pTickets = confirmed.filter(t => t.promoter_id === p.id);
      const sold = pTickets.reduce((s, t) => s + (t.quantity || 1), 0);
      const commission = sold * p.commission_rate_brl;
      return {
        id:               p.id,
        name:             p.name,
        code:             p.code,
        commissionRate:   p.commission_rate_brl,
        isActive:         p.is_active,
        ticketsSold:      sold,
        totalCommission:  commission,
      };
    });

    // Guest list (name, whatsapp, tier, promoter)
    const guestList = allTickets.map(t => {
      const promoter = (promoters || []).find(p => p.id === t.promoter_id);
      return {
        id:             t.id,
        fullName:       t.full_name,
        whatsapp:       t.whatsapp,
        email:          t.email,
        cpf:            t.cpf,
        tier:           t.tier,
        quantity:       t.quantity,
        promoCode:      t.promo_code,
        promoterName:   promoter?.name || null,
        paymentMethod:  t.payment_method,
        paymentStatus:  t.payment_status,
        createdAt:      t.created_at,
      };
    });

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        summary: {
          totalConfirmed,
          totalPending:  pending.reduce((s, t) => s + (t.quantity || 1), 0),
          ticketCap:     ticketCapRaw,
          remaining:     Math.max(0, ticketCapRaw - totalConfirmed),
          byTier,
          totalRevenueBrl,
          totalCostsBrl,
          profitLossBrl,
        },
        costs: {
          band:          costBandBrl,
          dj:            costDjBrl,
          bundlePerHead: costBundleBrl,
          promoLocal:    costPromoLocal,
          promoInstagram:costPromoInsta,
          promoCommissions: totalPromoCommission,
          bundleTotal:   totalBundleCost,
        },
        promoters:       promoterBreakdown,
        promoCodes:      (promoCodes || []).map(c => ({ code: c.code, type: c.type, isActive: c.is_active })),
        guestList,
        config,
      }),
    };
  } catch (err: any) {
    console.error('get-event-admin-data error:', err);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message || 'Internal error' }),
    };
  }
};
