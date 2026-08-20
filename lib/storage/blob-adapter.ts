/**
 * Vercel Blob Storage Adapter
 * Provides a unified interface for storing and retrieving data from Vercel Blob
 * 
 * When a Blob Store is connected to a Vercel project:
 * - The @vercel/blob SDK automatically handles authentication in serverless functions
 * - No need to manually pass token for server-side operations
 * - Token is only needed for client-side operations
 */

import { put, get, del } from '@vercel/blob';

const STORAGE_MODE = process.env.STORAGE_MODE || 'json';
const IS_VERCEL = !!process.env.VERCEL;

interface BlobData {
  data: unknown;
  expiresAt?: number;
}

/**
 * Log blob configuration for debugging
 */
function logBlobConfig() {
  console.log('[BlobAdapter] STORAGE_MODE:', STORAGE_MODE);
  console.log('[BlobAdapter] IS_VERCEL:', IS_VERCEL);
  console.log('[BlobAdapter] Node env:', process.env.NODE_ENV);
}

/**
 * Store data in Vercel Blob
 */
export async function storeBlobData(key: string, data: unknown, expiresAt?: number): Promise<void> {
  try {
    if (STORAGE_MODE !== 'blob') {
      console.log('[storeBlobData] Storage mode is', STORAGE_MODE, '- not using blob');
      return;
    }

    if (!IS_VERCEL && process.env.NODE_ENV === 'production') {
      console.error('[storeBlobData] Blob storage requested but not running on Vercel');
      logBlobConfig();
      throw new Error('Blob storage only available on Vercel');
    }

    const blobData: BlobData = { data, expiresAt };
    const content = JSON.stringify(blobData);
    
    console.log('[storeBlobData] Storing data with key:', key, 'size:', content.length, 'bytes');
    
    // In Vercel environment, the SDK automatically uses the connected Blob store
    // No need to pass token for server-side operations
    await put(key, content, {
      access: 'private',
      contentType: 'application/json',
    });
    
    console.log('[storeBlobData] ✓ Successfully stored:', key);
  } catch (error) {
    console.error('[storeBlobData] ✗ Failed to store data:', error);
    throw error;
  }
}

/**
 * Retrieve data from Vercel Blob
 */
export async function retrieveBlobData(key: string): Promise<unknown | null> {
  try {
    if (STORAGE_MODE !== 'blob') {
      console.log('[retrieveBlobData] Storage mode is', STORAGE_MODE, '- not using blob');
      return null;
    }

    if (!IS_VERCEL && process.env.NODE_ENV === 'production') {
      console.error('[retrieveBlobData] Blob storage requested but not running on Vercel');
      logBlobConfig();
      return null;
    }

    console.log('[retrieveBlobData] Retrieving data with key:', key);
    
    // In Vercel environment, the SDK automatically uses the connected Blob store
    // No need to pass token for server-side operations
    const result = await get(key, { access: 'private' });

    if (!result) {
      console.log('[retrieveBlobData] No blob found for key:', key);
      return null;
    }

    if (!result.blob) {
      console.log('[retrieveBlobData] Blob result has no blob property for key:', key);
      return null;
    }

    // Vercel's Blob object is a ReadableStream-like object
    // We need to read it as a stream and convert to text
    let text: string;
    
    if (typeof (result.blob as any).text === 'function') {
      // If it has text() method (standard Blob), use it
      text = await (result.blob as any).text();
    } else if (typeof (result.blob as any).stream === 'function') {
      // If it has stream() method, read the stream
      const stream = (result.blob as any).stream() as ReadableStream<Uint8Array>;
      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }
      
      const buffer = Buffer.concat(chunks);
      text = buffer.toString('utf-8');
    } else {
      // Fallback: try to convert to string directly
      text = String(result.blob);
    }

    const blobData: BlobData = JSON.parse(text);

    // Check expiration
    if (blobData.expiresAt && blobData.expiresAt < Date.now()) {
      console.log('[retrieveBlobData] Data expired for key:', key);
      await deleteBlobData(key).catch(err => console.error('[retrieveBlobData] Error deleting expired data:', err));
      return null;
    }

    console.log('[retrieveBlobData] ✓ Successfully retrieved:', key);
    return blobData.data;
  } catch (error) {
    console.error('[retrieveBlobData] ✗ Failed to retrieve data:', error);
    return null;
  }
}

/**
 * Delete data from Vercel Blob
 */
export async function deleteBlobData(key: string): Promise<void> {
  try {
    if (STORAGE_MODE !== 'blob') {
      console.log('[deleteBlobData] Storage mode is', STORAGE_MODE, '- not using blob');
      return;
    }

    if (!IS_VERCEL && process.env.NODE_ENV === 'production') {
      console.warn('[deleteBlobData] Blob storage requested but not running on Vercel');
      return;
    }

    console.log('[deleteBlobData] Deleting data with key:', key);
    
    // In Vercel environment, the SDK automatically uses the connected Blob store
    await del(key);
    
    console.log('[deleteBlobData] ✓ Successfully deleted:', key);
  } catch (error) {
    console.error('[deleteBlobData] ✗ Failed to delete data:', error);
  }
}

/**
 * Check if blob storage is enabled
 */
export function isBlobStorageEnabled(): boolean {
  const enabled = STORAGE_MODE === 'blob';
  console.log('[isBlobStorageEnabled]', enabled ? '✓ ENABLED (Vercel Blob)' : '✗ DISABLED (File System)', '(STORAGE_MODE=' + STORAGE_MODE + ', IS_VERCEL=' + IS_VERCEL + ')');
  return enabled;
}
