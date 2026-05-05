import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * iOS: Downloads the PKPass from the existing Netlify function and opens
 * the native share sheet, which presents "Add to Wallet" as the primary action.
 *
 * Android: Not implemented — shows an informational alert.
 */
export async function addBadgeToWallet(promoId: string): Promise<void> {
  if (Platform.OS === 'ios') {
    await _addBadgeToAppleWallet(promoId);
  } else {
    _notImplemented('Google Wallet');
  }
}

async function _addBadgeToAppleWallet(promoId: string): Promise<void> {
  const url = `${API_BASE}/.netlify/functions/generate-pkpass?barracaPromoId=${promoId}`;
  const localPath = `${FileSystem.cacheDirectory}${promoId}.pkpass`;

  try {
    const { uri, status } = await FileSystem.downloadAsync(url, localPath);

    if (status !== 200) {
      Alert.alert('Error', 'Could not download the Wallet pass. Please try again.');
      return;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Not supported', 'Sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.apple.pkpass',
      UTI: 'com.apple.pkpass',
    });
  } catch (err) {
    console.error('addBadgeToAppleWallet error:', err);
    Alert.alert('Error', 'Failed to add pass to Wallet. Please try again.');
  }
}

/**
 * Ticket wallet pass — not yet implemented.
 * Ticket PKPass generation requires a separate Netlify function.
 */
export async function addTicketToWallet(_ticketId: string): Promise<void> {
  _notImplemented('Ticket Wallet pass');
}

function _notImplemented(feature: string): void {
  Alert.alert('Coming Soon', `${feature} support is not yet available.`);
}
