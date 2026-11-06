import test from 'node:test';
import assert from 'node:assert';

// Core proximity calculation logic mirrors MeshNodeMap.tsx
export function calculatePeerProximity(
  userPos: { x: number; y: number },
  peerBase: { x: number; y: number },
  supportedRadios: ('BLE' | 'WIFI_DIRECT' | 'WIFI_AWARE' | 'LORA' | 'ROUTER')[],
  radioStatus: {
    bluetoothEnabled: boolean;
    locationServicesEnabled: boolean;
    wifiMeshEnabled: boolean;
  }
) {
  const dx = peerBase.x - userPos.x;
  const dy = peerBase.y - userPos.y;
  const distanceMeters = Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10);

  const activeTransports: string[] = [];
  if (radioStatus.bluetoothEnabled && supportedRadios.includes('BLE') && distanceMeters <= 32) {
    activeTransports.push('BLE');
  }
  if (radioStatus.wifiMeshEnabled && (supportedRadios.includes('WIFI_DIRECT') || supportedRadios.includes('ROUTER')) && distanceMeters <= 75) {
    activeTransports.push('WIFI');
  }
  if ((radioStatus.wifiMeshEnabled || radioStatus.bluetoothEnabled) && supportedRadios.includes('LORA') && distanceMeters <= 250) {
    activeTransports.push('LORA');
  }

  const isConnected = activeTransports.length > 0;
  const rssiDbm = Math.round(-35 - 28 * Math.log10(distanceMeters));

  return { distanceMeters, isConnected, activeTransports, rssiDbm };
}

test('Mesh Node Map: Distance and RSSI update dynamically as simulated node moves', () => {
  // Center origin (0, 0)
  const peer = { x: 10, y: 0 };
  const resAtOrigin = calculatePeerProximity(
    { x: 0, y: 0 },
    peer,
    ['BLE', 'WIFI_DIRECT'],
    { bluetoothEnabled: true, locationServicesEnabled: true, wifiMeshEnabled: true }
  );
  assert.strictEqual(resAtOrigin.distanceMeters, 10);
  assert.strictEqual(resAtOrigin.isConnected, true);
  assert.ok(resAtOrigin.rssiDbm > -70, 'Near distance gives strong RSSI');

  // Move user node away to (50, 0) -> distance is 40m
  const resMoved = calculatePeerProximity(
    { x: 50, y: 0 },
    peer,
    ['BLE', 'WIFI_DIRECT'],
    { bluetoothEnabled: true, locationServicesEnabled: true, wifiMeshEnabled: true }
  );
  assert.strictEqual(resMoved.distanceMeters, 40);
  // BLE (max 32m) dropped, but Wi-Fi Direct (max 75m) remains active
  assert.deepStrictEqual(resMoved.activeTransports, ['WIFI']);
  assert.strictEqual(resMoved.isConnected, true);
  assert.ok(resMoved.rssiDbm < resAtOrigin.rssiDbm, 'RSSI decreases with distance');

  // Move user node to (150, 0) -> distance is 140m -> beyond Wi-Fi Direct range (75m)
  const resFar = calculatePeerProximity(
    { x: 150, y: 0 },
    peer,
    ['BLE', 'WIFI_DIRECT'],
    { bluetoothEnabled: true, locationServicesEnabled: true, wifiMeshEnabled: true }
  );
  assert.strictEqual(resFar.isConnected, false);
  assert.strictEqual(resFar.activeTransports.length, 0);
});

test('Mesh Node Map: Radio disconnection disables peer links immediately', () => {
  const peer = { x: 15, y: 0 };
  // Peer only has BLE
  const radiosOff = calculatePeerProximity(
    { x: 0, y: 0 },
    peer,
    ['BLE'],
    { bluetoothEnabled: false, locationServicesEnabled: true, wifiMeshEnabled: true }
  );
  assert.strictEqual(radiosOff.isConnected, false);
  assert.deepStrictEqual(radiosOff.activeTransports, []);

  // Peer with LoRa remains connected over long range (120m)
  const loraPeer = { x: 120, y: 0 };
  const loraConnected = calculatePeerProximity(
    { x: 0, y: 0 },
    loraPeer,
    ['LORA'],
    { bluetoothEnabled: true, locationServicesEnabled: true, wifiMeshEnabled: true }
  );
  assert.strictEqual(loraConnected.isConnected, true);
  assert.deepStrictEqual(loraConnected.activeTransports, ['LORA']);
});
