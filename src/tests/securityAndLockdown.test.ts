import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rssiToSignalPercentage,
  getSignalQuality,
  shouldEnforceLockdownForCity,
  getUrduLockdownWarning
} from '../core/securityAndLockdown';

test('rssiToSignalPercentage maps dBm accurately between 0% and 100%', () => {
  assert.equal(rssiToSignalPercentage(-50), 100);
  assert.equal(rssiToSignalPercentage(-40), 100);
  assert.equal(rssiToSignalPercentage(-120), 0);
  assert.equal(rssiToSignalPercentage(-130), 0);
  assert.equal(rssiToSignalPercentage(-85), 50);
});

test('getSignalQuality provides correct quality tier and labels', () => {
  assert.equal(getSignalQuality(85).label, 'Excellent');
  assert.equal(getSignalQuality(60).label, 'Good');
  assert.equal(getSignalQuality(40).label, 'Fair');
  assert.equal(getSignalQuality(15).label, 'Weak');
});

test('shouldEnforceLockdownForCity targets specific cities and ALL correctly', () => {
  assert.equal(shouldEnforceLockdownForCity('Talagang', 'Talagang'), true);
  assert.equal(shouldEnforceLockdownForCity('talagang', 'TALAGANG'), true);
  assert.equal(shouldEnforceLockdownForCity('Lahore', 'Talagang'), false);
  assert.equal(shouldEnforceLockdownForCity('Lahore', 'ALL'), true);
  assert.equal(shouldEnforceLockdownForCity('Islamabad', 'all'), true);
});

test('getUrduLockdownWarning formats Roman Urdu alert with targeted city and PIN instructions', () => {
  const warning = getUrduLockdownWarning('Talagang');
  assert.ok(warning.includes('Talagang'));
  assert.ok(warning.includes('Notepad Disguise'));
  assert.ok(warning.includes('PIN'));
});
