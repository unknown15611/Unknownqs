/**
 * Ultrasound Near-Field Acoustic Communication Engine
 * Uses ordinary smartphone speaker & microphone (18.2 kHz - 20.2 kHz near-ultrasound)
 * Zero external modules or hardware needed - purely software-driven FSK acoustic modulation.
 * Works even when RF (Wi-Fi/Bluetooth) is jammed or disabled!
 */

export const ULTRASOUND_FREQUENCIES = {
  PREAMBLE: 18200,   // Hz: Start of transmission chirp
  BIT_0: 18800,      // Hz: Binary 0
  BIT_1: 19600,      // Hz: Binary 1
  POSTAMBLE: 20200,  // Hz: End of transmission
  FRAME_DURATION_MS: 40, // 40ms per symbol
};

/**
 * Standard CRC-16-CCITT for packet integrity
 */
export function calculateAcousticCrc16(data: string): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

/**
 * Converts a text payload (e.g. handle, contact token, or emergency ping)
 * into a sequence of ultrasonic audio tone frequencies.
 */
export function encodeUltrasoundFrequencies(payload: string): {
  frequencies: number[];
  symbols: string[];
  durationMs: number;
  crc16: number;
} {
  const crc = calculateAcousticCrc16(payload);
  const fullPayload = `${payload}#${crc.toString(16).padStart(4, '0')}`;
  
  const frequencies: number[] = [ULTRASOUND_FREQUENCIES.PREAMBLE];
  const symbols: string[] = ['PREAMBLE'];

  for (let i = 0; i < fullPayload.length; i++) {
    const charCode = fullPayload.charCodeAt(i);
    // 8 bits MSB first
    for (let bit = 7; bit >= 0; bit--) {
      const isOne = (charCode & (1 << bit)) !== 0;
      frequencies.push(isOne ? ULTRASOUND_FREQUENCIES.BIT_1 : ULTRASOUND_FREQUENCIES.BIT_0);
      symbols.push(isOne ? '1' : '0');
    }
  }

  frequencies.push(ULTRASOUND_FREQUENCIES.POSTAMBLE);
  symbols.push('POSTAMBLE');

  return {
    frequencies,
    symbols,
    durationMs: frequencies.length * ULTRASOUND_FREQUENCIES.FRAME_DURATION_MS,
    crc16: crc,
  };
}

/**
 * Decodes a sequence of received ultrasonic frequencies back into text.
 */
export function decodeUltrasoundFrequencies(frequencies: number[]): {
  success: boolean;
  payload: string;
  error?: string;
} {
  if (frequencies.length < 10) {
    return { success: false, payload: '', error: 'Packet too short' };
  }

  // Filter for bit frequencies
  const bits: number[] = [];
  let foundPreamble = false;

  for (const freq of frequencies) {
    if (Math.abs(freq - ULTRASOUND_FREQUENCIES.PREAMBLE) < 250) {
      foundPreamble = true;
      continue;
    }
    if (!foundPreamble) continue;

    if (Math.abs(freq - ULTRASOUND_FREQUENCIES.POSTAMBLE) < 250) {
      break;
    }

    if (Math.abs(freq - ULTRASOUND_FREQUENCIES.BIT_1) < 250) {
      bits.push(1);
    } else if (Math.abs(freq - ULTRASOUND_FREQUENCIES.BIT_0) < 250) {
      bits.push(0);
    }
  }

  if (bits.length % 8 !== 0 || bits.length === 0) {
    return { success: false, payload: '', error: 'Invalid bitstream alignment' };
  }

  let decodedText = '';
  for (let i = 0; i < bits.length; i += 8) {
    let charCode = 0;
    for (let b = 0; b < 8; b++) {
      charCode = (charCode << 1) | bits[i + b];
    }
    decodedText += String.fromCharCode(charCode);
  }

  const parts = decodedText.split('#');
  if (parts.length < 2) {
    return { success: false, payload: '', error: 'Missing CRC separator' };
  }

  const rawData = parts.slice(0, -1).join('#');
  const receivedCrcHex = parts[parts.length - 1];
  const calculatedCrc = calculateAcousticCrc16(rawData);

  if (calculatedCrc.toString(16).padStart(4, '0') !== receivedCrcHex) {
    return { success: false, payload: '', error: 'CRC checksum mismatch' };
  }

  return { success: true, payload: rawData };
}
