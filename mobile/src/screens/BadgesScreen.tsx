import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BadgeCard } from '../components/BadgeCard';
import { Colors } from '../constants/colors';
import { BARRACA_PROMOS, getPromoById } from '../data/barracaPromos';
import { fetchClaimedPromoIds } from '../services/promoClaimService';
import { getIdentifier } from '../services/storage';
import type { RootStackParamList, MainTabParamList } from '../types';
import type { BarracaPromoConfig } from '../data/barracaPromos';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Badges'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function BadgesScreen({ navigation }: Props) {
  const [badges, setBadges] = useState<BarracaPromoConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const stored = await getIdentifier();
    if (!stored) return;

    const claimedIds = await fetchClaimedPromoIds(stored.value);
    const claimed = claimedIds
      .map((id) => getPromoById(id))
      .filter((p): p is BarracaPromoConfig => !!p && p.active);

    setBadges(claimed);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // Refresh when screen comes into focus (e.g. after claiming a badge)
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.heading}>My Badges</Text>
      <FlatList
        data={badges}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BadgeCard
            promo={item}
            onPress={() => navigation.navigate('BadgeDetail', { promoId: item.id })}
          />
        )}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏖️</Text>
            <Text style={styles.emptyTitle}>No badges yet</Text>
            <Text style={styles.emptyText}>
              Scan a QR code at a partner barraca to claim your first badge.
            </Text>
          </View>
        }
        contentContainerStyle={badges.length === 0 ? styles.emptyContainer : styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.bg },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', marginHorizontal: 16, marginVertical: 16 },
  list: { paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
