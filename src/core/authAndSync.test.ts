import test from 'node:test';
import assert from 'node:assert/strict';

import {
  generateRandomQaidiHandle,
  generateRandom5DigitSuffix,
  isValidHandle,
  isValidQaidiHandle,
  validatePrefix,
  parseHandleParts,
  checkHandleUniqueness,
  generateHardwareMac,
  registerOrAuthenticateAccount,
  isSuperAdminAuthenticated,
  UserAccountProfile
} from './authAndIdentity.ts';

import {
  determineRoutingPath,
  enqueueOfflineChatPacket,
  syncBufferedPacketsToGitHub,
  confirmPacketDeliveredByRecipient,
  RadioStatus
} from './githubOfflineBridge.ts';

import {
  detectSourcePlatform,
  generateAntiMisinformationBadge,
  processShareIntent
} from './systemShareSheet.ts';

import {
  storeOrReferenceMediaBlob,
  auditStorageMetrics,
  purgeStaleMediaCache,
  THIRTY_DAYS_MS,
  PhysicalBlobRecord
} from './zeroDupStorage.ts';

import { shouldInsertReelAd, isGlobalSuperAdmin } from './adminAndAds.ts';

test('Handle generator creates qaidi[random] format and never yields qaidi1561561', () => {
  for (let i = 0; i < 20; i++) {
    const handle = generateRandomQaidiHandle(['qaidi1001']);
    assert.ok(handle.startsWith('qaidi'));
    assert.notEqual(handle, 'qaidi1561561');
    assert.equal(isValidQaidiHandle(handle), true);
  }
});

test('Super Admin check is strictly locked to qaidi1561561', () => {
  assert.equal(isSuperAdminAuthenticated('qaidi1561561'), true);
  assert.equal(isSuperAdminAuthenticated('@qaidi1561561'), true);
  assert.equal(isSuperAdminAuthenticated('Qaidi1561561'), true);
  assert.equal(isSuperAdminAuthenticated('qaidi156'), false);
  assert.equal(isSuperAdminAuthenticated('qaidi4829'), false);
  assert.equal(isSuperAdminAuthenticated('ql156'), false);
  assert.equal(isSuperAdminAuthenticated('admin'), false);

  assert.equal(isGlobalSuperAdmin('qaidi1561561'), true);
  assert.equal(isGlobalSuperAdmin('@qaidi1561561'), true);
  assert.equal(isGlobalSuperAdmin('qaidi156'), false);
  assert.equal(isGlobalSuperAdmin('ql156'), false);
});

test('Account registration handles collision and requires recovery key when taken', () => {
  const registry: Record<string, UserAccountProfile> = {};
  const mac1 = 'AA:BB:CC:11:22:33';
  const mac2 = '11:22:33:44:55:66';

  // Device 1 registers qaidi4001
  const reg1 = registerOrAuthenticateAccount('qaidi4001', 'pass123', mac1, registry);
  assert.equal(reg1.status, 'SUCCESS');
  if (reg1.status === 'SUCCESS') {
    registry['qaidi4001'] = reg1.profile;
  }

  // Device 2 tries to claim same qaidi4001 without recovery key -> COLLISION
  const reg2 = registerOrAuthenticateAccount('qaidi4001', 'otherpass', mac2, registry);
  assert.equal(reg2.status, 'COLLISION_NEEDS_RECOVERY_KEY');

  // Device 2 provides the correct recovery key -> Account recovered
  const recoveryKey = registry['qaidi4001'].recoveryKeyHex;
  const regRecover = registerOrAuthenticateAccount('qaidi4001', 'newpass', mac2, registry, recoveryKey);
  assert.equal(regRecover.status, 'SUCCESS');
  if (regRecover.status === 'SUCCESS') {
    assert.equal(regRecover.profile.hardwareMac, mac2);
  }
});

test('Routing engine falls back to local Room DB when radios are disabled, and syncs via GitHub when online', () => {
  // Scenario 1: Mesh radios disabled, no internet
  const offlineRadios: RadioStatus = {
    bluetoothEnabled: false,
    locationServicesEnabled: false,
    wifiMeshEnabled: false,
    cellularDataActive: false,
    wifiInternetActive: false
  };
  const path1 = determineRoutingPath(offlineRadios, false);
  assert.equal(path1, 'BUFFER_IN_LOCAL_ROOM_DB');

  // Buffer packet
  const { updatedQueue } = enqueueOfflineChatPacket(
    'pkt-101',
    'qaidi4829',
    'qaidi7711',
    'ENC_PAYLOAD_DATA',
    'IV_HEX_99',
    offlineRadios
  );
  assert.equal(updatedQueue.length, 1);
  assert.equal(updatedQueue[0].status, 'STORED_LOCALLY_ROOM_DB');

  // Internet reconnects -> syncs to GitHub private repository
  const syncResult = syncBufferedPacketsToGitHub(updatedQueue, true);
  assert.equal(syncResult.syncedCount, 1);
  assert.equal(syncResult.syncedQueue[0].status, 'SYNCED_TO_GITHUB_PRIVATE');
  assert.ok(syncResult.syncedQueue[0].githubCommitSha?.startsWith('gh_commit'));

  // Recipient confirms delivery
  const deliveryResult = confirmPacketDeliveredByRecipient(syncResult.syncedQueue, 'pkt-101', 'qaidi7711');
  assert.equal(deliveryResult.isConfirmed, true);
  assert.equal(deliveryResult.updatedQueue[0].status, 'DELIVERED_TO_RECIPIENT');
});

