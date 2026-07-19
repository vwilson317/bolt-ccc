import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TicketCard } from '../components/TicketCard';
import { Colors } from '../constants/colors';
import { lookupTickets } from '../services/ticketService';
import { getIdentifier } from '../services/storage';
import type { RootStackParamList, MainTabParamList, TicketResult } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Tickets'>,
  NativeStackScreenProps<RootStackParamList>
>;

const PURCHASE_URL = `${process.env.EXPO_PUBLIC_API_URL ?? ''}/ryans-party-ticket`;

export function TicketsScreen({ navigation }: Props) {
  const [tickets, setTickets] = useState<TicketResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const stored = await getIdentifier();
    if (!stored) return;

    try {
      const result = await lookupTickets(stored.value);
      setTickets(result);
      setError(null);
    } catch (err) {
      setError('Could not load tickets. Check your connection and try again.');
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handlePurchase = () => {
    Linking.openURL(PURCHASE_URL).catch(() =>
      Alert.alert('Error', 'Could not open the ticket purchase page.'),
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Tickets</Text>
        <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase}>
          <Text style={styles.purchaseBtnText}>Buy Tickets</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TicketCard ticket={item} onPress={() => navigation.navigate('TicketDetail', { ticket: item })} />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎟️</Text>
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptyText}>
              Tickets are linked to your email, CPF, or WhatsApp number used at purchase.
            </Text>
            <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase}>
              <Text style={styles.buyBtnText}>Buy a Ticket</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={tickets.length === 0 ? styles.emptyContainer : styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800' },
  purchaseBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  purchaseBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorBox: {
    backgroundColor: '#450a0a',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  errorText: { color: '#fca5a5', fontSize: 13 },
  list: { paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  buyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
