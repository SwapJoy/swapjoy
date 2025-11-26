import { Platform } from 'react-native';
import * as ExpoNotifications from 'expo-notifications';

/**
 * Update the app icon badge count.
 * On Android this is a best-effort (depends on launcher support).
 */
export async function setAppIconBadgeCount(count: number): Promise<void> {
  try {
    // Clamp to non-negative integer
    const normalized = Math.max(0, Math.floor(count || 0));

    // iOS and many Android launchers support this API
    await ExpoNotifications.setBadgeCountAsync(normalized);

    if (Platform.OS === 'ios') {
      console.log('[badgeService] Updated iOS app icon badge to', normalized);
    }
  } catch (error) {
    console.warn('[badgeService] Failed to set app icon badge count:', (error as any)?.message || error);
  }
}


