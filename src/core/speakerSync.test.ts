import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSpeakerHostSession,
  calculateClockSyncDrift,
  joinSpeakerSession,
  INITIAL_SYNC_SESSION
} from './speakerSync.ts';

test('createSpeakerHostSession creates a host broadcast session with correct parameters', () => {
  const session = createSpeakerHostSession('qaidi156156', 'LIVE_MIC');
  assert.ok(session.sessionId.startsWith('SYNC-'));
  assert.equal(session.hostHandle, 'qaidi156156');
  assert.equal(session.isPlaying, true);
  assert.equal(session.sourceType, 'LIVE_MIC');
  assert.equal(session.connectedNodes.length, 1);
  assert.equal(session.connectedNodes[0].handle, 'qaidi156156');
  assert.equal(session.connectedNodes[0].isHost, true);
  assert.equal(session.connectedNodes[0].driftMs, 0.0);
});

test('calculateClockSyncDrift outputs tight sub-10ms drift values for audio alignment', () => {
  const drift1 = calculateClockSyncDrift(1700000050, 1700000000);
  assert.ok(drift1 >= -5.0 && drift1 <= 5.0, `Drift ${drift1} should be within ±5ms`);

  const drift2 = calculateClockSyncDrift(1700000012, 1700000000);
  assert.ok(drift2 >= -5.0 && drift2 <= 5.0, `Drift ${drift2} should be within ±5ms`);
});

test('joinSpeakerSession adds a listener node without duplicate entries', () => {
  const baseSession = { ...INITIAL_SYNC_SESSION };
  const initialCount = baseSession.connectedNodes.length;

  const updatedSession = joinSpeakerSession(baseSession, 'qaidi9988');
  assert.equal(updatedSession.connectedNodes.length, initialCount + 1);
  const addedNode = updatedSession.connectedNodes.find(n => n.handle === 'qaidi9988');
  assert.ok(addedNode);
  assert.equal(addedNode.isHost, false);
  assert.ok(addedNode.driftMs >= -3.0 && addedNode.driftMs <= 3.0);

  // Joining again with same handle does not duplicate
  const duplicateJoin = joinSpeakerSession(updatedSession, 'qaidi9988');
  assert.equal(duplicateJoin.connectedNodes.length, initialCount + 1);
});

test('createSpeakerHostSession handles SLOGAN_CHANT with looping enabled', () => {
  const session = createSpeakerHostSession('qaidi156156', 'SLOGAN_CHANT');
  assert.equal(session.sourceType, 'SLOGAN_CHANT');
  assert.equal(session.isLooped, true);
  assert.ok(session.sourceTitle.includes('Azadi'));
  assert.equal(session.activeSloganId, 'slogan-azadi-inqilab');
});

test('createSpeakerHostSession handles PUBLIC_SPEECH and STORAGE_FILE', () => {
  const speechSession = createSpeakerHostSession('qaidi156156', 'PUBLIC_SPEECH');
  assert.equal(speechSession.sourceType, 'PUBLIC_SPEECH');
  assert.ok(speechSession.sourceTitle.includes('Assembly Keynote'));

  const storageSession = createSpeakerHostSession('qaidi156156', 'STORAGE_FILE', undefined, {
    fileName: 'rally_march_2026.mp3',
    fileSizeBytes: 4500000,
    mimeType: 'audio/mpeg',
    durationSec: 215,
    isCustomUploaded: true
  });
  assert.equal(storageSession.sourceType, 'STORAGE_FILE');
  assert.ok(storageSession.sourceTitle.includes('rally_march_2026.mp3'));
  assert.equal(storageSession.storageFileMeta?.fileName, 'rally_march_2026.mp3');
  assert.equal(storageSession.totalDurationSec, 215);
});
