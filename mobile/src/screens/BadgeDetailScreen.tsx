import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletButton } from '../components/WalletButton';
import { Colors, resolveGradient } from '../constants/colors';
import { getPromoById } from '../data/barracaPromos';
import { addBadgeToWallet } from '../services/walletService';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'BadgeDetail'>;

export function BadgeDetailScreen({ route, navigation }: Props) {
  const { promoId } = route.params;
  const promo = getPromoById(promoId);
  const [walletLoading, setWalletLoading] = useState(false);

  if (!promo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Badge not found.</Text>
      </View>
    );
  }

  const gradient = resolveGradient(promo.badgeFromColor, promo.badgeToColor);

  const handleWallet = async () => {
    setWalletLoading(true);
    try {
      await addBadgeToWallet(promo.id);
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Badge gradient header */}
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.badgeName}>{promo.name}</Text>
          <Text style={styles.handle}>@{promo.instagramHandle}</Text>
        </LinearGradient>

        {/* Discount code */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DISCOUNT CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{promo.discountCode}</Text>
          </View>
          <Text style={styles.codeHint}>Show this code at the barraca to redeem your discount.</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LOCATION</Text>
          <Text style={styles.infoText}>{promo.barracaLocation}</Text>
        </View>

        {/* Wallet */}
        <View style={styles.section}>
          {walletLoading ? (
            <ActivityIndicator color={Colors.accent} />
          ) : (
            <WalletButton onPress={handleWallet} loading={walletLoading} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  scroll: { paddingBottom: 40 },
  header: {
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  badgeName: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  handle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  codeBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  codeText: { color: Colors.accent, fontSize: 32, fontWeight: '800', letterSpacing: 4 },
  codeHint: { color: Colors.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' },
  infoText: { color: Colors.textPrimary, fontSize: 16 },
  errorText: { color: Colors.error, fontSize: 16 },
});
