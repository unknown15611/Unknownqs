/**
 * Battery Duty Cycling & Radio Power Management State Machine
 * Regulates Wi-Fi Direct, Wi-Fi Aware, and BLE mesh radio scan cycles to prevent battery drain.
 */

export type PowerProfile = 'ACTIVE_CONTINUOUS' | 'BALANCED_MESH' | 'ULTRA_BATTERY_SAVER' | 'STANDBY_DEEP_SLEEP';

export interface DutyCycleConfig {
  scanDurationMs: number;
  sleepDurationMs: number;
  dutyRatio: number; // scan / (scan + sleep)
  wakeOnUrgent: boolean;
  bleTxPowerLevel: 'HIGH' | 'MEDIUM' | 'ULTRA_LOW';
}

export const POWER_PROFILES: Record<PowerProfile, DutyCycleConfig> = {
  ACTIVE_CONTINUOUS: {
    scanDurationMs: 60000,
    sleepDurationMs: 0,
    dutyRatio: 1.0,
    wakeOnUrgent: true,
    bleTxPowerLevel: 'HIGH',
  },
  BALANCED_MESH: {
    scanDurationMs: 10000, // 10s active scanning
    sleepDurationMs: 50000, // 50s radio sleep
    dutyRatio: 10000 / 60000, // ~16.6% radio on-time
    wakeOnUrgent: true,
    bleTxPowerLevel: 'MEDIUM',
  },
  ULTRA_BATTERY_SAVER: {
    scanDurationMs: 5000, // 5s scan
    sleepDurationMs: 115000, // 115s sleep
    dutyRatio: 5000 / 120000, // ~4.1% radio on-time
    wakeOnUrgent: true,
    bleTxPowerLevel: 'ULTRA_LOW',
  },
  STANDBY_DEEP_SLEEP: {
    scanDurationMs: 2000,
    sleepDurationMs: 298000, // 5 minutes
    dutyRatio: 2000 / 300000, // < 1% radio on-time
    wakeOnUrgent: true,
    bleTxPowerLevel: 'ULTRA_LOW',
  },
};

/**
 * Evaluates appropriate power profile based on current battery level and user screen state
 */
export function determinePowerProfile(
  batteryPct: number,
  isScreenOn: boolean,
  hasActiveVoiceStream: boolean
): PowerProfile {
  if (hasActiveVoiceStream) {
    return 'ACTIVE_CONTINUOUS';
  }
  if (isScreenOn) {
    return batteryPct < 20 ? 'BALANCED_MESH' : 'ACTIVE_CONTINUOUS';
  }
  // Screen is off / background mode
  if (batteryPct <= 15) {
    return 'STANDBY_DEEP_SLEEP';
  }
  if (batteryPct <= 35) {
    return 'ULTRA_BATTERY_SAVER';
  }
  return 'BALANCED_MESH';
}

/**
 * Jamming & Dynamic Channel Hopping Controller
 * Analyzes packet loss and RSSI anomaly to determine if frequency jamming or interference requires hopping.
 */
export interface ChannelHopDecision {
  shouldHop: boolean;
  recommendedChannel: number;
  reason: 'NONE' | 'PACKET_LOSS_THRESHOLD' | 'JAMMING_CARRIER_DETECTED' | 'PROACTIVE_SCHEDULE';
}

export const WIFI_MESH_CHANNELS = [1, 6, 11, 36, 40, 44, 48, 149, 157, 161];

export function evaluateChannelHealth(
  currentChannel: number,
  packetLossRate: number, // 0.0 to 1.0
  avgRssiDbm: number
): ChannelHopDecision {
  // If packet loss exceeds 45% or anomalous RSSI noise floor detected (> -50dBm noise with no decoding)
  if (packetLossRate >= 0.45) {
    const currentIndex = WIFI_MESH_CHANNELS.indexOf(currentChannel);
    const nextIndex = (currentIndex + 1) % WIFI_MESH_CHANNELS.length;
    return {
      shouldHop: true,
      recommendedChannel: WIFI_MESH_CHANNELS[nextIndex],
      reason: 'PACKET_LOSS_THRESHOLD',
    };
  }

  return {
    shouldHop: false,
    recommendedChannel: currentChannel,
    reason: 'NONE',
  };
}
