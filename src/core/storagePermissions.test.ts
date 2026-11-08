import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStoragePermissionState,
  isStoragePermissionGranted,
  updateStoragePermissionState,
  resetStoragePermissionState,
  ANDROID_STORAGE_PERMISSIONS
} from './storagePermissions.ts';

test('Android storage permission defaults to NOT_REQUESTED with expected Android 13/14 permissions list', () => {
  resetStoragePermissionState();
  const state = getStoragePermissionState();
  assert.equal(state.state, 'NOT_REQUESTED');
  assert.equal(state.attemptsCount, 0);
  assert.equal(isStoragePermissionGranted(), false);
  assert.ok(ANDROID_STORAGE_PERMISSIONS.includes('android.permission.READ_MEDIA_IMAGES'));
  assert.ok(ANDROID_STORAGE_PERMISSIONS.includes('android.permission.READ_MEDIA_VIDEO'));
  assert.ok(ANDROID_STORAGE_PERMISSIONS.includes('android.permission.READ_MEDIA_AUDIO'));
  assert.ok(ANDROID_STORAGE_PERMISSIONS.includes('android.permission.READ_EXTERNAL_STORAGE'));
});

test('Granting permission with ALLOW or ALLOW_ONCE sets state to GRANTED', () => {
  resetStoragePermissionState();
  
  const granted = updateStoragePermissionState('ALLOW');
  assert.equal(granted.state, 'GRANTED');
  assert.equal(granted.attemptsCount, 1);
  assert.ok(granted.grantedAt && granted.grantedAt > 0);
  assert.equal(isStoragePermissionGranted(), true);

  resetStoragePermissionState();
  const grantedOnce = updateStoragePermissionState('ALLOW_ONCE');
  assert.equal(grantedOnce.state, 'GRANTED');
  assert.equal(isStoragePermissionGranted(), true);
});

test('Denying permission records denial, and repeated denials or DENY_PERMANENT transition to PERMANENTLY_DENIED', () => {
  resetStoragePermissionState();

  const denied1 = updateStoragePermissionState('DENY');
  assert.equal(denied1.state, 'DENIED');
  assert.equal(denied1.attemptsCount, 1);
  assert.equal(isStoragePermissionGranted(), false);

  const denied2 = updateStoragePermissionState('DENY');
  assert.equal(denied2.state, 'DENIED');
  assert.equal(denied2.attemptsCount, 2);

  const denied3 = updateStoragePermissionState('DENY');
  assert.equal(denied3.state, 'PERMANENTLY_DENIED');
  assert.equal(denied3.attemptsCount, 3);
  assert.equal(isStoragePermissionGranted(), false);

  resetStoragePermissionState();
  const directPermanent = updateStoragePermissionState('DENY_PERMANENT');
  assert.equal(directPermanent.state, 'PERMANENTLY_DENIED');
});
