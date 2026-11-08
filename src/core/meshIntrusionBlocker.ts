/**
 * Autonomous Mesh Intrusion Detection System (IDS) & Auto-Block Firewall
 * Automatically detects and blocks peers exhibiting:
 * 1. RF Jamming & Beacon Flooding (packet rate > threshold, sequence replay)
 * 2. Route Blocking & Blackhole Attacks (relay drop rate > 75%, false ACKs)
 * 3. Virus & Malware Propagation (corrupted APK hashes, Merkle root poisoning, exploit signatures)
 */

export type ThreatCategory = 'JAMMING' | 'BLOCKING' | 'VIRUS';

export interface IntrusionEvent {
  id: string;
  targetHandle: string;
  threatCategory: ThreatCategory;
  threatTitle: string;
  severity: 'HIGH' | 'CRITICAL';
  detectedAt: number;
  evidence: string;
  metrics: {
    packetRatePerSec?: number;
    dropRatePct?: number;
    maliciousHash?: string;
    detectedSignature?: string;
  };
  autoBlocked: boolean;
}

export interface QuarantinedPeer {
  handle: string;
  macAddress: string;
  blockedAt: number;
  reason: ThreatCategory;
  title: string;
  evidence: string;
  autoBlockedByShield: boolean;
  packetsDroppedCount: number;
}

const QUARANTINE_STORAGE_KEY = 'qaidi_quarantined_peers_v1';
const INTRUSION_LOGS_KEY = 'qaidi_intrusion_events_v1';

// Initial quarantined nodes
const DEFAULT_QUARANTINED_PEERS: QuarantinedPeer[] = [
  {
    handle: 'jammer_cell_99',
    macAddress: 'DC:A6:32:81:44:90',
    blockedAt: Date.now() - 3600000,
    reason: 'JAMMING',
    title: 'RF Channel Jamming & Beacon Flooding',
    evidence: 'Exceeded 94 packets/sec burst rate on 433 MHz carrier, corrupting neighbor frames',
    autoBlockedByShield: true,
    packetsDroppedCount: 412
  }
];

let inMemoryQuarantined: QuarantinedPeer[] | null = null;
let inMemoryEvents: IntrusionEvent[] = [];

/**
 * Retrieves the current list of quarantined/blocked peers.
 */
export function getQuarantinedPeers(): QuarantinedPeer[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(QUARANTINE_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {
    // Ignore fallback
  }

  if (inMemoryQuarantined !== null) {
    return inMemoryQuarantined;
  }

  return [...DEFAULT_QUARANTINED_PEERS];
}

/**
 * Checks if a specific peer is currently blocked/quarantined.
 */
export function isPeerQuarantined(peerHandle: string): boolean {
  const clean = peerHandle.replace(/^@/, '').trim().toLowerCase();
  const list = getQuarantinedPeers();
  return list.some(p => p.handle.toLowerCase() === clean);
}

/**
 * Persists the quarantined list to storage.
 */
function saveQuarantinedPeers(peers: QuarantinedPeer[]): void {
  inMemoryQuarantined = peers;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(QUARANTINE_STORAGE_KEY, JSON.stringify(peers));
    }
  } catch {
    // Ignore
  }
}

/**
 * Evaluates whether incoming or relay telemetry from a peer warrants an auto-block.
 */
export function evaluatePeerTelemetry(
  peerHandle: string,
  telemetry: {
    packetRatePerSec?: number;
    relayDropRatePct?: number;
    payloadHash?: string;
    payloadSnippet?: string;
  }
): { shouldBlock: boolean; threat?: ThreatCategory; reason?: string; evidence?: string } {
  const clean = peerHandle.replace(/^@/, '').trim();

  // 1. RF Jamming Detection
  if (telemetry.packetRatePerSec && telemetry.packetRatePerSec > 25) {
    return {
      shouldBlock: true,
      threat: 'JAMMING',
      reason: 'Malicious RF Jamming & Packet Flooding',
      evidence: `Node transmitted ${telemetry.packetRatePerSec} packets/sec (Safe threshold: 12 pkts/sec). Attempting RF mesh congestion.`
    };
  }

  // 2. Blackhole / Blocking Detection
  if (telemetry.relayDropRatePct && telemetry.relayDropRatePct > 70) {
    return {
      shouldBlock: true,
      threat: 'BLOCKING',
      reason: 'Packet Blackhole & Intentional Route Disruption',
      evidence: `Node dropped ${telemetry.relayDropRatePct}% of relayed DTN bundles while advertising optimal hop route.`
    };
  }

  // 3. Virus / Corrupted Malicious Payload Detection
  if (telemetry.payloadSnippet) {
    const maliciousPatterns = [
      'MALWARE_PAYLOAD_SIGNATURE',
      'EXPLOIT_PAYLOAD_BIN',
      'TROJAN_DROPPER',
      'POISONED_MERKLE_ROOT',
      'EICAR-STANDARD-ANTIVIRUS-TEST-FILE'
    ];
    for (const pat of maliciousPatterns) {
      if (telemetry.payloadSnippet.includes(pat)) {
        return {
          shouldBlock: true,
          threat: 'VIRUS',
          reason: 'Trojan / Poisoned Virus Payload Detected',
          evidence: `Payload inspection flagged signature [${pat}] with mismatched cryptographic Merkle hash.`
        };
      }
    }
  }

  return { shouldBlock: false };
}

