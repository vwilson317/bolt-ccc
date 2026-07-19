import * as SecureStore from 'expo-secure-store';
import type { IdentifierType } from '../types';

const IDENTIFIER_VALUE_KEY = 'ccc_identifier_value';
const IDENTIFIER_TYPE_KEY = 'ccc_identifier_type';

export interface StoredIdentifier {
  value: string;
  type: IdentifierType;
}

export async function saveIdentifier(value: string, type: IdentifierType): Promise<void> {
  await SecureStore.setItemAsync(IDENTIFIER_VALUE_KEY, value);
  await SecureStore.setItemAsync(IDENTIFIER_TYPE_KEY, type);
}

export async function getIdentifier(): Promise<StoredIdentifier | null> {
  const value = await SecureStore.getItemAsync(IDENTIFIER_VALUE_KEY);
  const type = await SecureStore.getItemAsync(IDENTIFIER_TYPE_KEY);
  if (!value || !type) return null;
  return { value, type: type as IdentifierType };
}

export async function clearIdentifier(): Promise<void> {
  await SecureStore.deleteItemAsync(IDENTIFIER_VALUE_KEY);
  await SecureStore.deleteItemAsync(IDENTIFIER_TYPE_KEY);
}
