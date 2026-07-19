// Navigation param types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  BadgeDetail: { promoId: string };
  TicketDetail: { ticket: TicketResult };
  ClaimBadge: { promoId: string; promoSlug: string };
};

export type MainTabParamList = {
  Badges: undefined;
  Scanner: undefined;
  Tickets: undefined;
};

// Identifier types (mirrors web app)
export type IdentifierType = 'email' | 'phone' | 'cpf';

export interface NormalizedIdentifier {
  type: IdentifierType;
  inputValue: string;
  normalizedValue: string;
}

// Ticket result from lookup-event-ticket Netlify function
export interface TicketResult {
  id: string;
  full_name: string;
  tier: 'general' | 'guest' | 'vip' | 'promoter';
  quantity: number;
  payment_status: string;
  promo_code: string | null;
  promoter_name: string | null;
}

// QR scan result
export type QRParseResult =
  | { type: 'badge'; promoId: string; promoSlug: string }
  | { type: 'ticket' }
  | { type: 'unknown' };
