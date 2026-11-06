/**
 * Realistic Simulated State for Qaidi Link Interactive Android Hub
 * Includes WhatsApp-Style Decentralized Mesh Groups with Group Admins & Member Control,
 * Global Super Admin locked to @Qaidi156, P2P Chat Video Sharing, Offline Captive Portal APK Distribution,
 * and 20-video download ad threshold.
 */
import { VideoAttachmentMeta } from '../core/dtnRouting';

export interface PeerNodeSim {
  id: string;
  handle: string;
  transports: ('WIFI_DIRECT' | 'WIFI_AWARE' | 'BLE_MESH' | 'LOCAL_ROUTER_P2P')[];
  activeTransport: 'WIFI_DIRECT' | 'WIFI_AWARE' | 'BLE_MESH' | 'LOCAL_ROUTER_P2P';
  rssiDbm: number;
  hopCount: number;
  distanceMeters: number;
  angleDeg: number;
  publicKeyHex: string;
  lastSeenSecAgo: number;
  isRelayNode: boolean;
  isReachable?: boolean;
  status?: 'ONLINE' | 'OFFLINE';
}

export interface DtnPacketSim {
  id: string;
  source: string;
  destination: string;
  preview: string;
  createdAt: number;
  hopsLeft: number;
  isUrgent: boolean;
  status: 'DELIVERED' | 'HOPPING' | 'STORED_IN_ROOM_DB';
  relayToken: string;
  groupId?: string;
  videoAttachment?: VideoAttachmentMeta;
}

export interface OfflineReelSim {
  id: string;
  title: string;
  creator: string;
  durationSec: number;
  totalChunks: number;
  cachedChunks: number;
  merkleRoot: string;
  isVerified: boolean;
  swarmPeersCount: number;
  sizeMb: number;
  downloadCount: number;
}

export interface GroupJoinRequest {
  id: string;
  userHandle: string;
  requestedAt: number;
  qrInviteCodeUsed?: string;
}

export interface MeshGroupSim {
  id: string;
  name: string;
  description: string;
  creator: string;
  admins: string[]; // List of handles that are Group Admins (like WhatsApp)
  members: string[]; // All handles
  onlyAdminsCanPost: boolean;
  isVoiceChatEnabled?: boolean;
  avatarColor: string;
  qrInviteCode?: string;
  isQrJoinEnabled?: boolean;
  pendingJoinRequests?: GroupJoinRequest[];
}

export interface PublicHandleSim {
  handle: string;
  publicKeyHex: string;
  verifiedBadge: boolean;
  syncTimestamp: number;
}

export interface CommunityBroadcastSim {
  id: string;
  title: string;
  author: string;
  content: string;
  publishedAt: number;
  isOfficialSigned: boolean;
  signatureHex: string;
}

