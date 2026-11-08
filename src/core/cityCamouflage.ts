/**
 * City Camouflage & Urban Stealth Protocol (Anti-Surveillance & RF Obfuscation)
 * Disguises RF beacon identifiers (BLE advertising / Wi-Fi Direct SSID)
 * as civilian consumer devices (smartwatches, printers, IoT sensors) and
 * provides UI stealth skins (Calculator, Battery Health, Notepad) for urban field operations.
 */

export interface CityCamouflagePreset {
  id: string;
  city: string;
  title: string;
  provinceOrRegion: string;
  description: string;
  rfStealthName: string; // e.g. "Xiaomi Smart Band 8", "HP LaserJet Pro P1102"
  rfProtocolMask: 'SMARTWATCH_SYNC' | 'WIFI_DIRECT_PRINTER' | 'BLE_IOT_BEACON' | 'AUDIO_BROADCAST';
  uiDisguiseMode: 'CALCULATOR' | 'NOTEPAD' | 'BATTERY_HEALTH' | 'WEATHER_CLEAN';
  radioFrequencyShift: string;
  antiJammingProfile: string;
  isProtestSafe: boolean;
  recommendedHotspots: string[];
}

export interface CityCamouflageState {
  isActive: boolean;
  currentPresetId: string;
  rfStealthName: string;
  uiDisguiseMode: 'CALCULATOR' | 'NOTEPAD' | 'BATTERY_HEALTH' | 'WEATHER_CLEAN';
  macScrambleActive: boolean;
  trafficPaddingActive: boolean;
  activatedAt?: number;
}

export const CITY_CAMOUFLAGE_PRESETS: CityCamouflagePreset[] = [
  {
    id: 'lahore-mall-road',
    city: 'Lahore',
    title: 'Lahore Mall Road & Liberty Stealth',
    provinceOrRegion: 'Punjab',
    description: 'Disguises mesh beacons as Xiaomi Smart Band. High-density protest camouflage with FHSS frequency hopping.',
    rfStealthName: 'Xiaomi Smart Band 8 (HR-62)',
    rfProtocolMask: 'SMARTWATCH_SYNC',
    uiDisguiseMode: 'CALCULATOR',
    radioFrequencyShift: '433.175 MHz LoRa / BLE 2.4 GHz Hopping',
    antiJammingProfile: 'Fast FHSS (12 hops/sec)',
    isProtestSafe: true,
    recommendedHotspots: ['Mall Road', 'Liberty Chowk', 'Canal Bank', 'Ferozepur Road']
  },
  {
    id: 'karachi-saddar',
    city: 'Karachi',
    title: 'Karachi Saddar & Clifton Concealment',
    provinceOrRegion: 'Sindh',
    description: 'Disguises node as Samsung Galaxy Watch6 with battery health diagnostic UI decoy.',
    rfStealthName: 'Galaxy Watch6 (BT-9901)',
    rfProtocolMask: 'SMARTWATCH_SYNC',
    uiDisguiseMode: 'BATTERY_HEALTH',
    radioFrequencyShift: '868.3 MHz DSSS / Wi-Fi Direct Peer',
    antiJammingProfile: 'Direct Sequence Spread Spectrum (DSSS)',
    isProtestSafe: true,
    recommendedHotspots: ['Saddar Market', 'Clifton Beach', 'M.A. Jinnah Rd', 'Numaish']
  },
  {
    id: 'islamabad-d-chowk',
    city: 'Islamabad',
    title: 'Islamabad Blue Area & D-Chowk Radio Silence',
    provinceOrRegion: 'Federal Capital',
    description: 'Conceals RF beacons as HP Wireless Printer. Notepad disguise with encrypted micro-burst packets.',
    rfStealthName: 'DIRECT-HP-DeskJet-2700',
    rfProtocolMask: 'WIFI_DIRECT_PRINTER',
    uiDisguiseMode: 'NOTEPAD',
    radioFrequencyShift: '2.4 GHz Low-Duty Bursts (1.2% duty)',
    antiJammingProfile: 'Adaptive Duty-Cycle Radio Silence',
    isProtestSafe: true,
    recommendedHotspots: ['D-Chowk', 'Blue Area', 'Sector F-7', 'Zero Point']
  },
  {
    id: 'rawalpindi-murree-rd',
    city: 'Rawalpindi',
    title: 'Rawalpindi Murree Road Decoy',
    provinceOrRegion: 'Punjab',
    description: 'Disguised as Soundcore Wireless Earbuds with offline weather forecast UI decoy.',
    rfStealthName: 'Soundcore Life P2i',
    rfProtocolMask: 'AUDIO_BROADCAST',
    uiDisguiseMode: 'WEATHER_CLEAN',
    radioFrequencyShift: '433.92 MHz Narrowband LoRa',
    antiJammingProfile: 'Dual-Channel Carrier Sense (LBT)',
    isProtestSafe: true,
    recommendedHotspots: ['Murree Road', 'Committee Chowk', 'Faizabad', 'Raja Bazaar']
  },
  {
    id: 'peshawar-saddar',
    city: 'Peshawar',
    title: 'Peshawar Saddar & University Town Camouflage',
    provinceOrRegion: 'Khyber Pakhtunkhwa',
    description: 'Disguised as Huawei Health Link with functional scientific calculator skin.',
    rfStealthName: 'HUAWEI-Band-8-09F',
    rfProtocolMask: 'SMARTWATCH_SYNC',
    uiDisguiseMode: 'CALCULATOR',
    radioFrequencyShift: '915.0 MHz LoRa / 2.4 GHz BLE',
    antiJammingProfile: 'Chirp Spread Spectrum',
    isProtestSafe: true,
    recommendedHotspots: ['Saddar Bazaar', 'University Town', 'Khyber Road', 'Hayatabad']
  },
  {
    id: 'faisalabad-clock-tower',
    city: 'Faisalabad',
    title: 'Faisalabad Clock Tower Urban Camo',
    provinceOrRegion: 'Punjab',
    description: 'Disguised as IoT Textile Telemetry Sensor with Battery Diagnostic UI disguise.',
    rfStealthName: 'IoT_Textile_Node_44',
    rfProtocolMask: 'BLE_IOT_BEACON',
    uiDisguiseMode: 'BATTERY_HEALTH',
    radioFrequencyShift: '433.500 MHz LoRa Spread',
    antiJammingProfile: 'Dynamic Random Hopping',
    isProtestSafe: true,
    recommendedHotspots: ['Ghanta Ghar', 'D-Ground', 'Jaranwala Rd', 'Satiana Rd']
  },
  {
    id: 'multan-cantt',
    city: 'Multan',
    title: 'Multan Cantt & Bohar Gate Concealment',
    provinceOrRegion: 'Punjab',
    description: 'Disguised as Sony Wireless Headphones with System Notepad skin.',
    rfStealthName: 'WH-1000XM4-LE',
    rfProtocolMask: 'AUDIO_BROADCAST',
    uiDisguiseMode: 'NOTEPAD',
    radioFrequencyShift: '868.1 MHz European/Asian Band',
    antiJammingProfile: 'Adaptive Frequency Agile',
    isProtestSafe: true,
    recommendedHotspots: ['Cantt Bazaar', 'Bohar Gate', 'Nawan Shehr', 'Chowk Kutchery']
  },
  {
    id: 'quetta-serena',
    city: 'Quetta',
    title: 'Quetta Serena & Joint Road Stealth',
    provinceOrRegion: 'Balochistan',
    description: 'Disguised as TP-Link Wi-Fi Range Extender with Calculator disguise.',
    rfStealthName: 'TP-Link_Extender_2.4GHz',
    rfProtocolMask: 'WIFI_DIRECT_PRINTER',
    uiDisguiseMode: 'CALCULATOR',
    radioFrequencyShift: '433.250 MHz Low Power',
    antiJammingProfile: 'Sub-Ghz Chirp Hopping',
    isProtestSafe: true,
    recommendedHotspots: ['Joint Road', 'Zarghoon Road', 'Liaquat Bazaar', 'Manojan Road']
  }
];

