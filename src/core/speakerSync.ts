/**
 * Multi-Device Acoustic Speaker Sync & Host Engine
 * Synchronizes audio playback across multiple nearby Android phones
 * over Wi-Fi Direct and BLE mesh with sub-10ms clock drift compensation.
 * Enables stadium-scale megaphone broadcasts, emergency sirens, and group listening.
 */

export type SpeakerSyncMode = 'IDLE' | 'HOST' | 'LISTENER';
export type AudioSourceType =
  | 'LIVE_MIC'
  | 'SIREN_ALERT'
  | 'CAMPUS_NOTICE'
  | 'RADIO_RELAY'
  | 'SLOGAN_CHANT'
  | 'PUBLIC_SPEECH'
  | 'STORAGE_FILE';

export interface StorageAudioFileMeta {
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  durationSec: number;
  isCustomUploaded: boolean;
  objectUrl?: string;
  rawBase64?: string;
}

export interface SloganChantItem {
  id: string;
  title: string;
  urduTitle: string;
  rhythmBpm: number;
  durationSec: number;
  sampleLyrics: string;
  tags: string[];
}

export interface PublicSpeechItem {
  id: string;
  speaker: string;
  title: string;
  durationSec: number;
  description: string;
  language: string;
}

export const SLOGAN_PRESETS: SloganChantItem[] = [
  {
    id: 'slogan-azadi-inqilab',
    title: 'Azadi & Inqilab Rally Echo',
    urduTitle: 'آزادی اور انقلاب کے پرجوش نعرے',
    rhythmBpm: 120,
    durationSec: 45,
    sampleLyrics: 'Azadi! Hamara Haq Hai Azadi! Zulm Ke Zanjeer Tor Denge!',
    tags: ['Protest', 'High-Cadence', 'Stadium Echo']
  },
  {
    id: 'slogan-haqooq-awaam',
    title: 'Awami Haqooq & Constitution Defense',
    urduTitle: 'عوامی حقوق اور آئینی خودداری',
    rhythmBpm: 110,
    durationSec: 60,
    sampleLyrics: 'Awaam Ki Awaaz, Jamhooriyat Ka Raaj! Haqooq Do!',
    tags: ['Civil Rights', 'Assembly Chorus']
  },
  {
    id: 'slogan-justice-resistance',
    title: 'Peaceful Resistance Solidarity Loop',
    urduTitle: 'پرامن جدوجہد اور اتحادِ عوام',
    rhythmBpm: 95,
    durationSec: 50,
    sampleLyrics: 'Ittehad, Ittehad, Aman Aur Azadi! Zulm Namanzoor!',
    tags: ['Solidarity', 'Synchronized Chant']
  }
];

export const SPEECH_PRESETS: PublicSpeechItem[] = [
  {
    id: 'speech-assembly-address',
    speaker: 'Chief Rally Organizer',
    title: 'Assembly Keynote: Peaceful Assembly & Resilience Directives',
    durationSec: 240,
    description: 'Direct acoustic address to gathering crowd regarding discipline, unity, and legal protections.',
    language: 'Urdu & English'
  },
  {
    id: 'speech-legal-briefing',
    speaker: 'Volunteer Legal Counsel',
    title: 'Emergency Legal Rights & Detainment SOPs Briefing',
    durationSec: 180,
    description: 'Instructions on phone encryption zeroization, right to counsel, and emergency bail contacts.',
    language: 'Urdu'
  },
  {
    id: 'speech-dispersal-routes',
    speaker: 'Field Coordinator @qaidi156156',
    title: 'Dispersal Pathways & Medical First-Aid Evacuation Broadcast',
    durationSec: 150,
    description: 'Real-time coordinated audio broadcast to avoid tear gas corridors and reach medical shelters.',
    language: 'Urdu'
  }
];

export interface SpeakerNodeSim {
  id: string;
  handle: string;
  isHost: boolean;
  driftMs: number;
  volumePct: number;
  isMuted: boolean;
  rssiDbm: number;
}

export interface SpeakerSyncSession {
  sessionId: string;
  hostHandle: string;
  sourceType: AudioSourceType;
  sourceTitle: string;
  isPlaying: boolean;
  playbackPositionSec: number;
  totalDurationSec: number;
  bufferLatencyMs: number;
  connectedNodes: SpeakerNodeSim[];
  meshFrequency: string;
  isLooped?: boolean;
  activeSloganId?: string;
  activeSpeechId?: string;
  storageFileMeta?: StorageAudioFileMeta;
}

