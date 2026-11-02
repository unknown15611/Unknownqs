/**
 * Offline Video Feed & Torrent-style Chunking Cache Engine
 * Manages 256KB chunking, Merkle verification, and LRU/FIFO cache eviction policies.
 */

export const CHUNK_SIZE_BYTES = 256 * 1024; // 256 KB standard chunk

export interface VideoChunk {
  videoId: string;
  chunkIndex: number;
  totalChunks: number;
  dataHash: string; // SHA-256 slice
  sizeBytes: number;
  downloadedFromPeer?: string;
  downloadedAt: number;
}

export interface CachedVideoRecord {
  videoId: string;
  title: string;
  creatorHandle: string;
  totalSizeBytes: number;
  totalChunks: number;
  merkleRoot: string;
  cachedChunks: number[]; // indices of chunks currently stored locally
  lastAccessedAt: number;
  createdAt: number;
  durationSeconds: number;
}

/**
 * Calculates deterministic mock hash for a chunk
 */
export function computeChunkHash(videoId: string, chunkIndex: number): string {
  let hash = 0x811c9dc5;
  const str = `${videoId}:chunk:${chunkIndex}`;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(hash ^ str.charCodeAt(i), 0x01000193);
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generates Merkle root hash from an array of chunk hashes
 */
export function computeMerkleRoot(chunkHashes: string[]): string {
  if (chunkHashes.length === 0) return "00000000";
  let layer = [...chunkHashes];
  while (layer.length > 1) {
    const nextLayer: string[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const left = layer[i];
      const right = i + 1 < layer.length ? layer[i + 1] : left;
      let combined = 0;
      for (let j = 0; j < (left + right).length; j++) {
        combined = ((combined << 5) - combined + (left + right).charCodeAt(j)) | 0;
      }
      nextLayer.push(Math.abs(combined).toString(16).padStart(8, '0'));
    }
    layer = nextLayer;
  }
  return layer[0];
}

/**
 * LRU / FIFO Storage Eviction Policy:
 * When total cached bytes exceed maxSizeBytes, evict least recently accessed videos or partial chunks.
 */
export function evictOldMediaCache(
  cachedVideos: CachedVideoRecord[],
  maxStorageBytes: number
): { remainingVideos: CachedVideoRecord[]; evictedVideoIds: string[]; bytesFreed: number } {
  let currentTotalBytes = cachedVideos.reduce(
    (acc, v) => acc + v.cachedChunks.length * CHUNK_SIZE_BYTES,
    0
  );

  if (currentTotalBytes <= maxStorageBytes) {
    return { remainingVideos: cachedVideos, evictedVideoIds: [], bytesFreed: 0 };
  }

  // Sort by lastAccessedAt ascending (oldest first for LRU)
  const sorted = [...cachedVideos].sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
  const remaining: CachedVideoRecord[] = [];
  const evictedIds: string[] = [];
  let bytesFreed = 0;

  for (const video of sorted) {
    if (currentTotalBytes > maxStorageBytes) {
      const freed = video.cachedChunks.length * CHUNK_SIZE_BYTES;
      currentTotalBytes -= freed;
      bytesFreed += freed;
      evictedIds.push(video.videoId);
    } else {
      remaining.push(video);
    }
  }

  return { remainingVideos: remaining, evictedVideoIds: evictedIds, bytesFreed };
}
