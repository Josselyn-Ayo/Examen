// src/shared/infrastructure/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// Supabase espera métodos getItem/setItem/removeItem, pero expo-secure-store
// expone getItemAsync/setItemAsync/deleteItemAsync – este adaptador los mapea.
const SecureStoreAdapter = {
  getItem: (key: string) =>
    SecureStore.getItemAsync(key),

  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),

  removeItem: (key: string) =>
    SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Define EXPO_PUBLIC_SUPABASE_URL in your env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key. Define EXPO_PUBLIC_SUPABASE_ANON_KEY in your env file.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: SecureStoreAdapter, // tokens guardados en almacenamiento encriptado del dispositivo
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);