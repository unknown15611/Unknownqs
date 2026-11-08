/**
 * Android Runtime Storage Permission Handler
 * Simulates Android 13+ (API 33+) granular media permissions:
 * - READ_MEDIA_IMAGES
 * - READ_MEDIA_VIDEO
 * - READ_MEDIA_AUDIO
 * And legacy Android 10-12 READ_EXTERNAL_STORAGE / MANAGE_EXTERNAL_STORAGE.
 */

export type StoragePermissionState = 'NOT_REQUESTED' | 'GRANTED' | 'DENIED' | 'PERMANENTLY_DENIED';

export interface StoragePermissionDetails {
  state: StoragePermissionState;
  grantedAt?: number;
  attemptsCount: number;
  lastRequestedAt?: number;
  permissionsList: string[];
}

const STORAGE_KEY = 'qaidi_android_storage_permission_v1';

export const ANDROID_STORAGE_PERMISSIONS = [
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_EXTERNAL_STORAGE'
];
let inMemoryPermissionState: StoragePermissionDetails | null = null;

/**
 * Retrieves the current storage permission state from local cache.
 */
export function getStoragePermissionState(): StoragePermissionDetails {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // Fallback if localStorage throws
  }

  if (inMemoryPermissionState) {
    return inMemoryPermissionState;
  }

  return {
    state: 'NOT_REQUESTED',
    attemptsCount: 0,
    permissionsList: ANDROID_STORAGE_PERMISSIONS
  };
}

/**
 * Checks if storage access is currently granted.
 */
export function isStoragePermissionGranted(): boolean {
  const details = getStoragePermissionState();
  return details.state === 'GRANTED';
}

/**
 * Updates the permission state upon user action.
 */
export function updateStoragePermissionState(
  decision: 'ALLOW' | 'ALLOW_ONCE' | 'DENY' | 'DENY_PERMANENT'
): StoragePermissionDetails {
  const current = getStoragePermissionState();
  const nextAttempts = current.attemptsCount + 1;
  const now = Date.now();

  let nextState: StoragePermissionState = 'DENIED';
  if (decision === 'ALLOW' || decision === 'ALLOW_ONCE') {
    nextState = 'GRANTED';
  } else if (decision === 'DENY_PERMANENT' || nextAttempts >= 3) {
    nextState = 'PERMANENTLY_DENIED';
  } else {
    nextState = 'DENIED';
  }

  const updated: StoragePermissionDetails = {
    state: nextState,
    grantedAt: nextState === 'GRANTED' ? now : current.grantedAt,
    attemptsCount: nextAttempts,
    lastRequestedAt: now,
    permissionsList: ANDROID_STORAGE_PERMISSIONS
  };

  inMemoryPermissionState = updated;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore storage errors in test or memory environments
  }

  return updated;
}

/**
 * Resets storage permission (e.g. for testing or app settings reset).
 */
export function resetStoragePermissionState(): void {
  inMemoryPermissionState = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
}

