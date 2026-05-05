import type { TicketResult } from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

/** Calls the existing lookup-event-ticket Netlify function. */
export async function lookupTickets(identifier: string): Promise<TicketResult[]> {
  const url = `${API_BASE}/.netlify/functions/lookup-event-ticket?id=${encodeURIComponent(identifier)}`;

  const response = await fetch(url, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Ticket lookup failed: ${response.status}`);
  }

  const data = (await response.json()) as { tickets?: TicketResult[] };
  return data.tickets ?? [];
}
