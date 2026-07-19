import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';
import { getPromoBySlug, getPromoById } from '../data/barracaPromos';
import type { RootStackParamList, MainTabParamList, QRParseResult } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Scanner'>,
  NativeStackScreenProps<RootStackParamList>
>;

function parseQRData(data: string): QRParseResult {
  // Try to parse as a URL
  try {
    const url = new URL(data);
    const path = url.pathname;

    // Badge claim: /loyalty/:slug
    const loyaltyMatch = path.match(/^\/loyalty\/([^/]+)$/);
    if (loyaltyMatch) {
      const slug = loyaltyMatch[1];
      const promo = getPromoBySlug(slug);
      if (promo) return { type: 'badge', promoId: promo.id, promoSlug: promo.slug };
    }

    // Ticket page
    if (path.includes('ticket')) {
      return { type: 'ticket' };
    }
  } catch {
    // Not a URL — try matching a bare slug or promo ID
  }

  // Bare slug
  const bySlug = getPromoBySlug(data);
  if (bySlug) return { type: 'badge', promoId: bySlug.id, promoSlug: bySlug.slug };

  // Bare promo ID
  const byId = getPromoById(data);
  if (byId) return { type: 'badge', promoId: byId.id, promoSlug: byId.slug };

  return { type: 'unknown' };
}

export function QRScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Reset scan state each time this tab comes into focus
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, []),
  );

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const result = parseQRData(data.trim());

    if (result.type === 'badge') {
      navigation.navigate('ClaimBadge', { promoId: result.promoId, promoSlug: result.promoSlug });
    } else if (result.type === 'ticket') {
      // Navigate to Tickets tab — the user's stored identifier triggers lookup
      navigation.navigate('Main');
      // Small delay then switch tab
      setTimeout(() => navigation.getParent()?.navigate('Tickets'), 300);
    } else {
      Alert.alert(
        'Unrecognized QR',
        'This QR code is not a Carioca Coastal Club badge or ticket.',
        [{ text: 'Scan Again', onPress: () => setScanned(false) }],
      );
    }
  };

  if (!permission) {
    return <View style={styles.center} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>We need your camera to scan badge and ticket QR codes.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Scan QR Code</Text>

        {/* Target reticle */}
        <View style={styles.reticle}>
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />
        </View>

        <Text style={styles.hint}>
          {scanned ? 'Processing…' : 'Point at a badge or ticket QR code'}
        </Text>
      </View>
    </View>
  );
}

const CORNER = 24;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  permissionText: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 24 },
  permBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  overlay: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 80,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  reticle: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: Colors.accent,
  },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderTopLeftRadius: 4 },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderTopRightRadius: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderBottomLeftRadius: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderBottomRightRadius: 4 },
  hint: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
});
