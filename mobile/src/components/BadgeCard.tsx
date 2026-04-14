import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, resolveGradient } from '../constants/colors';
import type { BarracaPromoConfig } from '../data/barracaPromos';

interface Props {
  promo: BarracaPromoConfig;
  onPress: () => void;
}

export function BadgeCard({ promo, onPress }: Props) {
  const gradient = resolveGradient(promo.badgeFromColor, promo.badgeToColor);

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Text style={styles.name}>{promo.name}</Text>
        <View style={styles.codeChip}>
          <Text style={styles.codeText}>{promo.discountCode}</Text>
        </View>
        <Text style={styles.location}>{promo.barracaLocation}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  card: {
    padding: 20,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  codeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  codeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  location: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 8,
  },
});
