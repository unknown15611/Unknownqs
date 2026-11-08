import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePeerTelemetry,
  autoBlockPeer,
  isPeerQuarantined,
  unblockPeer,
  shouldDropPacketFromPeer,
  simulateMaliciousIntrusion,
  getQuarantinedPeers
} from './meshIntrusionBlocker.ts';
import {
  CITY_CAMOUFLAGE_PRESETS,
  searchCityCamouflage,
  activateCityCamouflage,
  deactivateCityCamouflage,
  getCityCamouflageState
} from './cityCamouflage.ts';

test('Mesh Intrusion Detector automatically identifies RF Jamming flooding packets', () => {
  const normalCheck = evaluatePeerTelemetry('qaidi4410', { packetRatePerSec: 8 });
  assert.equal(normalCheck.shouldBlock, false);

  const jammingCheck = evaluatePeerTelemetry('jammer_cell', { packetRatePerSec: 64 });
  assert.equal(jammingCheck.shouldBlock, true);
  assert.equal(jammingCheck.threat, 'JAMMING');
  assert.ok(jammingCheck.evidence?.includes('64 packets/sec'));
});

test('Mesh Intrusion Detector identifies Route Blocking and Blackhole attacks', () => {
  const normalRoute = evaluatePeerTelemetry('qaidi9911', { relayDropRatePct: 10 });
  assert.equal(normalRoute.shouldBlock, false);

  const blackholeCheck = evaluatePeerTelemetry('blackhole_relay', { relayDropRatePct: 88 });
  assert.equal(blackholeCheck.shouldBlock, true);
  assert.equal(blackholeCheck.threat, 'BLOCKING');
  assert.ok(blackholeCheck.evidence?.includes('88%'));
});

test('Mesh Intrusion Detector identifies Virus & Trojan dropper signatures and auto-blocks', () => {
  const virusCheck = evaluatePeerTelemetry('malware_peer', {
    payloadSnippet: 'START_APK_HEADER_TROJAN_DROPPER_INJECT'
  });
  assert.equal(virusCheck.shouldBlock, true);
  assert.equal(virusCheck.threat, 'VIRUS');

  // Auto block execution
  const { quarantined, event } = autoBlockPeer('malware_peer', 'VIRUS', virusCheck.evidence || '');
  assert.equal(quarantined.handle, 'malware_peer');
  assert.equal(quarantined.reason, 'VIRUS');
  assert.equal(quarantined.autoBlockedByShield, true);
  assert.equal(isPeerQuarantined('malware_peer'), true);
  assert.equal(event.autoBlocked, true);

  // Packets from quarantined peer must be dropped
  assert.equal(shouldDropPacketFromPeer('malware_peer'), true);

  // Manual unblock
  unblockPeer('malware_peer');
  assert.equal(isPeerQuarantined('malware_peer'), false);
});

test('Simulating Jamming or Blackhole attacks creates auto-blocked quarantined nodes', () => {
  const sim = simulateMaliciousIntrusion('JAMMING', 'test_rf_jammer_55');
  assert.equal(sim.quarantined.handle, 'test_rf_jammer_55');
  assert.equal(sim.quarantined.reason, 'JAMMING');
  assert.equal(isPeerQuarantined('test_rf_jammer_55'), true);

  const list = getQuarantinedPeers();
  assert.ok(list.some(p => p.handle === 'test_rf_jammer_55'));
  unblockPeer('test_rf_jammer_55');
});

test('City Camouflage Search option supports "cemuflage", city names and stealth keywords', () => {
  // Test user query "cemuflage" (common user spelling)
  const camoHits = searchCityCamouflage('cemuflage');
  assert.ok(camoHits.length >= 5);

  // Search by city name: Lahore
  const lahoreHits = searchCityCamouflage('lahore');
  assert.ok(lahoreHits.some(p => p.city === 'Lahore'));

  // Search by Karachi
  const karachiHits = searchCityCamouflage('karachi');
  assert.ok(karachiHits.some(p => p.city === 'Karachi'));

  // Search by Islamabad
  const isbHits = searchCityCamouflage('islamabad');
  assert.ok(isbHits.some(p => p.city === 'Islamabad'));
});

test('Activating City Camouflage changes RF identity and UI stealth skin', () => {
  const activated = activateCityCamouflage('lahore-mall-road');
  assert.equal(activated.isActive, true);
  assert.equal(activated.currentPresetId, 'lahore-mall-road');
  assert.equal(activated.rfStealthName, 'Xiaomi Smart Band 8 (HR-62)');
  assert.equal(activated.uiDisguiseMode, 'CALCULATOR');

  const state = getCityCamouflageState();
  assert.equal(state.isActive, true);

  const deactivated = deactivateCityCamouflage();
  assert.equal(deactivated.isActive, false);
});
