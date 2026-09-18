import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from './src/theme';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { LoginScreen } from './src/LoginScreen';
import { updateTodayClassesWidget } from './src/widget/widget-task-handler';
import {
  isIgnoringBatteryOptimizations,
  requestIgnoreBatteryOptimizations,
} from './src/services/batteryOptimization';

function Main() {
  const { authState, logout } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (authState?.accessToken) {
      updateTodayClassesWidget();

      // Request battery optimization exemption for widget background tasks
      isIgnoringBatteryOptimizations().then((isIgnoring) => {
        if (!isIgnoring) {
          requestIgnoreBatteryOptimizations();
        }
      });
    }
  }, [authState?.accessToken]);

  const handleRefreshWidget = async () => {
    setUpdating(true);
    setStatusMsg('');
    try {
      await updateTodayClassesWidget();
      setStatusMsg('Widget atualizado com sucesso!');
    } catch (e) {
      setStatusMsg('Erro ao atualizar widget.');
    } finally {
      setUpdating(false);
    }
  };

  if (!authState?.accessToken) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.text}>POMI Mobile</Text>
      <Text style={styles.subtext}>Você está conectado.</Text>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleRefreshWidget}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator color={colors.dark.background} />
        ) : (
          <Text style={styles.actionButtonText}>Atualizar Widget</Text>
        )}
      </TouchableOpacity>

      {statusMsg ? <Text style={styles.statusText}>{statusMsg}</Text> : null}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    color: colors.dark.foreground,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    color: colors.dark.mutedForeground,
    fontSize: 14,
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
  },
  actionButtonText: {
    color: colors.dark.primaryForeground,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusText: {
    color: colors.dark.ring,
    fontSize: 12,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: colors.dark.card,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    maxWidth: 240,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.dark.foreground,
    fontSize: 14,
  }
});
