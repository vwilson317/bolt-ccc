/**
 * Badge claiming logic — mirrors the web app's PromoClaimService.
 * Identifier normalization is identical so DB records are shared.
 */
import { supabase } from './supabase';
import type { NormalizedIdentifier, IdentifierType } from '../types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_FORMATTED_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

export function normalizeIdentifier(
  rawInput: string,
  options?: { preferCpf?: boolean },
): NormalizedIdentifier | null {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  // Email
  if (trimmed.includes('@')) {
    const lowered = trimmed.toLowerCase();
    if (!EMAIL_RE.test(lowered)) return null;
    return { type: 'email', inputValue: trimmed, normalizedValue: lowered };
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  const hasPlusPrefix = trimmed.startsWith('+');

  // CPF: exactly 11 digits, formatted XXX.XXX.XXX-XX or preferCpf flag
  if (!hasPlusPrefix && digitsOnly.length === 11) {
    if (CPF_FORMATTED_RE.test(trimmed) || options?.preferCpf) {
      return { type: 'cpf', inputValue: trimmed, normalizedValue: digitsOnly };
    }
  }

  // Phone / WhatsApp
  const normalizedPhone = trimmed.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
  const phoneDigits = normalizedPhone.replace(/\D/g, '');
  if (phoneDigits.length < 8) return null;

  return { type: 'phone', inputValue: trimmed, normalizedValue: normalizedPhone };
}

export function detectIdentifierType(rawInput: string): IdentifierType | null {
  const result = normalizeIdentifier(rawInput, { preferCpf: true });
  return result?.type ?? null;
}

/** Returns the list of promo_ids the identifier has claimed. */
export async function fetchClaimedPromoIds(identifier: string): Promise<string[]> {
  const normalized = normalizeIdentifier(identifier, { preferCpf: true });
  if (!normalized) return [];

  const { data, error } = await supabase
    .from('promo_claims')
    .select('promo_id')
    .eq('identifier_normalized', normalized.normalizedValue)
    .eq('badge_unlocked', true);

  if (error) {
    console.error('fetchClaimedPromoIds error:', error);
    return [];
  }

  return (data ?? []).map((row: { promo_id: string }) => row.promo_id);
}

/** Claim (or restore) a badge. instagram_follow_confirmed is always true in the mobile app. */
export async function claimBadge(
  promoId: string,
  identifier: string,
): Promise<{ success: boolean; wasExisting: boolean }> {
  const normalized = normalizeIdentifier(identifier, { preferCpf: true });
  if (!normalized) return { success: false, wasExisting: false };

  // Check for an existing claim first
  const { data: existing } = await supabase
    .from('promo_claims')
    .select('id')
    .eq('promo_id', promoId)
    .eq('identifier_normalized', normalized.normalizedValue)
    .maybeSingle();

  const wasExisting = !!existing;

  const { error } = await supabase.from('promo_claims').upsert(
    {
      promo_id: promoId,
      identifier_type: normalized.type,
      identifier_value: normalized.inputValue,
      identifier_normalized: normalized.normalizedValue,
      instagram_follow_confirmed: true, // bypassed in the mobile app
      badge_unlocked: true,
      metadata: { source: 'mobile_app' },
      last_claimed_at: new Date().toISOString(),
    },
    { onConflict: 'promo_id,identifier_normalized' },
  );

  if (error) {
    console.error('claimBadge error:', error);
    return { success: false, wasExisting };
  }

  return { success: true, wasExisting };
}
