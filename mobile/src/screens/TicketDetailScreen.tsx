import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WalletButton } from '../components/WalletButton';
import { Colors, TIER_COLORS } from '../constants/colors';
import { addTicketToWallet } from '../services/walletService';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

const TIER_LABEL: Record<string, string> = {
  general: 'General Admission',
  guest: 'Guest',
  vip: 'VIP',
  promoter: 'Promoter',
};

export function TicketDetailScreen({ route, navigation }: Props) {
  const { ticket } = route.params;
  const gradient = TIER_COLORS[ticket.tier] ?? TIER_COLORS.general;
  const [walletLoading, setWalletLoading] = useState(false);

  const handleWallet = async () => {
    setWalletLoading(true);
    try {
      await addTicketToWallet(ticket.id);
    } finally {
      setWalletLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Tier gradient header */}
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.tierLabel}>{TIER_LABEL[ticket.tier] ?? ticket.tier.toUpperCase()}</Text>
          <Text style={styles.name}>{ticket.full_name}</Text>
          <Text style={styles.qty}>
            {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
          </Text>
        </LinearGradient>

        {/* QR code */}
        <View style={styles.qrSection}>
          <Text style={styles.sectionLabel}>TICKET QR</Text>
          <View style={styles.qrBox}>
            <QRCode value={ticket.id} size={180} backgroundColor="#fff" color="#0f172a" />
          </View>
          <Text style={styles.qrHint}>Present this at the event entrance.</Text>
        </View>

        {/* Details */}
        {ticket.promo_code ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PROMO CODE</Text>
            <Text style={styles.infoText}>{ticket.promo_code}</Text>
          </View>
        ) : null}

        {ticket.promoter_name ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REFERRED BY</Text>
            <Text style={styles.infoText}>{ticket.promoter_name}</Text>
          </View>
        ) : null}

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
  tierLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  qty: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginTop: 6 },
  qrSection: { marginHorizontal: 20, marginTop: 28, alignItems: 'center' },
  sectionLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12, alignSelf: 'flex-start' },
  qrBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
  },
  qrHint: { color: Colors.textSecondary, fontSize: 12, marginTop: 10, textAlign: 'center' },
  section: { marginHorizontal: 20, marginTop: 20 },
  infoText: { color: Colors.textPrimary, fontSize: 16 },
});
