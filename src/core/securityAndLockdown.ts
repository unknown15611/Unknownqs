/**
 * OPSEC, City-Targeted Security Lockdown, Signal % Conversion,
 * and Notes App Disguise Protocol for Qaidi Share
 */

export interface CityLockdownCommand {
  commandId: string;
  senderHandle: string;
  targetRegion: string; // e.g. "Talagang", "Lahore", "Islamabad", "Karachi", or "ALL"
  enforcePinLock: boolean;
  enforceStealthDisguise: boolean;
  issuedAt: number;
  signatureHex: string;
  romanUrduNotice: string;
}

export interface ManualLocationShareState {
  isSharing: boolean;
  sharingType: 'STATIC' | 'LIVE';
  trustedPeerHandle: string;
  sharedLatitude: number;
  sharedLongitude: number;
  startedAt: number;
}

/**
 * Converts raw RSSI in dBm (-120 dBm to -50 dBm) to user-friendly percentage (0% to 100%)
 */
export function rssiToSignalPercentage(rssiDbm: number): number {
  if (rssiDbm >= -50) return 100;
  if (rssiDbm <= -120) return 0;
  // Linear interpolation: (-120 -> 0%, -50 -> 100%)
  const pct = Math.round(((rssiDbm - (-120)) / (-50 - (-120))) * 100);
  return Math.max(0, Math.min(100, pct));
}

/**
 * Returns color class and label for signal percentage
 */
export function getSignalQuality(percentage: number): { label: string; color: string; bars: number } {
  if (percentage >= 75) return { label: 'Excellent', color: 'text-emerald-400', bars: 4 };
  if (percentage >= 50) return { label: 'Good', color: 'text-teal-400', bars: 3 };
  if (percentage >= 25) return { label: 'Fair', color: 'text-amber-400', bars: 2 };
  return { label: 'Weak', color: 'text-rose-400', bars: 1 };
}

/**
 * Verifies if node matches targeted city broadcast
 */
export function shouldEnforceLockdownForCity(nodeCity: string, targetRegion: string): boolean {
  if (!targetRegion || targetRegion.toUpperCase() === 'ALL') return true;
  return nodeCity.trim().toLowerCase() === targetRegion.trim().toLowerCase();
}

/**
 * Standard Roman Urdu alert message for emergency lockdown
 */
export const DEFAULT_ROMAN_URDU_LOCKDOWN_ALERT = 
  'Halaat ke paish-e-nazar is ilaqay mein security sakht kar di gayi hai. Aapki app par Notepad Disguise aur PIN Lock laazmi nafiz kar diya gaya hai. Barah-e-karam apna 4-digit PIN set karein.';

export function getUrduLockdownWarning(city: string): string {
  return `Halaat ke paish-e-nazar ${city} mein security sakht kar di gayi hai. Aapki app par Notepad Disguise aur PIN Lock laazmi nafiz kar diya gaya hai. Barah-e-karam apna 4-digit PIN (Default: 1234) darj karein.`;
}
