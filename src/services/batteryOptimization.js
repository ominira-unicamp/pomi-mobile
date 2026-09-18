import { NativeModules, Platform } from 'react-native';

const { BatteryOptimization } = NativeModules;

/**
 * Check if the app is already exempt from battery optimizations.
 * Returns true if the app is whitelisted (battery optimizations are ignored).
 */
export async function isIgnoringBatteryOptimizations() {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    return await BatteryOptimization.isIgnoringBatteryOptimizations();
  } catch {
    return false;
  }
}

/**
 * Request the system to exempt the app from battery optimizations.
 * Shows the standard Android dialog asking the user to allow unrestricted
 * background activity. This is critical on Xiaomi/MIUI, Huawei/EMUI, etc.
 *
 * Returns 'already_ignored' if already exempt, 'requested' if the dialog was shown.
 */
export async function requestIgnoreBatteryOptimizations() {
  if (Platform.OS !== 'android') {
    return 'not_android';
  }
  try {
    return await BatteryOptimization.requestIgnoreBatteryOptimizations();
  } catch (e) {
    console.warn('[BatteryOptimization] Failed to request exemption:', e);
    return 'error';
  }
}

/**
 * Open the system battery optimization settings screen.
 * Use this as a fallback if the direct request doesn't work on some OEMs.
 */
export async function openBatterySettings() {
  if (Platform.OS !== 'android') {
    return;
  }
  try {
    return await BatteryOptimization.openBatterySettings();
  } catch (e) {
    console.warn('[BatteryOptimization] Failed to open battery settings:', e);
  }
}
