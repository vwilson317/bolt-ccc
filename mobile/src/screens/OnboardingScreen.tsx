import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { normalizeIdentifier, detectIdentifierType } from '../services/promoClaimService';
import { saveIdentifier } from '../services/storage';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  cpf: 'CPF',
  phone: 'WhatsApp',
};

export function OnboardingScreen({ navigation }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const detectedType = input.trim() ? detectIdentifierType(input) : null;

  const handleContinue = async () => {
    const normalized = normalizeIdentifier(input.trim(), { preferCpf: true });
    if (!normalized) {
      Alert.alert(
        'Invalid identifier',
        'Please enter a valid email address, CPF (XXX.XXX.XXX-XX), or WhatsApp number.',
      );
      return;
    }

    setLoading(true);
    try {
      await saveIdentifier(normalized.inputValue, normalized.type);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Error', 'Could not save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.hero}>
            <Text style={styles.logoText}>🌊</Text>
            <Text style={styles.title}>Carioca Coastal Club</Text>
            <Text style={styles.subtitle}>
              Collect badges from your favourite barracas and access your event tickets.
            </Text>
          </View>

          {/* Identifier input */}
          <View style={styles.form}>
            <Text style={styles.label}>Your identifier</Text>
            <Text style={styles.hint}>Email, CPF, or WhatsApp number — this links your badges and tickets.</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="email, CPF, or phone"
                placeholderTextColor={Colors.textSecondary}
                value={input}
                onChangeText={setInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              {detectedType ? (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{TYPE_LABELS[detectedType]}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.btn, (!input.trim() || loading) && styles.btnDisabled]}
              onPress={handleContinue}
              disabled={!input.trim() || loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>{loading ? 'Setting up…' : 'Get Started'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.privacy}>
            Your identifier is stored securely on this device and used only to retrieve your badges and tickets.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24 },
  hero: { alignItems: 'center', marginTop: 48, marginBottom: 40 },
  logoText: { fontSize: 56, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  form: { gap: 8 },
  label: { color: Colors.textPrimary, fontSize: 16, fontWeight: '600', marginBottom: 2 },
  hint: { color: Colors.textSecondary, fontSize: 13, marginBottom: 8 },
  inputRow: { position: 'relative' },
  input: {
    backgroundColor: Colors.card,
    color: Colors.textPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    paddingRight: 80,
  },
  typeBadge: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -11 }],
    backgroundColor: Colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  typeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  privacy: { color: Colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 32, lineHeight: 18 },
});
