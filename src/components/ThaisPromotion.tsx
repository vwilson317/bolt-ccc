/**
 * ThaisPromotion — thin backward-compatible wrapper around HakaPromotion.
 * Existing imports in Home.tsx and ThaisPromoPage.tsx continue to work unchanged.
 */
import React from 'react';
import HakaPromotion from './HakaPromotion';
import { getHakaById } from '../data/hakas';

interface ThaisPromotionProps {
  promoSource?: string;
}

const ThaisPromotion: React.FC<ThaisPromotionProps> = ({
  promoSource = 'home_instagram_section',
}) => {
  const haka = getHakaById('thais-follow');
  if (!haka) return null;
  return <HakaPromotion haka={haka} promoSource={promoSource} />;
};

export default ThaisPromotion;
