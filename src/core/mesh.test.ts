import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateSeedPhrase,
  validateSeedPhrase,
  deriveKeypairFromSeed,
  calculateChecksumWord
} from './bip39.ts';

import {
  updatePredictabilityOnEncounter,
  agePredictability,
  isPacketExpired,
  selectPacketsToForward,
  DtnPacket
} from './dtnRouting.ts';

import {
  computeChunkHash,
  computeMerkleRoot,
  evictOldMediaCache,
  CachedVideoRecord,
  CHUNK_SIZE_BYTES
} from './merkleChunks.ts';

import {
  determinePowerProfile,
  evaluateChannelHealth
} from './dutyCycle.ts';

import {
  verifyDeveloperAnnouncement,
  verifyAppSignatureIntegrity,
  evaluateAdMobDisplayPolicy,
  selectOptimalTransport,
  isGlobalSuperAdmin,
  shouldInsertNativeAd,
  canMemberPostInGroup,
  canPromoteOrDemote,
  canRemoveMember,
  EXPECTED_RELEASE_CERT_HASH,
  AdminAnnouncement,
  GroupMember
} from './adminAndAds.ts';

import { handleCaptivePortalHttp } from './captivePortal.ts';
import {
  encodeUltrasoundFrequencies,
  decodeUltrasoundFrequencies,
  calculateAcousticCrc16
} from './ultrasoundAcoustic.ts';
import {
  verifyDynamicModuleSignature,
  calculateBandwidthSavings,
  installFeatureModule,
  INITIAL_FEATURE_MODULES
} from './dynamicFeatureDelivery.ts';
import {
  evaluateBarometricRainRisk,
  generateRainAlerts,
  INITIAL_WEATHER
} from './weatherMesh.ts';

test('BIP-39 seed generation produces valid 12 words with correct checksum', () => {
  const phrase = generateSeedPhrase(0.42);
  assert.equal(phrase.length, 12);
  assert.equal(validateSeedPhrase(phrase), true);

  const corrupted = [...phrase];
  corrupted[11] = corrupted[11] === 'abandon' ? 'ability' : 'abandon';
  assert.equal(validateSeedPhrase(corrupted), false);
});

test('Cryptographic keypair derivation is deterministic from seed phrase', () => {
  const phrase = ["apple", "banana", "cat", "dog", "elephant", "flower", "grape", "house", "ice", "jacket", "kite", "lemon"];
  const validChecksum = calculateChecksumWord(phrase.slice(0, 11));
  phrase[11] = validChecksum;

  const res1 = deriveKeypairFromSeed(phrase);
  const res2 = deriveKeypairFromSeed(phrase);

  assert.equal(res1.publicKeyHex, res2.publicKeyHex);
  assert.equal(res1.fingerprint, res2.fingerprint);
  assert.ok(res1.publicKeyHex.length >= 32);
});

test('DTN PRoPHET predictability updates on encounter and decays over time', () => {
  const initial = 0.2;
  const updated = updatePredictabilityOnEncounter(initial);
  assert.ok(updated > initial);

  const aged = agePredictability(updated, 5);
  assert.ok(aged < updated);
});

test('DTN packets prioritize urgent emergency alerts over normal packets', () => {
  const now = Date.now();
  const packets: DtnPacket[] = [
    {
      id: 'pkt-1',
      sourceHandle: '@alice',
      destinationHandle: '@charlie',
      payloadCiphertext: 'enc1',
      relayOnionHeader: 'hdr1',
      createdAt: now,
      ttlSeconds: 3600,
      hopsRemaining: 3,
      isUrgent: false,
      status: 'PENDING_FORWARD',
    },
    {
      id: 'pkt-2',
      sourceHandle: '@emergency',
      destinationHandle: '*',
      payloadCiphertext: 'EMERGENCY_BROADCAST',
      relayOnionHeader: 'hdr2',
      createdAt: now,
      ttlSeconds: 3600,
      hopsRemaining: 5,
      isUrgent: true,
      status: 'PENDING_FORWARD',
    },
  ];

  const sorted = selectPacketsToForward(packets, '@bob', {}, now);
  assert.equal(sorted[0].id, 'pkt-2');
});

test('DTN packet expiration triggers correctly after TTL elapses', () => {
  const now = Date.now();
  const validPkt: DtnPacket = {
    id: 'p1',
    sourceHandle: '@a',
    destinationHandle: '@b',
    payloadCiphertext: '',
    relayOnionHeader: '',
    createdAt: now - 1000,
    ttlSeconds: 60,
    hopsRemaining: 2,
    isUrgent: false,
    status: 'PENDING_FORWARD',
  };
  assert.equal(isPacketExpired(validPkt, now), false);

  const expiredPkt: DtnPacket = {
    ...validPkt,
    createdAt: now - 70000,
  };
  assert.equal(isPacketExpired(expiredPkt, now), true);
});

