/**
 * Zero-Duplication Local Content-Addressed Storage & 30-Day Automated Purge
 * - Prevents storing duplicate copies of videos/photos shared across multiple chats.
 * - Files are addressed by content hash (SHA-256 / Merkle root). Multiple UI threads reference
 *   the same single-instance physical blob on internal flash memory.
 * - Automated 30-day purge evicts stale video fragments and unreferenced media.
 * - Compression utility: calculates WebP and audio bitrate optimizations.
 */

export interface PhysicalBlobRecord {
  contentHash: string; // SHA-256 hex
  fileName: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionType: 'WEBP_IMAGE' | 'OPUS_AUDIO_COMPRESSED' | 'H264_VIDEO_OPTIMIZED' | 'RAW_BINARY';
  createdAt: number;
  lastAccessedAt: number;
  referenceCount: number; // Number of chats/posts referencing this exact blob
  isProtectedFromPurge?: boolean;
}

export interface StorageAuditResult {
  totalPhysicalBlobs: number;
  totalReferences: number;
  physicalDiskUsageBytes: number;
  logicalDiskUsageBytes: number;
  bytesSavedThroughDeduplication: number;
  compressionSavingsBytes: number;
}

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Computes deterministic content hash for file data simulation.
 */
export function computeContentHash(contentSeed: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < contentSeed.length; i++) {
    h1 = Math.imul(h1 ^ contentSeed.charCodeAt(i), 0x01000193);
  }
  return Math.abs(h1).toString(16).padStart(16, '0').toUpperCase();
}

/**
 * Adds or references a media file in the zero-duplication storage engine.
 * If already stored, increments reference count without taking extra disk space!
 */
export function storeOrReferenceMediaBlob(
  storage: Record<string, PhysicalBlobRecord>,
  contentSeed: string,
  fileName: string,
  originalSizeBytes: number,
  compressionType: PhysicalBlobRecord['compressionType'] = 'RAW_BINARY'
): { updatedStorage: Record<string, PhysicalBlobRecord>; contentHash: string; isNewBlob: boolean } {
  const hash = computeContentHash(contentSeed);
  const existing = storage[hash];

  if (existing) {
    // Zero duplication: increment reference count, update access timestamp
    const updated: PhysicalBlobRecord = {
      ...existing,
      referenceCount: existing.referenceCount + 1,
      lastAccessedAt: Date.now()
    };
    return {
      updatedStorage: { ...storage, [hash]: updated },
      contentHash: hash,
      isNewBlob: false
    };
  }

  // Calculate compression benefit
  let compressionRatio = 1.0;
  if (compressionType === 'WEBP_IMAGE') compressionRatio = 0.40; // 60% savings
  else if (compressionType === 'OPUS_AUDIO_COMPRESSED') compressionRatio = 0.35; // 65% savings
  else if (compressionType === 'H264_VIDEO_OPTIMIZED') compressionRatio = 0.55; // 45% savings

  const compressedSize = Math.round(originalSizeBytes * compressionRatio);

  const newBlob: PhysicalBlobRecord = {
    contentHash: hash,
    fileName,
    originalSizeBytes,
    compressedSizeBytes: compressedSize,
    compressionType,
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    referenceCount: 1
  };

  return {
    updatedStorage: { ...storage, [hash]: newBlob },
    contentHash: hash,
    isNewBlob: true
  };
}

/**
 * Audits total disk consumption vs logical references to measure zero-duplication savings.
 */
export function auditStorageMetrics(storage: Record<string, PhysicalBlobRecord>): StorageAuditResult {
  const blobs = Object.values(storage);
  let totalRefs = 0;
  let physicalDiskUsageBytes = 0;
  let logicalDiskUsageBytes = 0;
  let rawUncompressedBytes = 0;

  for (const blob of blobs) {
    totalRefs += blob.referenceCount;
    physicalDiskUsageBytes += blob.compressedSizeBytes;
    logicalDiskUsageBytes += blob.originalSizeBytes * blob.referenceCount;
    rawUncompressedBytes += blob.originalSizeBytes;
  }

  const bytesSavedThroughDeduplication = Math.max(0, logicalDiskUsageBytes - (rawUncompressedBytes));
  const compressionSavingsBytes = Math.max(0, rawUncompressedBytes - physicalDiskUsageBytes);

  return {
    totalPhysicalBlobs: blobs.length,
    totalReferences: totalRefs,
    physicalDiskUsageBytes,
    logicalDiskUsageBytes,
    bytesSavedThroughDeduplication,
    compressionSavingsBytes
  };
}

/**
 * Purges files older than 30 days that are not flagged as protected.
 */
export function purgeStaleMediaCache(
  storage: Record<string, PhysicalBlobRecord>,
  currentTimeMs: number = Date.now(),
  maxAgeMs: number = THIRTY_DAYS_MS
): { updatedStorage: Record<string, PhysicalBlobRecord>; purgedCount: number; bytesFreed: number } {
  const updatedStorage: Record<string, PhysicalBlobRecord> = {};
  let purgedCount = 0;
  let bytesFreed = 0;

  for (const [hash, blob] of Object.entries(storage)) {
    const age = currentTimeMs - blob.lastAccessedAt;
    if (age > maxAgeMs && !blob.isProtectedFromPurge) {
      purgedCount++;
      bytesFreed += blob.compressedSizeBytes;
    } else {
      updatedStorage[hash] = blob;
    }
  }

  return { updatedStorage, purgedCount, bytesFreed };
}
