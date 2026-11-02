import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isGlobalSuperAdmin,
  canPromoteToSuperAdmin,
  filterContentUnderIslamicLaw,
  ISLAMIC_LAW_BLOCK_MESSAGE,
  shouldInsertReelAd
} from './adminAndAds.ts';
import {
  getDefaultLanguageForLocation,
  translateMessageOffline,
  SUPPORTED_TRANSLATION_LANGUAGES
} from './autoTranslate.ts';
import {
  isSuperAdminAuthenticated,
  getEffectivePeerDisplayName,
  PrivateNicknameMap
} from './authAndIdentity.ts';

test('Super Admin is strictly locked to qaidi1561561 and rejects all others', () => {
  assert.equal(isGlobalSuperAdmin('qaidi1561561'), true);
  assert.equal(isGlobalSuperAdmin('@qaidi1561561'), true);
  assert.equal(isGlobalSuperAdmin('Qaidi1561561'), true);
  assert.equal(isSuperAdminAuthenticated('qaidi1561561'), true);
  
  // Previous handle must now be rejected
  assert.equal(isGlobalSuperAdmin('qaidi156'), false);
  assert.equal(isGlobalSuperAdmin('ql156'), false);
  assert.equal(isGlobalSuperAdmin('admin'), false);
  assert.equal(isGlobalSuperAdmin('qaidi9999'), false);
});

test('Only qaidi1561561 can promote others to Admin or Super Admin', () => {
  assert.equal(canPromoteToSuperAdmin('qaidi1561561'), true);
  assert.equal(canPromoteToSuperAdmin('@qaidi1561561'), true);
  assert.equal(canPromoteToSuperAdmin('qaidi156'), false);
  assert.equal(canPromoteToSuperAdmin('qaidi4001'), false);
  assert.equal(canPromoteToSuperAdmin('regular_user'), false);
});

test('Islamic Law Moderation Filter blocks porn and prohibited content with mandatory notice', () => {
  // Prohibited words
  const checkPorn = filterContentUnderIslamicLaw('Check this porn video link');
  assert.equal(checkPorn.allowed, false);
  assert.equal(checkPorn.blockedWord, 'porn');
  
  const checkXxx = filterContentUnderIslamicLaw('Visit xxx website now');
  assert.equal(checkXxx.allowed, false);

  const checkGambling = filterContentUnderIslamicLaw('Win big at online casino gambling');
  assert.equal(checkGambling.allowed, false);

  // Clean communication
  const checkClean = filterContentUnderIslamicLaw('As-salamu alaykum brothers, gathering at Sector F-7');
  assert.equal(checkClean.allowed, true);
  assert.equal(checkClean.blockedWord, undefined);

  // Mandatory response copy
  assert.equal(
    ISLAMIC_LAW_BLOCK_MESSAGE,
    'Blocked by Islamic Law: Prohibited content automatically removed and disavowed.'
  );
});

test('Location-based auto-translate detects appropriate regional languages', () => {
  assert.equal(getDefaultLanguageForLocation('Pakistan').code, 'ur');
  assert.equal(getDefaultLanguageForLocation('Lahore, PK').code, 'ur');
  assert.equal(getDefaultLanguageForLocation('India').code, 'hi');
  assert.equal(getDefaultLanguageForLocation('New Delhi, IN').code, 'hi');
  assert.equal(getDefaultLanguageForLocation('Saudi Arabia').code, 'ar');
  assert.equal(getDefaultLanguageForLocation('Bangladesh').code, 'bn');
  assert.equal(getDefaultLanguageForLocation('USA').code, 'en');

  // Offline dictionary translation
  const result = translateMessageOffline('hello water help', 'ur');
  assert.ok(result.translatedText.length > 0);
  assert.ok(result.translatedText.includes('سلام') || result.translatedText.includes('پانی'));

  // Supported language metadata
  assert.ok(SUPPORTED_TRANSLATION_LANGUAGES.some(l => l.code === 'ur' && l.nativeName === 'اردو'));
});

test('Private nicknames are applied locally without leaking to peer metadata', () => {
  const localNicknames: PrivateNicknameMap = {
    'qaidi8821': 'Uncle Tariq (Safe Haven)'
  };

  const displayName = getEffectivePeerDisplayName(
    'qaidi8821',
    'qaidi8821',
    localNicknames
  );
  assert.equal(displayName, 'Uncle Tariq (Safe Haven) (Local Nickname)');

  // Peer without nickname falls back to public handle
  const fallbackName = getEffectivePeerDisplayName(
    'qaidi3314',
    'qaidi3314',
    localNicknames
  );
  assert.equal(fallbackName, 'qaidi3314');
});

import {
  createGlobalEmergencyBroadcast,
  dispatchGlobalEmergencyBroadcast
} from './radioPacketTransmission.ts';

test('TikTok/Reels ad logic injects ad precisely every 30 reels viewed', () => {
  assert.equal(shouldInsertReelAd(0), false);
  assert.equal(shouldInsertReelAd(15), false);
  assert.equal(shouldInsertReelAd(29), false);
  assert.equal(shouldInsertReelAd(30), true);
  assert.equal(shouldInsertReelAd(31), false);
  assert.equal(shouldInsertReelAd(60), true);
  assert.equal(shouldInsertReelAd(90), true);
});

test('Global Emergency Broadcast creates critical-high priority packet and reaches active mesh nodes', () => {
  const broadcast = createGlobalEmergencyBroadcast('qaidi4829', 'EMERGENCY: Immediate assembly at Sector F-7', 'PROTEST_CORDON');
  assert.ok(broadcast.broadcastId.startsWith('EMG-'));
  assert.equal(broadcast.priority, 'CRITICAL_HIGH');
  assert.equal(broadcast.emergencyType, 'PROTEST_CORDON');
  assert.equal(broadcast.senderHandle, 'qaidi4829');
  assert.ok(broadcast.rfTransports.includes('LORA_433'));
  assert.ok(broadcast.rfTransports.includes('WIFI_DIRECT'));

  const activeNodes = ['qaidi7711', 'qaidi3390', 'qaidi8821'];
  const result = dispatchGlobalEmergencyBroadcast(broadcast, activeNodes);
  assert.equal(result.success, true);
  assert.ok(result.nodesPingedCount >= activeNodes.length);
  assert.ok(result.broadcast.nodesAcknowledged.includes('qaidi7711'));
  assert.ok(result.logSummary.includes('[GLOBAL EMERGENCY BROADCAST]'));
});
