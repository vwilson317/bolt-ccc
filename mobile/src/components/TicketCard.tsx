import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TIER_COLORS } from '../constants/colors';
import type { TicketResult } from '../types';

interface Props {
  ticket: TicketResult;
  onPress: () => void;
}

const TIER_LABEL: Record<string, string> = {
  general: 'General',
  guest: 'Guest',
  vip: 'VIP',
  promoter: 'Promoter',
};

export function TicketCard({ ticket, onPress }: Props) {
  const gradient = TIER_COLORS[ticket.tier] ?? TIER_COLORS.general;

  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{ticket.full_name}</Text>
          <View style={styles.tierChip}>
            <Text style={styles.tierText}>{TIER_LABEL[ticket.tier] ?? ticket.tier.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.qty}>
            {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
          </Text>
          {ticket.promoter_name ? (
            <Text style={styles.promoter}>via {ticket.promoter_name}</Text>
          ) : null}
        </View>
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
    minHeight: 100,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  tierChip: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tierText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  qty: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '500',
  },
  promoter: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
});