export const INITIAL_PEERS: PeerNodeSim[] = [
  {
    id: 'peer-bob',
    handle: '@bob_mesh',
    transports: ['WIFI_AWARE', 'BLE_MESH'],
    activeTransport: 'WIFI_AWARE',
    rssiDbm: -58,
    hopCount: 1,
    distanceMeters: 14,
    angleDeg: 45,
    publicKeyHex: '04c3e8a1002244bbcc998877665544332211aabbccddeeff0011223344556677',
    lastSeenSecAgo: 3,
    isRelayNode: false,
    isReachable: true,
    status: 'ONLINE'
  },
  {
    id: 'peer-charlie',
    handle: '@charlie_rescue',
    transports: ['BLE_MESH'],
    activeTransport: 'BLE_MESH',
    rssiDbm: -74,
    hopCount: 2,
    distanceMeters: 38,
    angleDeg: 190,
    publicKeyHex: '0499887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
    lastSeenSecAgo: 8,
    isRelayNode: true,
    isReachable: true,
    status: 'ONLINE'
  },
  {
    id: 'peer-router-ap',
    handle: 'Camp_Alpha_P2P_Router',
    transports: ['LOCAL_ROUTER_P2P', 'WIFI_DIRECT'],
    activeTransport: 'LOCAL_ROUTER_P2P',
    rssiDbm: -42,
    hopCount: 1,
    distanceMeters: 8,
    angleDeg: 310,
    publicKeyHex: 'ROUTER_AP_NO_KEY_SOCKET_ONLY',
    lastSeenSecAgo: 1,
    isRelayNode: true,
    isReachable: true,
    status: 'ONLINE'
  },
  {
    id: 'peer-relay-node',
    handle: '@relay_ridge_04',
    transports: ['WIFI_DIRECT', 'WIFI_AWARE'],
    activeTransport: 'WIFI_DIRECT',
    rssiDbm: -66,
    hopCount: 1,
    distanceMeters: 26,
    angleDeg: 110,
    publicKeyHex: '04eeff00112233445566778899aabbccddeeff00112233445566778899aabbcc',
    lastSeenSecAgo: 5,
    isRelayNode: true,
    isReachable: true,
    status: 'ONLINE'
  },
  {
    id: 'peer-tariq-valley',
    handle: '@tariq_valley',
    transports: ['BLE_MESH'],
    activeTransport: 'BLE_MESH',
    rssiDbm: -99,
    hopCount: 0,
    distanceMeters: 850,
    angleDeg: 235,
    publicKeyHex: '04a1b2c3d4e5f600112233445566778899aabbccddeeff001122334455667788',
    lastSeenSecAgo: 4200,
    isRelayNode: false,
    isReachable: false,
    status: 'OFFLINE'
  },
  {
    id: 'peer-usman-remote',
    handle: '@usman_remote',
    transports: ['WIFI_DIRECT'],
    activeTransport: 'WIFI_DIRECT',
    rssiDbm: -105,
    hopCount: 0,
    distanceMeters: 1400,
    angleDeg: 15,
    publicKeyHex: '04ffeeddccbbaa00112233445566778899aabbccddeeff001122334455667788',
    lastSeenSecAgo: 7900,
    isRelayNode: false,
    isReachable: false,
    status: 'OFFLINE'
  }
];

export const INITIAL_GROUPS: MeshGroupSim[] = [
  {
    id: 'group-mesh-ops',
    name: 'Sector 4 Tactical Operations',
    description: 'Decentralized field responders & search teams over mesh radio.',
    creator: '@Qaidi156',
    admins: ['@Qaidi156', '@bob_mesh'],
    members: ['@Qaidi156', '@bob_mesh', '@charlie_rescue', '@relay_ridge_04'],
    onlyAdminsCanPost: false,
    avatarColor: 'from-emerald-500 to-teal-700',
    qrInviteCode: 'INV-OPS-9841',
    isQrJoinEnabled: true,
    pendingJoinRequests: [
      {
        id: 'req-join-01',
        userHandle: 'qaidi88219',
        requestedAt: Date.now() - 300000,
        qrInviteCodeUsed: 'INV-OPS-9841'
      }
    ]
  },
  {
    id: 'group-emergency-broadcast',
    name: 'Camp Alpha Emergency Channel',
    description: 'Official announcements only. Broadcast mode active.',
    creator: '@Qaidi156',
    admins: ['@Qaidi156'],
    members: ['@Qaidi156', '@bob_mesh', '@charlie_rescue', '@relay_ridge_04'],
    onlyAdminsCanPost: true,
    avatarColor: 'from-amber-500 to-red-700',
    qrInviteCode: 'INV-CAMP-1092',
    isQrJoinEnabled: false,
    pendingJoinRequests: []
  },
];

