/**
 * ThaisPromotion — thin backward-compatible wrapper around BarracaPromotion.
 * Existing imports in Home.tsx continue to work unchanged.
 */
import React from 'react';
import BarracaPromotion from './BarracaPromotion';
import { getBarracaPromoById } from '../data/barracaPromos';

interface ThaisPromotionProps {
  promoSource?: string;
}

const ThaisPromotion: React.FC<ThaisPromotionProps> = ({
  promoSource = 'home_instagram_section',
}) => {
  const barraca = getBarracaPromoById('thais-follow');
  if (!barraca) return null;
  return <BarracaPromotion barraca={barraca} promoSource={promoSource} />;
};

export default ThaisPromotion;
