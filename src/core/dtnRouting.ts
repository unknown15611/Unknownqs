/**
 * Delay-Tolerant Networking (DTN) Store-and-Forward Engine Logic
 * Supports PRoPHET routing metrics, TTL expiration, priority queuing, and epidemic store-forward.
 */

export interface VideoAttachmentMeta {
  videoId: string;
  title: string;
  durationSec: number;
  totalChunks: number;
  cachedChunks: number;
  merkleRoot: string;
  sizeMb: number;
}

export interface DtnPacket {
  id: string;
  sourceHandle: string;
  destinationHandle: string; // or "*" for broadcast
  payloadCiphertext: string;
  relayOnionHeader: string;
  createdAt: number;
  ttlSeconds: number;
  hopsRemaining: number;
  isUrgent: boolean;
  status: 'PENDING_FORWARD' | 'DELIVERED' | 'EXPIRED' | 'RELAYED';
  videoAttachment?: VideoAttachmentMeta;
}

export interface PeerContactHistory {
  peerHandle: string;
  lastEncounterTime: number;
  deliveryPredictability: number; // 0.0 to 1.0 (PRoPHET P_a_b)
}

const P_ENCOUNTER_DEFAULT = 0.75;
const GAMMA_AGING_FACTOR = 0.98; // aging constant per hour

/**
 * Updates delivery predictability upon encountering a peer (PRoPHET metric)
 * P_a_b = P_a_b_old + (1 - P_a_b_old) * P_encounter
 */
export function updatePredictabilityOnEncounter(oldP: number): number {
  const boundedOld = Math.max(0, Math.min(1, oldP));
  const newP = boundedOld + (1 - boundedOld) * P_ENCOUNTER_DEFAULT;
  return Math.min(1.0, Math.round(newP * 1000) / 1000);
}

/**
 * Ages delivery predictability when time passes without encounter
 * P_a_b = P_a_b_old * (GAMMA ^ deltaHours)
 */
export function agePredictability(oldP: number, deltaHours: number): number {
  const aged = oldP * Math.pow(GAMMA_AGING_FACTOR, Math.max(0, deltaHours));
  return Math.max(0, Math.round(aged * 1000) / 1000);
}

/**
 * Checks if a DTN packet has expired based on current time.
 */
export function isPacketExpired(packet: DtnPacket, currentTime: number = Date.now()): boolean {
  const ageSeconds = (currentTime - packet.createdAt) / 1000;
  return ageSeconds > packet.ttlSeconds || packet.hopsRemaining <= 0;
}

/**
 * Selects packets eligible for forwarding to an encountered peer.
 * Prioritizes urgent packets first, then packets destined directly for peer or with high predictability.
 */
export function selectPacketsToForward(
  queue: DtnPacket[],
  encounteredPeer: string,
  predictabilityMap: Record<string, number>,
  currentTime: number = Date.now()
): DtnPacket[] {
  const activePackets = queue.filter(p => !isPacketExpired(p, currentTime) && p.status === 'PENDING_FORWARD');

  return activePackets.sort((a, b) => {
    // 1. Urgent packets always first
    if (a.isUrgent !== b.isUrgent) {
      return a.isUrgent ? -1 : 1;
    }
    // 2. Direct destination match
    const aIsDirect = a.destinationHandle === encounteredPeer || a.destinationHandle === "*";
    const bIsDirect = b.destinationHandle === encounteredPeer || b.destinationHandle === "*";
    if (aIsDirect !== bIsDirect) {
      return aIsDirect ? -1 : 1;
    }
    // 3. PRoPHET predictability score for destination
    const predA = predictabilityMap[a.destinationHandle] || 0.1;
    const predB = predictabilityMap[b.destinationHandle] || 0.1;
    return predB - predA;
  });
}
