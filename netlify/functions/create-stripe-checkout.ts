import { Handler } from '@netlify/functions';
import Stripe from 'stripe';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('STRIPE_SECRET_KEY is not set');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Payment service not configured' }),
    };
  }

  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

  const origin =
    event.headers.origin ||
    event.headers.referer?.replace(/\/$/, '') ||
    'https://cariocacoastalclub.com';

  // Parse attendee info from request body
  let fullName = '';
  let cpf = '';
  let whatsapp = '';
  let email = '';
  let promoCode = '';
  let tier = 'general';
  let priceBrl = 10000; // R$100.00 default (centavos, for metadata only)
  let priceUsd = 1754;  // ~$17.54 default (USD cents, charged by Stripe)
  let quantity = 1;

  try {
    const body = JSON.parse(event.body || '{}');
    fullName   = (body.fullName  || '').trim();
    cpf        = (body.cpf       || '').replace(/\D/g, '');
    whatsapp   = (body.whatsapp  || '').trim();
    email      = (body.email     || '').trim();
    promoCode  = (body.promoCode || '').trim().toUpperCase();
    tier       = body.tier       || 'general';
    priceBrl   = typeof body.priceBrl === 'number' ? body.priceBrl : 10000;
    priceUsd   = typeof body.priceUsd === 'number' ? body.priceUsd : priceUsd;
    quantity   = Math.min(Math.max(parseInt(body.quantity) || 1, 1), 10);
  } catch {
    // use defaults if body is missing / malformed
  }

  if (!fullName || !whatsapp) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Full name and WhatsApp are required' }),
    };
  }

  // Tier label and description for Stripe product
  const tierLabels: Record<string, string> = {
    general: 'General Public',
    guest:   "Ryan's Guest",
    vip:     "Ryan's VIP",
    premium: 'VIP Premium',
  };
  const tierDescriptions: Record<string, string> = {
    premium: 'Includes beach chair + umbrella, preferred seating right by the DJ, and a welcome drink · Friday, May 1, 2026 · 120 Escritócarioca, Ipanema',
  };
  const tierLabel = tierLabels[tier] || 'General Public';
  const tierDescription = tierDescriptions[tier] || 'Includes: entry + welcome drink · Friday, May 1, 2026 · 120 Escritócarioca, Ipanema';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ryan's Going Away Party — ${tierLabel} Ticket`,
              description: tierDescription,
            },
            unit_amount: priceUsd,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/ryans-farewell-party?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/ryans-farewell-party?cancelled=true`,
      metadata: {
        event:      'ryans_going_away_party',
        event_date: '2026-05-01',
        full_name:  fullName.substring(0, 500),
        cpf:        cpf.substring(0, 11),
        whatsapp:   whatsapp.substring(0, 20),
        tier,
        promo_code: promoCode.substring(0, 50),
        quantity:   String(quantity),
        price_brl:  String(priceBrl),
      },
      custom_text: {
        submit: {
          message: 'さようなら、ライアン！See you at the beach before you conquer Tokyo 🌸',
        },
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err: any) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || 'Failed to create checkout session' }),
    };
  }
};
