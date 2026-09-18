import { createPomiSdk } from '@ominira/pomi-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken } from '../auth/tokenManager';

export const DATA_API_URL = 'https://data.pomi.ominira.dev';
export const APP_API_URL = 'https://app.pomi.ominira.dev';

export function getSdk() {
  return createPomiSdk({
    dataApiUrl: DATA_API_URL,
    appApiUrl: APP_API_URL,
    // Strip cache: 'no-store' so React Native's fetch polyfill doesn't append `_=<timestamp>` to query parameters
    fetch: (input, init) => {
      const cleanInit = init ? { ...init } : {};
      if (cleanInit.cache === 'no-store') {
        delete cleanInit.cache;
      }
      return fetch(input, cleanInit);
    },
    getAccessToken: async () => {
      const token = await AsyncStorage.getItem('accessToken');
      return token || '';
    },
  });
}

export async function withAuthRetry(operation) {
  try {
    return await operation(getSdk());
  } catch (error) {
    if (error?.status === 401 || error?.response?.status === 401) {
      console.log('[SDK] Received 401, refreshing token...');
      const newToken = await refreshAccessToken();
      if (newToken) {
        return await operation(getSdk());
      }
    }
    throw error;
  }
}
