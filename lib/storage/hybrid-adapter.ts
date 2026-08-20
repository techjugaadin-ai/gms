/**
 * Hybrid Storage Adapter
 * Tries blob storage first, falls back to JSON file storage if blob fails
 * This ensures data is always available even if blob storage has issues
 */

import { retrieveBlobData, storeBlobData } from './blob-adapter';

const STORAGE_MODE = process.env.STORAGE_MODE || 'json';

interface HybridStorageOptions {
  key: string;
  filename: string;
  fallbackRead?: () => Promise<unknown>;
  fallbackWrite?: (data: unknown) => Promise<void>;
}

/**
 * Retrieve data with hybrid approach: blob first, then fallback
 */
export async function getHybridData(
  key: string,
  fallbackFn: () => Promise<unknown>
): Promise<unknown | null> {
  // If not using blob storage, skip directly to fallback
  if (STORAGE_MODE !== 'blob') {
    console.log('[HybridAdapter] STORAGE_MODE is', STORAGE_MODE, '- using fallback');
    return fallbackFn();
  }

  try {
    console.log('[HybridAdapter] Attempting to retrieve from blob storage:', key);
    const blobData = await retrieveBlobData(key);
    
    if (blobData !== null) {
      console.log('[HybridAdapter] ✓ Successfully retrieved from blob storage');
      return blobData;
    }

    console.log('[HybridAdapter] No data in blob storage, falling back to JSON');
    return fallbackFn();
  } catch (error) {
    console.error('[HybridAdapter] Blob retrieval failed, falling back:', error);
    return fallbackFn();
  }
}

/**
 * Store data with hybrid approach: store in both blob and fallback storage
 */
export async function setHybridData(
  key: string,
  data: unknown,
  fallbackFn: (data: unknown) => Promise<void>
): Promise<void> {
  // Always write to fallback storage for consistency
  await fallbackFn(data);

  // Try to write to blob storage if enabled
  if (STORAGE_MODE === 'blob') {
    try {
      console.log('[HybridAdapter] Storing data to blob storage:', key);
      await storeBlobData(key, data);
      console.log('[HybridAdapter] ✓ Successfully stored to blob storage');
    } catch (error) {
      console.error('[HybridAdapter] Failed to store to blob storage:', error);
      // Don't fail the operation - fallback storage is already updated
      console.log('[HybridAdapter] Continuing with fallback storage only');
    }
  }
}
