// Environment variables for Tatakai Mobile
// In production, use expo-constants with app.config.js for secure configuration
// See: https://docs.expo.dev/guides/environment-variables/

import Constants from 'expo-constants';

// Get environment variables from Expo config or use defaults for development
const getEnvVar = (key: string, defaultValue: string): string => {
  // Try to get from Expo Constants extra
  const extra = Constants.expoConfig?.extra || {};
  return extra[key] || defaultValue;
};

export const ENV = {
  // These values are public/publishable keys, safe for client-side use
  // For production, configure via app.config.js with environment variables
  SUPABASE_URL: getEnvVar('SUPABASE_URL', 'https://xkbzamfyupjafugqeaby.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', 'sb_publishable_hiKONZyoLpTAkFpQL5DWIQ_1_OWjmj3'),
  API_URL: getEnvVar('API_URL', 'https://aniwatch-api-taupe-eight.vercel.app/api/v2/hianime'),
} as const;