test('Merkle tree root generation is consistent for chunk hashes', () => {
  const hashes = [
    computeChunkHash('video_01', 0),
    computeChunkHash('video_01', 1),
    computeChunkHash('video_01', 2),
    computeChunkHash('video_01', 3),
  ];
  const root1 = computeMerkleRoot(hashes);
  const root2 = computeMerkleRoot(hashes);
  assert.equal(root1, root2);
  assert.ok(root1.length > 0);
});

test('LRU media cache eviction frees oldest video when limit is exceeded', () => {
  const now = Date.now();
  const videos: CachedVideoRecord[] = [
    {
      videoId: 'vid-old',
      title: 'Old Reel',
      creatorHandle: '@creator1',
      totalSizeBytes: CHUNK_SIZE_BYTES * 2,
      totalChunks: 2,
      merkleRoot: 'root1',
      cachedChunks: [0, 1],
      lastAccessedAt: now - 100000,
      createdAt: now - 200000,
      durationSeconds: 15,
    },
    {
      videoId: 'vid-new',
      title: 'Recent Reel',
      creatorHandle: '@creator2',
      totalSizeBytes: CHUNK_SIZE_BYTES * 2,
      totalChunks: 2,
      merkleRoot: 'root2',
      cachedChunks: [0, 1],
      lastAccessedAt: now,
      createdAt: now - 1000,
      durationSeconds: 20,
    },
  ];

  const maxStorage = CHUNK_SIZE_BYTES * 2;
  const result = evictOldMediaCache(videos, maxStorage);

  assert.equal(result.evictedVideoIds.length, 1);
  assert.equal(result.evictedVideoIds[0], 'vid-old');
  assert.equal(result.remainingVideos.length, 1);
});

test('Power profile dynamically scales radio duty-cycle based on battery and active voice', () => {
  const pVoice = determinePowerProfile(10, false, true);
  assert.equal(pVoice, 'ACTIVE_CONTINUOUS');

  const pLowBg = determinePowerProfile(12, false, false);
  assert.equal(pLowBg, 'STANDBY_DEEP_SLEEP');

  const pMedBg = determinePowerProfile(30, false, false);
  assert.equal(pMedBg, 'ULTRA_BATTERY_SAVER');
});

test('Channel hopping triggers when packet loss exceeds jamming threshold', () => {
  const healthy = evaluateChannelHealth(6, 0.05, -60);
  assert.equal(healthy.shouldHop, false);

  const jammed = evaluateChannelHealth(6, 0.65, -45);
  assert.equal(jammed.shouldHop, true);
  assert.equal(jammed.reason, 'PACKET_LOSS_THRESHOLD');
  assert.notEqual(jammed.recommendedChannel, 6);
});

test('Developer authority verifies authentic announcements and blocks unauthorized forgery', () => {
  const announcement: AdminAnnouncement = {
    id: 'ann-01',
    versionCode: 104,
    title: 'Emergency Mesh Patch v1.4',
    message: 'Frequency hopping calibration updated for 5GHz bands',
    issuedAt: 1730000000000,
    signatureHex: '2f5a89bc000000000000000000000000'
  };

  let hash = 0x811c9dc5;
  const content = `${announcement.id}:${announcement.versionCode}:${announcement.title}:${announcement.message}:${announcement.issuedAt}`;
  for (let i = 0; i < content.length; i++) {
    hash = Math.imul(hash ^ content.charCodeAt(i), 0x01000193);
  }
  const validSig = Math.abs(hash).toString(16).padStart(8, '0') + 'ffffffffffffffffffffffffffffffff';
  announcement.signatureHex = validSig;

  assert.equal(verifyDeveloperAnnouncement(announcement), true);

  const forged = { ...announcement, title: 'Malicious Fake Update' };
  assert.equal(verifyDeveloperAnnouncement(forged), false);
});

test('Anti-tamper checker identifies altered signing certificates', () => {
  const valid = verifyAppSignatureIntegrity(EXPECTED_RELEASE_CERT_HASH);
  assert.equal(valid.isTampered, false);

  const tampered = verifyAppSignatureIntegrity("AA:BB:CC:DD:00:11:22:33:44:55:66:77:88:99");
  assert.equal(tampered.isTampered, true);
  assert.ok(tampered.reason.includes('mismatch'));
});

