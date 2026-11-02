/**
 * Offline-Online Hybrid & GitHub Private Fallback Routing Engine
 * - When Bluetooth / Location / Mesh radios are turned OFF or out of range,
 *   encrypted chat packets are buffered safely in local Android Room DB.
 * - When internet reconnects, packets are synchronized to a private GitHub repository
 *   (e.g., https://api.github.com/repos/qaidi-secure/private-mesh-store/packets/)
 *   acting as an asynchronous encrypted DTN rendezvous relay.
 * - Packets remain in the private GitHub store until the recipient node fetches them
 *   and confirms receipt, enabling seamless, uninterrupted E2EE communication.
 */

export interface PrivatePacketRecord {
  packetId: string;
  senderHandle: string;
  recipientHandle: string;
  encryptedCiphertext: string;
  ivHex: string;
  createdAt: number;
  status: 'STORED_LOCALLY_ROOM_DB' | 'SYNCED_TO_GITHUB_PRIVATE' | 'DELIVERED_TO_RECIPIENT';
  githubCommitSha?: string;
  deliveryConfirmedAt?: number;
  radioStateWhenSent: {
    bluetoothEnabled: boolean;
    locationServicesEnabled: boolean;
    wifiMeshEnabled: boolean;
  };
}

export interface RadioStatus {
  bluetoothEnabled: boolean;
  locationServicesEnabled: boolean;
  wifiMeshEnabled: boolean;
  cellularDataActive: boolean;
  wifiInternetActive: boolean;
}

export interface GitHubBridgeConfig {
  repoOwner: string;
  repoName: string;
  encryptedRelayBranch: string;
  apiBaseUrl: string;
}

export const DEFAULT_GITHUB_CONFIG: GitHubBridgeConfig = {
  repoOwner: 'qaidi-secure',
  repoName: 'mesh-relay-fallback',
  encryptedRelayBranch: 'main',
  apiBaseUrl: 'https://api.github.com'
};

/**
 * Determines whether a message can be delivered instantly over local physical mesh,
 * or if it must be buffered locally in Room DB due to disabled radios / no mesh connectivity.
 */
export function determineRoutingPath(
  radioStatus: RadioStatus,
  hasDirectMeshPeers: boolean
): 'DIRECT_MESH_TRANSMISSION' | 'BUFFER_IN_LOCAL_ROOM_DB' | 'ROUTE_VIA_GITHUB_PRIVATE' {
  // If mesh radios are disabled (user turned off Bluetooth/Location/Wi-Fi)
  const isMeshRadiosOff = !radioStatus.bluetoothEnabled || !radioStatus.locationServicesEnabled || !radioStatus.wifiMeshEnabled;

  if (isMeshRadiosOff || !hasDirectMeshPeers) {
    // If internet is active, can upload straight to GitHub private fallback
    if (radioStatus.wifiInternetActive || radioStatus.cellularDataActive) {
      return 'ROUTE_VIA_GITHUB_PRIVATE';
    }
    // Otherwise store locally in Room DB
    return 'BUFFER_IN_LOCAL_ROOM_DB';
  }

  return 'DIRECT_MESH_TRANSMISSION';
}

/**
 * Enqueues an encrypted message packet into local Room DB storage.
 */
export function enqueueOfflineChatPacket(
  packetId: string,
  senderHandle: string,
  recipientHandle: string,
  encryptedCiphertext: string,
  ivHex: string,
  radioStatus: RadioStatus,
  existingQueue: PrivatePacketRecord[] = []
): { updatedQueue: PrivatePacketRecord[]; packet: PrivatePacketRecord } {
  const newPacket: PrivatePacketRecord = {
    packetId,
    senderHandle,
    recipientHandle,
    encryptedCiphertext,
    ivHex,
    createdAt: Date.now(),
    status: 'STORED_LOCALLY_ROOM_DB',
    radioStateWhenSent: {
      bluetoothEnabled: radioStatus.bluetoothEnabled,
      locationServicesEnabled: radioStatus.locationServicesEnabled,
      wifiMeshEnabled: radioStatus.wifiMeshEnabled
    }
  };

  return {
    updatedQueue: [...existingQueue, newPacket],
    packet: newPacket
  };
}

/**
 * Simulates syncing locally buffered Room DB packets to the private GitHub repository
 * once an active internet connection is detected.
 */
export function syncBufferedPacketsToGitHub(
  queue: PrivatePacketRecord[],
  isInternetAvailable: boolean,
  config: GitHubBridgeConfig = DEFAULT_GITHUB_CONFIG
): {
  syncedQueue: PrivatePacketRecord[];
  syncedCount: number;
  apiDispatches: Array<{ path: string; commitSha: string }>;
} {
  if (!isInternetAvailable) {
    return { syncedQueue: queue, syncedCount: 0, apiDispatches: [] };
  }

  const dispatches: Array<{ path: string; commitSha: string }> = [];
  let syncedCount = 0;

  const syncedQueue = queue.map(packet => {
    if (packet.status === 'STORED_LOCALLY_ROOM_DB') {
      const commitSha = `gh_commit_${packet.packetId.slice(0, 8)}_${Math.random().toString(16).slice(2, 6)}`;
      const filePath = `packets/${packet.recipientHandle}/${packet.packetId}.bin.enc`;
      dispatches.push({ path: filePath, commitSha });
      syncedCount++;
      return {
        ...packet,
        status: 'SYNCED_TO_GITHUB_PRIVATE' as const,
        githubCommitSha: commitSha
      };
    }
    return packet;
  });

  return {
    syncedQueue,
    syncedCount,
    apiDispatches: dispatches
  };
}

/**
 * Confirms receipt by the destination peer, transitioning the packet to DELIVERED
 * and purging it from the active rendezvous store.
 */
export function confirmPacketDeliveredByRecipient(
  queue: PrivatePacketRecord[],
  packetId: string,
  recipientHandle: string
): { updatedQueue: PrivatePacketRecord[]; isConfirmed: boolean } {
  let isConfirmed = false;
  const updatedQueue = queue.map(pkt => {
    if (pkt.packetId === packetId && pkt.recipientHandle.toLowerCase() === recipientHandle.toLowerCase()) {
      isConfirmed = true;
      return {
        ...pkt,
        status: 'DELIVERED_TO_RECIPIENT' as const,
        deliveryConfirmedAt: Date.now()
      };
    }
    return pkt;
  });

  return { updatedQueue, isConfirmed };
}