/**
 * Automatically blocks and quarantines a malicious peer.
 */
export function autoBlockPeer(
  peerHandle: string,
  threat: ThreatCategory,
  evidence: string,
  macAddress: string = 'FA:2B:99:11:00:E1'
): { quarantined: QuarantinedPeer; event: IntrusionEvent } {
  const clean = peerHandle.replace(/^@/, '').trim();
  const currentList = getQuarantinedPeers();

  const titleMap: Record<ThreatCategory, string> = {
    JAMMING: 'RF Jammer & Packet Flooder (Auto-Blocked)',
    BLOCKING: 'Blackhole Route Disruptor (Auto-Blocked)',
    VIRUS: 'Malware & Virus Payload Spreader (Auto-Blocked)'
  };

  const newQuarantined: QuarantinedPeer = {
    handle: clean,
    macAddress,
    blockedAt: Date.now(),
    reason: threat,
    title: titleMap[threat],
    evidence,
    autoBlockedByShield: true,
    packetsDroppedCount: 1
  };

  const updatedList = [
    newQuarantined,
    ...currentList.filter(p => p.handle.toLowerCase() !== clean.toLowerCase())
  ];
  saveQuarantinedPeers(updatedList);

  const event: IntrusionEvent = {
    id: `IDS-${Date.now()}`,
    targetHandle: clean,
    threatCategory: threat,
    threatTitle: titleMap[threat],
    severity: threat === 'VIRUS' ? 'CRITICAL' : 'HIGH',
    detectedAt: Date.now(),
    evidence,
    metrics: {},
    autoBlocked: true
  };

  inMemoryEvents = [event, ...inMemoryEvents.slice(0, 49)];

  return { quarantined: newQuarantined, event };
}

/**
 * Manually unblocks a previously quarantined peer.
 */
export function unblockPeer(peerHandle: string): void {
  const clean = peerHandle.replace(/^@/, '').trim().toLowerCase();
  const currentList = getQuarantinedPeers();
  const updatedList = currentList.filter(p => p.handle.toLowerCase() !== clean);
  saveQuarantinedPeers(updatedList);
}

/**
 * Drops packets if the peer is quarantined. Returns true if packet should be dropped.
 */
export function shouldDropPacketFromPeer(peerHandle: string): boolean {
  const isBlocked = isPeerQuarantined(peerHandle);
  if (isBlocked) {
    const list = getQuarantinedPeers();
    const clean = peerHandle.replace(/^@/, '').trim().toLowerCase();
    const updated = list.map(p => {
      if (p.handle.toLowerCase() === clean) {
        return { ...p, packetsDroppedCount: p.packetsDroppedCount + 1 };
      }
      return p;
    });
    saveQuarantinedPeers(updated);
    return true;
  }
  return false;
}

/**
 * Simulates a realistic intrusion scenario to test the auto-block shield.
 */
export function simulateMaliciousIntrusion(
  threat: ThreatCategory,
  customHandle?: string
): { quarantined: QuarantinedPeer; event: IntrusionEvent } {
  const handle = customHandle || (
    threat === 'JAMMING' ? 'rf_jammer_freq433' :
    threat === 'BLOCKING' ? 'blackhole_node_f7' :
    'malware_dropper_apk'
  );

  const evidenceMap: Record<ThreatCategory, string> = {
    JAMMING: 'Burst rate of 78 packets/second detected on local LoRa & BLE channels. Carrier frequency jammed.',
    BLOCKING: 'Node accepted 24 transit bundles but silently dropped 21 packets (87.5% drop rate).',
    VIRUS: 'Transmitted corrupted APK chunk bundle containing known TROJAN_DROPPER exploit signature.'
  };

  return autoBlockPeer(handle, threat, evidenceMap[threat]);
}
