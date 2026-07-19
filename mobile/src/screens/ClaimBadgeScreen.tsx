import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletButton } from '../components/WalletButton';
import { Colors, resolveGradient } from '../constants/colors';
import { getPromoById } from '../data/barracaPromos';
import { claimBadge } from '../services/promoClaimService';
import { getIdentifier } from '../services/storage';
import { addBadgeToWallet } from '../services/walletService';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'ClaimBadge'>;

type Stage = 'confirm' | 'loading' | 'success';

export function ClaimBadgeScreen({ route, navigation }: Props) {
  const { promoId } = route.params;
  const promo = getPromoById(promoId);
  const [stage, setStage] = useState<Stage>('confirm');
  const [wasExisting, setWasExisting] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [identifier, setIdentifier] = useState<string | null>(null);

  useEffect(() => {
    getIdentifier().then((stored) => setIdentifier(stored?.value ?? null));
  }, []);

  if (!promo) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unknown badge.</Text>
      </View>
    );
  }

  const gradient = resolveGradient(promo.badgeFromColor, promo.badgeToColor);

  const handleClaim = async () => {
    if (!identifier) {
      Alert.alert('Not set up', 'Please complete onboarding before claiming badges.');
      return;
    }

    setStage('loading');

    const { success, wasExisting: existing } = await claimBadge(promoId, identifier);

    if (!success) {
      setStage('confirm');
      Alert.alert('Error', 'Could not claim the badge. Please check your connection and try again.');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setWasExisting(existing);
    setStage('success');
  };

  const handleWallet = async () => {
    setWalletLoading(true);
    try {
      await addBadgeToWallet(promo.id);
    } finally {
      setWalletLoading(false);
    }
  };

  const maskedIdentifier = identifier
    ? identifier.length > 6
      ? identifier.slice(0, 3) + '•••' + identifier.slice(-3)
      : '•••'
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          {stage === 'success' ? (
            <Text style={styles.successIcon}>✅</Text>
          ) : (
            <Text style={styles.badgeIcon}>🏅</Text>
          )}
          <Text style={styles.badgeName}>{promo.name}</Text>
          <Text style={styles.handle}>@{promo.instagramHandle}</Text>
        </LinearGradient>

        {stage === 'success' ? (
          /* ── Success state ── */
          <View style={styles.body}>
            <Text style={styles.successTitle}>{wasExisting ? 'Badge restored!' : 'Badge claimed!'}</Text>
            <Text style={styles.successText}>
              Your discount code is <Text style={styles.code}>{promo.discountCode}</Text>.{'\n'}
              Show it at {promo.name} in {promo.barracaLocation}.
            </Text>

            <WalletButton onPress={handleWallet} loading={walletLoading} />

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                navigation.goBack();
                // Also pop back to Badges tab so the new badge is visible
              }}
            >
              <Text style={styles.doneBtnText}>View My Badges</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ── Confirm / loading state ── */
          <View style={styles.body}>
            <Text style={styles.sectionLabel}>BARRACA</Text>
            <Text style={styles.infoText}>{promo.name}</Text>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>LOCATION</Text>
            <Text style={styles.infoText}>{promo.barracaLocation}</Text>

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>DISCOUNT CODE</Text>
            <Text style={[styles.infoText, { color: Colors.accent, fontSize: 22, fontWeight: '800' }]}>
              {promo.discountCode}
            </Text>

            {maskedIdentifier ? (
              <Text style={styles.identifierNote}>
                Claiming as: <Text style={{ color: Colors.textPrimary }}>{maskedIdentifier}</Text>
              </Text>
            ) : null}

            {stage === 'loading' ? (
              <ActivityIndicator color={Colors.accent} style={{ marginTop: 28 }} />
            ) : (
              <TouchableOpacity style={styles.claimBtn} onPress={handleClaim} activeOpacity={0.85}>
                <Text style={styles.claimBtnText}>Claim Badge</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  badgeIcon: { fontSize: 48, marginBottom: 8 },
  successIcon: { fontSize: 48, marginBottom: 8 },
  badgeName: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center' },
  handle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  body: { marginHorizontal: 20, marginTop: 28 },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  infoText: { color: Colors.textPrimary, fontSize: 16 },
  identifierNote: { color: Colors.textSecondary, fontSize: 13, marginTop: 20 },
  claimBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  claimBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  successText: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 4 },
  code: { color: Colors.accent, fontWeight: '800' },
  doneBtn: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  doneBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  errorText: { color: Colors.error, fontSize: 16 },
});
