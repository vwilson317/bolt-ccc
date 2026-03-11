/**
 * Jota86xPromotion — thin wrapper around BarracaPromotion for Jota's Tent.
 */
import React from 'react';
import BarracaPromotion from './BarracaPromotion';
import { getBarracaPromoById } from '../data/barracaPromos';

interface Jota86xPromotionProps {
  promoSource?: string;
}

const Jota86xPromotion: React.FC<Jota86xPromotionProps> = ({
  promoSource = 'home_instagram_section',
}) => {
  const barraca = getBarracaPromoById('jota86x-follow');
  if (!barraca) return null;
  return <BarracaPromotion barraca={barraca} promoSource={promoSource} />;
};

export default Jota86xPromotion;