const CAMOUFLAGE_STORAGE_KEY = 'qaidi_city_camouflage_state_v1';

let inMemoryCamouflageState: CityCamouflageState = {
  isActive: false,
  currentPresetId: 'lahore-mall-road',
  rfStealthName: 'Xiaomi Smart Band 8 (HR-62)',
  uiDisguiseMode: 'CALCULATOR',
  macScrambleActive: true,
  trafficPaddingActive: true
};

/**
 * Retrieves the current City Camouflage state.
 */
export function getCityCamouflageState(): CityCamouflageState {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CAMOUFLAGE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // Ignore fallback
  }
  return inMemoryCamouflageState;
}

/**
 * Activates a specific City Camouflage preset.
 */
export function activateCityCamouflage(presetId: string): CityCamouflageState {
  const preset = CITY_CAMOUFLAGE_PRESETS.find(p => p.id === presetId) || CITY_CAMOUFLAGE_PRESETS[0];

  const nextState: CityCamouflageState = {
    isActive: true,
    currentPresetId: preset.id,
    rfStealthName: preset.rfStealthName,
    uiDisguiseMode: preset.uiDisguiseMode,
    macScrambleActive: true,
    trafficPaddingActive: true,
    activatedAt: Date.now()
  };

  inMemoryCamouflageState = nextState;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CAMOUFLAGE_STORAGE_KEY, JSON.stringify(nextState));
    }
  } catch {
    // Ignore
  }

  return nextState;
}

/**
 * Deactivates City Camouflage and returns to standard Qaidi Mesh identity.
 */
export function deactivateCityCamouflage(): CityCamouflageState {
  const nextState: CityCamouflageState = {
    ...getCityCamouflageState(),
    isActive: false
  };

  inMemoryCamouflageState = nextState;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CAMOUFLAGE_STORAGE_KEY, JSON.stringify(nextState));
    }
  } catch {
    // Ignore
  }

  return nextState;
}

/**
 * Searches City Camouflage presets with query matching:
 * Matches city names, keywords like "cemuflage", "camouflage", "stealth", "decoy", "hotspots", etc.
 */
export function searchCityCamouflage(query: string): CityCamouflagePreset[] {
  const q = query.toLowerCase().trim();
  if (!q) return CITY_CAMOUFLAGE_PRESETS;

  // General camouflage intent keywords
  const isCamoQuery = ['cemuflage', 'camouflage', 'camo', 'stealth', 'decoy', 'disguise', 'city', 'urban', 'protest', 'jamming', 'rf'].some(kw => q.includes(kw));

  if (isCamoQuery) {
    // Return all presets if just typing general keyword
    return CITY_CAMOUFLAGE_PRESETS;
  }

  return CITY_CAMOUFLAGE_PRESETS.filter(p => {
    return (
      p.city.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.provinceOrRegion.toLowerCase().includes(q) ||
      p.rfStealthName.toLowerCase().includes(q) ||
      p.recommendedHotspots.some(h => h.toLowerCase().includes(q))
    );
  });
}
