import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYCLOAK_TOKEN_URL = 'https://auth.ominira.dev/realms/pomi/protocol/openid-connect/token';
const CLIENT_ID = 'pomi-mobile';

export async function refreshAccessToken() {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const body = `grant_type=refresh_token&client_id=${CLIENT_ID}&refresh_token=${encodeURIComponent(refreshToken)}`;
    const res = await fetch(KEYCLOAK_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) {
      console.warn('[TokenManager] Refresh token request failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    if (data.access_token) {
      await AsyncStorage.setItem('accessToken', data.access_token);
      if (data.refresh_token) {
        await AsyncStorage.setItem('refreshToken', data.refresh_token);
      }
      return data.access_token;
    }
  } catch (e) {
    console.warn('[TokenManager] Error refreshing token:', e);
  }
  return null;
}