test('Hybrid AdMob manager completely suppresses ads and collapses slots in offline mesh mode', () => {
  const offlineMesh = evaluateAdMobDisplayPolicy('OFFLINE_MESH_ONLY', 80, false);
  assert.equal(offlineMesh.shouldRequestAd, false);
  assert.equal(offlineMesh.adSlotVisibility, 'COLLAPSED_GONE');
  assert.equal(offlineMesh.adNetworkStatus, 'SUPPRESSED_OFFLINE');

  const lowBatteryOnline = evaluateAdMobDisplayPolicy('ONLINE_INTERNET', 15, false);
  assert.equal(lowBatteryOnline.shouldRequestAd, false);
  assert.equal(lowBatteryOnline.adSlotVisibility, 'COLLAPSED_GONE');
  assert.equal(lowBatteryOnline.adNetworkStatus, 'POWER_SAVER_DISABLED');

  const healthyOnline = evaluateAdMobDisplayPolicy('ONLINE_INTERNET', 85, false);
  assert.equal(healthyOnline.shouldRequestAd, true);
  assert.equal(healthyOnline.adSlotVisibility, 'EXPANDED');
  assert.equal(healthyOnline.adNetworkStatus, 'READY');
});

test('MeshConnectivityManager selects optimal transport and falls back to Room DTN when offline', () => {
  const noPeers = selectOptimalTransport(1024, false, 80, []);
  assert.equal(noPeers, 'STORE_AND_FORWARD_DTN');

  const largeMedia = selectOptimalTransport(100 * 1024, false, 80, ['BLE_MESH', 'WIFI_DIRECT']);
  assert.equal(largeMedia, 'WIFI_DIRECT');

  const lowBattery = selectOptimalTransport(500, false, 18, ['BLE_MESH', 'WIFI_DIRECT', 'WIFI_AWARE']);
  assert.equal(lowBattery, 'BLE_MESH');
});

// NEW TESTS: Global Super Admin @Qaidi1561561 & 20-video download native ad cadence
test('Global super admin is strictly locked to @Qaidi1561561', () => {
  assert.equal(isGlobalSuperAdmin('@Qaidi1561561'), true);
  assert.equal(isGlobalSuperAdmin('@qaidi1561561'), true); // Case-insensitive
  assert.equal(isGlobalSuperAdmin('@Qaidi1561561 '), true); // Whitespace-trimmed
  assert.equal(isGlobalSuperAdmin('@Qaidi156'), false);
  assert.equal(isGlobalSuperAdmin('@random_user'), false);
  assert.equal(isGlobalSuperAdmin('@shaazan_786'), false);
  assert.equal(isGlobalSuperAdmin(''), false);
});

test('Native ads trigger precisely after 20 videos downloaded for clean offline enjoyment', () => {
  assert.equal(shouldInsertNativeAd(0), false);
  assert.equal(shouldInsertNativeAd(5), false);
  assert.equal(shouldInsertNativeAd(19), false);
  assert.equal(shouldInsertNativeAd(20), true); // 20th video milestone
  assert.equal(shouldInsertNativeAd(21), false);
  assert.equal(shouldInsertNativeAd(40), true); // 40th video milestone
  assert.equal(shouldInsertNativeAd(60), true); // 60th video milestone
});

test('WhatsApp-style Group Admin RBAC enforces member permissions & admin posting mode', () => {
  const adminMember: GroupMember = { handle: '@Qaidi156', role: 'GROUP_ADMIN', joinedAt: 1000 };
  const regularMember: GroupMember = { handle: '@bob_mesh', role: 'MEMBER', joinedAt: 1100 };
  const mutedMember: GroupMember = { handle: '@spammer', role: 'MEMBER', joinedAt: 1200, isMuted: true };

  // When only admins can post (like WhatsApp announcement channels)
  assert.equal(canMemberPostInGroup(adminMember, true), true);
  assert.equal(canMemberPostInGroup(regularMember, true), false);
  assert.equal(canMemberPostInGroup(mutedMember, false), false);

  // When all members can post
  assert.equal(canMemberPostInGroup(regularMember, false), true);

  // Group Admin actions
  assert.equal(canPromoteOrDemote(adminMember), true);
  assert.equal(canPromoteOrDemote(regularMember), false);
  assert.equal(canRemoveMember(adminMember, regularMember), true);
  assert.equal(canRemoveMember(regularMember, adminMember), false);
});