test('System share sheet detects platforms and attaches anti-misinformation watermark', () => {
  const ytIntent = {
    action: 'android.intent.action.SEND' as const,
    mimeType: 'text/plain',
    sharedText: 'Check this out https://youtu.be/protest_first_aid_stream'
  };
  const platform = detectSourcePlatform(ytIntent.sharedText);
  assert.equal(platform, 'YOUTUBE');

  const processed = processShareIntent(ytIntent, 'DOWNLOAD_FILE_AND_LINK');
  assert.equal(processed.detectedPlatform, 'YOUTUBE');
  assert.equal(processed.badge.platform, 'YOUTUBE');
  assert.ok(processed.badge.platformLabel.includes('YouTube'));
  assert.ok(processed.badge.mediaHashHex.length >= 8);
});

test('Zero-duplication storage increments references without duplicating disk usage, and purges stale items', () => {
  let storage: Record<string, PhysicalBlobRecord> = {};
  const seed = 'PROTEST_HYGIENE_VIDEO_MP4';
  const fileSize = 20 * 1024 * 1024; // 20 MB

  // Post 1 in Chat A
  const res1 = storeOrReferenceMediaBlob(storage, seed, 'protest_first_aid.mp4', fileSize, 'H264_VIDEO_OPTIMIZED');
  storage = res1.updatedStorage;
  assert.equal(res1.isNewBlob, true);

  // Post 2 in Group B (same video)
  const res2 = storeOrReferenceMediaBlob(storage, seed, 'shared_again.mp4', fileSize, 'H264_VIDEO_OPTIMIZED');
  storage = res2.updatedStorage;
  assert.equal(res2.isNewBlob, false); // Reused existing blob!

  const metrics = auditStorageMetrics(storage);
  assert.equal(metrics.totalPhysicalBlobs, 1); // Only 1 blob on disk!
  assert.equal(metrics.totalReferences, 2); // 2 chats reference it
  assert.ok(metrics.bytesSavedThroughDeduplication > 0);

  // 30-Day automated cleanup
  const now = Date.now();
  const oldAccessTime = now - (THIRTY_DAYS_MS + 100000);
  storage[res1.contentHash].lastAccessedAt = oldAccessTime;

  const purgeResult = purgeStaleMediaCache(storage, now);
  assert.equal(purgeResult.purgedCount, 1);
  assert.ok(purgeResult.bytesFreed > 0);
  assert.equal(Object.keys(purgeResult.updatedStorage).length, 0);
});

test('Reel ad logic triggers full-screen ad every 30 reels viewed', () => {
  assert.equal(shouldInsertReelAd(0), false);
  assert.equal(shouldInsertReelAd(15), false);
  assert.equal(shouldInsertReelAd(29), false);
  assert.equal(shouldInsertReelAd(30), true);
  assert.equal(shouldInsertReelAd(59), false);
  assert.equal(shouldInsertReelAd(60), true);
});

test('Handle is strictly 10 characters: qaidi + 5 random digits, alphanumeric only', () => {
  // 1. Random handle generation has length 10
  for (let i = 0; i < 25; i++) {
    const handle = generateRandomQaidiHandle();
    assert.equal(handle.length, 10);
    assert.ok(handle.startsWith('qaidi'));
    assert.match(handle, /^qaidi\d{5}$/);
    assert.equal(isValidHandle(handle), true);
  }

  // 2. Custom prefixes (user can change 'qaidi' to any 5 alphanumeric chars)
  assert.equal(validatePrefix('ahmed').isValid, true);
  assert.equal(validatePrefix('usr01').isValid, true);
  assert.equal(validatePrefix('tiger').isValid, true);

  // 3. Reject spaces or special characters or wrong lengths
  assert.equal(validatePrefix('qa di').isValid, false); // Space rejected
  assert.equal(validatePrefix('qa@12').isValid, false); // Special character rejected
  assert.equal(validatePrefix('user').isValid, false); // 4 chars (too short)
  assert.equal(validatePrefix('toolong').isValid, false); // 7 chars (too long)

  // 4. Combined handle with locked 5-digit suffix creates valid 10-char name
  const suffix = generateRandom5DigitSuffix('device_1');
  assert.equal(suffix.length, 5);
  const combined = `ahmed${suffix}`;
  assert.equal(combined.length, 10);
  assert.equal(isValidHandle(combined), true);

  // 5. Parse parts
  const parsed = parseHandleParts('ahmed48921');
  assert.equal(parsed.prefix, 'ahmed');
  assert.equal(parsed.suffix, '48921');
  assert.equal(parsed.isValid, true);

  // 6. Duplicate detection across mesh peers and registry
  const peers = ['qaidi77110', 'tiger48921'];
  const registry = { 'ahmed55021': {} };

  // Collision with active mesh peer
  const conflict1 = checkHandleUniqueness('tiger48921', registry, peers);
  assert.equal(conflict1.isUnique, false);
  assert.equal(conflict1.collisionSource, 'MESH_PEER');

  // Collision with registry
  const conflict2 = checkHandleUniqueness('ahmed55021', registry, peers);
  assert.equal(conflict2.isUnique, false);
  assert.equal(conflict2.collisionSource, 'LOCAL_REGISTRY');

  // Available unique name
  const uniqueRes = checkHandleUniqueness('bravo48921', registry, peers);
  assert.equal(uniqueRes.isUnique, true);
});

