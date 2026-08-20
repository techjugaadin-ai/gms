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
    // Use useCache: false for consistent reads (get latest version)
    const result = await get(key, { access: 'private', useCache: false });

    if (!result) {
      console.log('[retrieveBlobData] ⚠ No blob found for key:', key);
      return null;
    }

    if (!result.blob) {
      console.log('[retrieveBlobData] ⚠ Blob result has no blob property for key:', key);
      return null;
    }

    let text: string;
    const blobObj = result.blob as any;

    // Primary method: use Blob.text() if available
    if (typeof blobObj.text === 'function') {
      console.log('[retrieveBlobData] Using Blob.text() method...');
      text = await blobObj.text();
    }
    // Fallback 1: try arrayBuffer (also a standard Blob API method)
    else if (typeof blobObj.arrayBuffer === 'function') {
      console.log('[retrieveBlobData] Using Blob.arrayBuffer() method...');
      const buffer = await blobObj.arrayBuffer();
      text = new TextDecoder().decode(buffer);
    }
    // Fallback 2: Response API (works in Edge Runtime)
    else if (typeof blobObj === 'object' && !(blobObj instanceof String)) {
      try {
        console.log('[retrieveBlobData] Trying Response API method...');
        const response = new Response(blobObj);
        text = await response.text();
      } catch (responseError) {
        console.error('[retrieveBlobData] Response API failed:', responseError);
        throw new Error(`Cannot read blob - tried text(), arrayBuffer(), and Response API. Blob type: ${typeof blobObj}`);
      }
    }
    // Should not reach here, but handle edge case
    else {
      throw new Error(`Cannot read blob - type is ${typeof blobObj}, no usable methods found`);
    }

    console.log('[retrieveBlobData] Successfully read blob content, parsing JSON...');
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
    console.error('[retrieveBlobData] ✗ Failed to retrieve data:', key);
    if (error instanceof SyntaxError) {
      console.error('[retrieveBlobData] JSON Parse Error - data might be corrupted:', error.message);
    } else if (error instanceof Error) {
      console.error('[retrieveBlobData] Error:', error.message);
    } else {
      console.error('[retrieveBlobData] Unknown error:', String(error));
    }
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
