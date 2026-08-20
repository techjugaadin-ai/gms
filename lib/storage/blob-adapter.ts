/**
 * Vercel Blob Storage Adapter
 * Provides a unified interface for storing and retrieving data from Vercel Blob
 */

import { put, get, del } from '@vercel/blob';

const STORAGE_MODE = process.env.STORAGE_MODE || 'json';
// Vercel automatically provides BLOB_READ_WRITE_TOKEN when you create a Blob store
// If using custom setup, BLOB_TOKEN can also be used as fallback
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_TOKEN;

interface BlobData {
  data: unknown;
  expiresAt?: number;
}

/**
 * Store data in Vercel Blob
 */
export async function storeBlobData(key: string, data: unknown, expiresAt?: number): Promise<void> {
  if (STORAGE_MODE !== 'blob') {
    console.log('[storeBlobData] Storage mode is not blob, skipping');
    return;
  }

  if (!BLOB_TOKEN) {
    console.warn('[storeBlobData] BLOB_TOKEN not set, cannot store data in blob');
    return;
  }

  try {
    const blobData: BlobData = { data, expiresAt };
    const content = JSON.stringify(blobData);
    
    await put(key, content, {
      token: BLOB_TOKEN,
      access: 'private',
      contentType: 'application/json',
    });
    console.log('[storeBlobData] Stored data:', key);
  } catch (error) {
    console.error('[storeBlobData] Failed to store data:', error);
    throw error;
  }
}

/**
 * Retrieve data from Vercel Blob
 */
export async function retrieveBlobData(key: string): Promise<unknown | null> {
  if (STORAGE_MODE !== 'blob') {
    console.log('[retrieveBlobData] Storage mode is not blob, skipping');
    return null;
  }

  if (!BLOB_TOKEN) {
    console.warn('[retrieveBlobData] BLOB_TOKEN not set, cannot retrieve data from blob');
    return null;
  }

  try {
    const result = await get(key, { token: BLOB_TOKEN, access: 'private' });

    if (!result || !result.blob) {
      console.log('[retrieveBlobData] No data found:', key);
      return null;
    }

    // Read the blob as text using the Web Blob API
    const text = await (result.blob as unknown as Blob).text();
    const blobData: BlobData = JSON.parse(text);

    // Check expiration
    if (blobData.expiresAt && blobData.expiresAt < Date.now()) {
      console.log('[retrieveBlobData] Data expired:', key);
      await deleteBlobData(key);
      return null;
    }

    console.log('[retrieveBlobData] Retrieved data:', key);
    return blobData.data;
  } catch (error) {
    console.error('[retrieveBlobData] Failed to retrieve data:', error);
    return null;
  }
}

/**
 * Delete data from Vercel Blob
 */
export async function deleteBlobData(key: string): Promise<void> {
  if (STORAGE_MODE !== 'blob') {
    console.log('[deleteBlobData] Storage mode is not blob, skipping');
    return;
  }

  if (!BLOB_TOKEN) {
    console.warn('[deleteBlobData] BLOB_TOKEN not set, cannot delete data from blob');
    return;
  }

  try {
    await del(key, { token: BLOB_TOKEN });
    console.log('[deleteBlobData] Deleted data:', key);
  } catch (error) {
    console.error('[deleteBlobData] Failed to delete data:', error);
  }
}

/**
 * Check if blob storage is enabled
 */
export function isBlobStorageEnabled(): boolean {
  return STORAGE_MODE === 'blob' && !!BLOB_TOKEN;
}
