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

  const body = JSON.parse(event.body || '{}');
  const isVip = body.ticketTier === 'vip';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: isVip
                ? "Ryan's Farewell Party — VIP Premium Ticket"
                : "Ryan's Farewell Party — General Ticket",
              description: isVip
                ? 'Includes beach chair + umbrella, preferred seating closest to the stage, and a welcome drink · Sunday, May 3, 2026 · Ipanema Beach, Rio de Janeiro'
                : 'Includes beach chair + umbrella rental and a welcome drink of your choice · Sunday, May 3, 2026 · Ipanema Beach, Rio de Janeiro',
            },
            unit_amount: isVip ? 20000 : 10000, // R$200 or R$100 in centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/ryans-farewell-party?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/ryans-farewell-party?cancelled=true`,
      metadata: {
        event: 'ryans_farewell_party',
        event_date: '2026-05-03',
        ticket_tier: isVip ? 'vip' : 'normal',
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
