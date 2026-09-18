import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authorize, revoke } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateTodayClassesWidget } from '../widget/widget-task-handler';

const AuthContext = createContext();

const config = {
  issuer: 'https://auth.ominira.dev/realms/pomi',
  clientId: 'pomi-mobile',
  redirectUrl: 'dev.ominira.pomi://oauthredirect',
  scopes: ['openid', 'profile', 'email'],
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('accessToken').then(async token => {
      if (token) {
        setAuthState({ accessToken: token });
        updateTodayClassesWidget();
      }
    });
  }, []);

  const loginWithPassword = useCallback(async (email, password) => {
    try {
      const body = `grant_type=password&client_id=${config.clientId}&username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&scope=openid%20profile%20email`;
      const response = await fetch(`${config.issuer}/protocol/openid-connect/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error_description || result.error || 'Credenciais inválidas');
      }

      const authData = { accessToken: result.access_token, refreshToken: result.refresh_token };
      setAuthState(authData);
      await AsyncStorage.setItem('accessToken', result.access_token);
      if (result.refresh_token) {
        await AsyncStorage.setItem('refreshToken', result.refresh_token);
      }
      await updateTodayClassesWidget();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const login = useCallback(async () => {
    try {
      const result = await authorize(config);
      setAuthState(result);
      await AsyncStorage.setItem('accessToken', result.accessToken);
      if (result.refreshToken) {
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
      }
      await updateTodayClassesWidget();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (authState?.accessToken) {
        await revoke(config, { tokenToRevoke: authState.accessToken });
      }
    } catch (e) {
      console.error(e);
    }
    setAuthState(null);
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await updateTodayClassesWidget();
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, login, loginWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
