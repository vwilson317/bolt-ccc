import { supabase, handleSupabaseError } from '../lib/supabase';
import type { Database } from '../types/database';

type PromoClaimRow = Database['public']['Tables']['promo_claims']['Row'];
type PromoClaimInsert = Database['public']['Tables']['promo_claims']['Insert'];
type PromoClaimUpdate = Database['public']['Tables']['promo_claims']['Update'];

export type PromoIdentifierType = 'email' | 'phone';

export interface NormalizedIdentifier {
  type: PromoIdentifierType;
  inputValue: string;
  normalizedValue: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (value: string): string => value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');

export class PromoClaimService {
  static normalizeIdentifier(rawInput: string): NormalizedIdentifier | null {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.includes('@')) {
      const lowered = trimmed.toLowerCase();
      if (!emailRegex.test(lowered)) {
        return null;
      }

      return {
        type: 'email',
        inputValue: trimmed,
        normalizedValue: lowered
      };
    }

    const normalizedPhone = normalizePhone(trimmed);
    const digitsOnly = normalizedPhone.replace(/\D/g, '');

    if (digitsOnly.length < 8) {
      return null;
    }

    return {
      type: 'phone',
      inputValue: trimmed,
      normalizedValue: normalizedPhone
    };
  }

  static async findByIdentifier(promoId: string, rawInput: string): Promise<PromoClaimRow | null> {
    const normalized = this.normalizeIdentifier(rawInput);
    if (!normalized) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('promo_claims')
        .select('*')
        .eq('promo_id', promoId)
        .eq('identifier_normalized', normalized.normalizedValue)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleSupabaseError(error, 'find promo claim by identifier');
      }

      return data ?? null;
    } catch (error) {
      console.error('Error finding promo claim by identifier:', error);
      return null;
    }
  }

  static async claimOrRestore(
    promoId: string,
    rawInput: string,
    options: {
      followConfirmed: boolean;
      unlockBadge: boolean;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ claim: PromoClaimRow | null; wasExisting: boolean }> {
    const normalized = this.normalizeIdentifier(rawInput);
    if (!normalized) {
      return { claim: null, wasExisting: false };
    }

    const existing = await this.findByIdentifier(promoId, rawInput);

    const upsertPayload: PromoClaimInsert = {
      promo_id: promoId,
      identifier_type: normalized.type,
      identifier_value: normalized.inputValue,
      identifier_normalized: normalized.normalizedValue,
      instagram_follow_confirmed: options.followConfirmed || !!existing?.instagram_follow_confirmed,
      badge_unlocked: options.unlockBadge || !!existing?.badge_unlocked,
      metadata: {
        ...(existing?.metadata ?? {}),
        ...(options.metadata ?? {})
      },
      last_claimed_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('promo_claims')
        .upsert(upsertPayload, {
          onConflict: 'promo_id,identifier_normalized'
        })
        .select('*')
        .single();

      if (error) {
        handleSupabaseError(error, 'upsert promo claim');
      }

      return {
        claim: data ?? null,
        wasExisting: !!existing
      };
    } catch (error) {
      console.error('Error upserting promo claim:', error);
      return { claim: existing, wasExisting: !!existing };
    }
  }

  static async markLastClaimed(
    promoId: string,
    rawInput: string
  ): Promise<PromoClaimRow | null> {
    const normalized = this.normalizeIdentifier(rawInput);
    if (!normalized) {
      return null;
    }

    const updates: PromoClaimUpdate = {
      last_claimed_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('promo_claims')
        .update(updates)
        .eq('promo_id', promoId)
        .eq('identifier_normalized', normalized.normalizedValue)
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        handleSupabaseError(error, 'mark promo claim last_claimed_at');
      }

      return data ?? null;
    } catch (error) {
      console.error('Error updating promo claim last_claimed_at:', error);
      return null;
    }
  }
}