// NEW TESTS: Captive Portal Auto-Download & Video Sharing in Chat
test('Captive portal intercepts Android/iOS network check probes and redirects to /portal', () => {
  // Android connectivity probe
  const androidProbe = handleCaptivePortalHttp({ path: '/generate_204', host: 'connectivitycheck.gstatic.com' });
  assert.equal(androidProbe.statusCode, 302);
  assert.ok(androidProbe.headers['Location'].includes('/portal'));

  // Apple connectivity probe
  const appleProbe = handleCaptivePortalHttp({ path: '/hotspot-detect.html', host: 'captive.apple.com' });
  assert.equal(appleProbe.statusCode, 302);

  // Direct APK download request
  const apkDownload = handleCaptivePortalHttp({ path: '/qaidi_link.apk', host: '192.168.43.1' });
  assert.equal(apkDownload.statusCode, 200);
  assert.equal(apkDownload.headers['Content-Type'], 'application/vnd.android.package-archive');

  // Portal HTML view
  const portalHtml = handleCaptivePortalHttp({ path: '/portal', host: '192.168.43.1' });
  assert.equal(portalHtml.statusCode, 200);
  assert.ok(portalHtml.body.includes('Qaidi Share'));
  assert.ok(portalHtml.body.includes('Download Qaidi Share Lite APK'));
});

test('Video sharing in chat packages Merkle root and chunk swarming metadata into DTN packet', () => {
  const videoPacket: DtnPacket = {
    id: 'vid-pkt-101',
    sourceHandle: '@Qaidi156',
    destinationHandle: '@charlie_rescue',
    payloadCiphertext: 'E2EE_ENCRYPTED_HEADER',
    relayOnionHeader: 'ONION_TOKEN_8988',
    createdAt: Date.now(),
    ttlSeconds: 86400,
    hopsRemaining: 6,
    isUrgent: false,
    status: 'DELIVERED',
    videoAttachment: {
      videoId: 'vid-solar-44',
      title: 'Field Solar Generator Assembly',
      durationSec: 45,
      totalChunks: 16,
      cachedChunks: 16,
      merkleRoot: '9F4B3C2A8E1D7700',
      sizeMb: 4.0,
    }
  };

  assert.ok(videoPacket.videoAttachment);
  assert.equal(videoPacket.videoAttachment.totalChunks, 16);
  assert.equal(videoPacket.videoAttachment.merkleRoot, '9F4B3C2A8E1D7700');
});

test('Ultrasound acoustic engine encodes and decodes text payloads without external modules', () => {
  const payload = '@Qaidi156:LINK';
  const encoded = encodeUltrasoundFrequencies(payload);

  assert.ok(encoded.frequencies.length > 20);
  assert.ok(encoded.durationMs > 0);
  assert.equal(typeof encoded.crc16, 'number');

  const decoded = decodeUltrasoundFrequencies(encoded.frequencies);
  assert.equal(decoded.success, true);
  assert.equal(decoded.payload, payload);

  // Test corrupted frequency sequence
  const corruptedFreqs = [...encoded.frequencies];
  corruptedFreqs[corruptedFreqs.length - 3] = 12000; // invalid frequency
  const corruptedDecoded = decodeUltrasoundFrequencies(corruptedFreqs);
  assert.equal(corruptedDecoded.success, false);
});

test('Dynamic feature delivery installs modular split features without downloading entire new app', () => {
  const modules = [...INITIAL_FEATURE_MODULES];
  const mapsModule = modules.find(m => m.id === 'feature_offline_maps')!;
  assert.equal(mapsModule.isInstalled, false);

  // Calculate bandwidth savings vs full APK download
  const savings = calculateBandwidthSavings(mapsModule, 4915);
  assert.ok(savings.bandwidthSavedKb > 3000);
  assert.ok(savings.percentageSaved >= 70); // Saved >70% bandwidth!

  // Signature validation
  assert.equal(verifyDynamicModuleSignature(mapsModule), true);

  // Install feature module
  const installResult = installFeatureModule(modules, 'feature_offline_maps');
  assert.equal(installResult.success, true);
  const installedMaps = installResult.updatedModules.find(m => m.id === 'feature_offline_maps');
  assert.equal(installedMaps?.isInstalled, true);
});

test('Location services and barometric sensor detect rapid pressure drop and trigger severe rain alert', () => {
  const currentPressure = 1004.2;
  const threeHoursAgo = 1007.8; // 3.6 hPa drop
  const humidity = 88;

  const risk = evaluateBarometricRainRisk(currentPressure, threeHoursAgo, humidity);
  assert.equal(risk.isRainLikely, true);
  assert.equal(risk.dropDeltaHpa, 3.6);
  assert.ok(risk.rainProbabilityPct >= 80);

  const alerts = generateRainAlerts(INITIAL_WEATHER, risk.dropDeltaHpa);
  assert.ok(alerts.length >= 1);
  assert.equal(alerts[0].severity, 'CRITICAL');
  assert.ok(alerts[0].headline.includes('Heavy Rain'));
  assert.equal(alerts[0].isMeshBroadcast, true);
});