export const INITIAL_DTN_PACKETS: DtnPacketSim[] = [
  {
    id: 'pkt-dtn-801',
    source: 'qaidi7711',
    destination: 'group-mesh-ops',
    preview: '⚡ Welcome to Qaidi Share! This chat works 100% offline via Bluetooth Low Energy (BLE) & Wi-Fi Direct hops.',
    createdAt: Date.now() - 360000,
    hopsLeft: 6,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'ROUTING_HOP_ALPHA_1',
    groupId: 'group-mesh-ops'
  },
  {
    id: 'pkt-dtn-802',
    source: 'qaidi3390',
    destination: 'group-mesh-ops',
    preview: '📱 Tip for new users: You do not need any SIM card or cellular internet. Every phone relays packets to the next neighbor.',
    createdAt: Date.now() - 280000,
    hopsLeft: 5,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'ROUTING_HOP_BETA_2',
    groupId: 'group-mesh-ops'
  },
  {
    id: 'pkt-dtn-803',
    source: 'qaidi8821',
    destination: 'group-mesh-ops',
    preview: '☀️ Community update: Native Ad clicks have raised $24.30! We are purchasing a 10W Solar LoRa repeater for rooftop relay.',
    createdAt: Date.now() - 190000,
    hopsLeft: 7,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'SOLAR_LORA_RELAY_3',
    groupId: 'group-mesh-ops'
  },
  {
    id: 'pkt-dtn-804',
    source: 'qaidi156156',
    destination: 'group-mesh-ops',
    preview: 'Tutorial Video Attached: How to wire USB OTG LoRa module (CH340/CP2102) for 15km extreme range.',
    createdAt: Date.now() - 110000,
    hopsLeft: 8,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'CHUNK_VIDEO_SWARM_4',
    groupId: 'group-mesh-ops',
    videoAttachment: {
      videoId: 'vid-solar-lora-demo',
      title: 'DIY USB OTG LoRa Setup & Solar Mount Guide',
      durationSec: 36,
      totalChunks: 14,
      cachedChunks: 14,
      merkleRoot: '7E2C91FA40BC81D5',
      sizeMb: 3.8
    }
  },
  {
    id: 'pkt-dtn-805',
    source: 'qaidi7711',
    destination: 'group-mesh-ops',
    preview: 'Roman Urdu: "Agar shehar mein internet band ho jaye toh ghabrana nahi, Bluetooth on rakhein aur messages bhejien."',
    createdAt: Date.now() - 55000,
    hopsLeft: 4,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'URDU_TRANSLATE_5',
    groupId: 'group-mesh-ops'
  },
  {
    id: 'pkt-dtn-806',
    source: 'qaidi3390',
    destination: 'group-mesh-ops',
    preview: 'Try tapping the PTT Walkie-Talkie tab below to speak live across #lahore-relief voice channel!',
    createdAt: Date.now() - 12000,
    hopsLeft: 3,
    isUrgent: false,
    status: 'DELIVERED',
    relayToken: 'OPUS_VOICE_PTT_6',
    groupId: 'group-mesh-ops'
  }
];

export const INITIAL_REELS: OfflineReelSim[] = [
  {
    id: 'reel-field-medic',
    title: 'Off-Grid Tourniquet & Trauma Stabilization Guide',
    creator: '@dr_sarah_mesh',
    durationSec: 42,
    totalChunks: 16,
    cachedChunks: 16,
    merkleRoot: '9F4B3C2A8E1D7700',
    isVerified: true,
    swarmPeersCount: 4,
    sizeMb: 4.1,
    downloadCount: 19, // One video away from the 20-video download Native Ad trigger!
  },
  {
    id: 'reel-water-filter',
    title: 'Gravity Bio-Sand Filter Assembly from Local Sand/Charcoal',
    creator: '@survival_tech',
    durationSec: 58,
    totalChunks: 24,
    cachedChunks: 19,
    merkleRoot: 'A1B2C3D4E5F67890',
    isVerified: true,
    swarmPeersCount: 3,
    sizeMb: 6.0,
    downloadCount: 14,
  },
  {
    id: 'reel-solar-charge',
    title: 'Improvised 18650 Battery Pack Solar Charging Rig',
    creator: '@Qaidi156',
    durationSec: 35,
    totalChunks: 12,
    cachedChunks: 12,
    merkleRoot: 'C5D6E7F812345678',
    isVerified: true,
    swarmPeersCount: 5,
    sizeMb: 3.0,
    downloadCount: 20,
  },
];

export const INITIAL_COMMUNITY_BROADCASTS: CommunityBroadcastSim[] = [
  {
    id: 'broad-01',
    title: 'Official Mesh Firmware & Frequency Hopping Policy Update',
    author: '@Qaidi156 (Global Super Admin)',
    content: 'All nodes should align to 5GHz DFS Channels (36, 40, 44, 48) for high-speed video swarming to evade 2.4GHz carrier interference.',
    publishedAt: Date.now() - 3600000 * 5,
    isOfficialSigned: true,
    signatureHex: '2f5a89bc3a9e7d8c4125f9b0c48e71a2d6e4f3a1b5c2d9e0f7a8b4c3d2e1f0a9',
  },
  {
    id: 'broad-02',
    title: 'Public Handle Registry Refresh: Verified Mesh Authority',
    author: 'GitHub Raw Index Bot',
    content: 'Master Admin verified as @Qaidi156. Public directory synchronized to raw.githubusercontent.com.',
    publishedAt: Date.now() - 3600000 * 18,
    isOfficialSigned: true,
    signatureHex: 'a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3',
  },
];