export const INITIAL_SYNC_SESSION: SpeakerSyncSession = {
  sessionId: 'SYNC-8821',
  hostHandle: 'qaidi156156',
  sourceType: 'SLOGAN_CHANT',
  sourceTitle: 'Azadi & Inqilab Rally Echo (آزادی اور انقلاب کے نعرے)',
  isPlaying: false,
  playbackPositionSec: 0,
  totalDurationSec: 45,
  bufferLatencyMs: 45,
  meshFrequency: '433.175 MHz LoRa / Wi-Fi Multicast',
  isLooped: true,
  activeSloganId: 'slogan-azadi-inqilab',
  connectedNodes: [
    { id: 'node-1', handle: 'qaidi7711', isHost: false, driftMs: 1.2, volumePct: 90, isMuted: false, rssiDbm: -58 },
    { id: 'node-2', handle: 'qaidi3390', isHost: false, driftMs: -2.4, volumePct: 85, isMuted: false, rssiDbm: -64 },
    { id: 'node-3', handle: 'qaidi5522', isHost: false, driftMs: 0.8, volumePct: 100, isMuted: false, rssiDbm: -52 }
  ]
};

/**
 * Creates a new Host Speaker Session.
 */
export function createSpeakerHostSession(
  hostHandle: string,
  sourceType: AudioSourceType = 'LIVE_MIC',
  customTitle?: string,
  storageMeta?: StorageAudioFileMeta
): SpeakerSyncSession {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const titles: Record<AudioSourceType, string> = {
    LIVE_MIC: 'Live Mesh Megaphone (Active Voice)',
    SIREN_ALERT: 'Emergency Warning Siren (High-Pitch 1.2kHz)',
    CAMPUS_NOTICE: 'Urdu Relief Audio Notice (Relayed)',
    RADIO_RELAY: 'LoRa Walkie-Talkie Multi-Speaker Stream',
    SLOGAN_CHANT: 'Azadi & Inqilab Rally Echo (آزادی اور انقلاب کے نعرے)',
    PUBLIC_SPEECH: 'Assembly Keynote: Peaceful Assembly & Resilience Directives',
    STORAGE_FILE: storageMeta?.fileName ? `Storage Audio: ${storageMeta.fileName}` : 'Local Storage Audio File'
  };

  const durationMap: Record<AudioSourceType, number> = {
    LIVE_MIC: 300,
    SIREN_ALERT: 120,
    CAMPUS_NOTICE: 180,
    RADIO_RELAY: 600,
    SLOGAN_CHANT: 45,
    PUBLIC_SPEECH: 240,
    STORAGE_FILE: storageMeta?.durationSec || 180
  };

  return {
    sessionId: `SYNC-${randomSuffix}`,
    hostHandle,
    sourceType,
    sourceTitle: customTitle || titles[sourceType],
    isPlaying: true,
    playbackPositionSec: 0,
    totalDurationSec: durationMap[sourceType],
    bufferLatencyMs: 45,
    meshFrequency: 'Wi-Fi Direct P2P Audio Multicast (Opus 24kbps)',
    isLooped: sourceType === 'SLOGAN_CHANT',
    storageFileMeta: storageMeta,
    activeSloganId: sourceType === 'SLOGAN_CHANT' ? 'slogan-azadi-inqilab' : undefined,
    activeSpeechId: sourceType === 'PUBLIC_SPEECH' ? 'speech-assembly-address' : undefined,
    connectedNodes: [
      { id: 'host-node', handle: hostHandle, isHost: true, driftMs: 0.0, volumePct: 100, isMuted: false, rssiDbm: -35 }
    ]
  };
}

/**
 * Calculates clock synchronization drift in milliseconds.
 * Simulates Precision Time Protocol (PTP IEEE 1588) over local ad-hoc Wi-Fi/BLE frames.
 */
export function calculateClockSyncDrift(localTimestampMs: number, hostPacketTimestampMs: number): number {
  const delta = (localTimestampMs - hostPacketTimestampMs) % 100;
  // Map to a realistic tight drift between -5.0ms and +5.0ms
  const normalized = (delta / 10) - 5;
  return Math.round(normalized * 10) / 10;
}

/**
 * Simulates listener joining an active session.
 */
export function joinSpeakerSession(
  session: SpeakerSyncSession,
  listenerHandle: string
): SpeakerSyncSession {
  const existing = session.connectedNodes.find(n => n.handle === listenerHandle);
  if (existing) return session;

  const newNode: SpeakerNodeSim = {
    id: `node-${Date.now()}`,
    handle: listenerHandle,
    isHost: false,
    driftMs: (Math.random() * 4 - 2), // ±2ms drift
    volumePct: 90,
    isMuted: false,
    rssiDbm: -60
  };

  return {
    ...session,
    connectedNodes: [...session.connectedNodes, newNode]
  };
}
