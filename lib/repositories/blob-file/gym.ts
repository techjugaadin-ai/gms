/**
 * Blob-based Gym Repository
 * Tries to retrieve data from Blob storage, falls back to JSON files
 */

import type { GymRepository } from '../interfaces';
import type { Gym } from '@/types/gym';
import { readJsonFile, writeJsonFile } from './base';
import { retrieveBlobData, storeBlobData } from '@/lib/storage/blob-adapter';

const FILE = 'gyms.json';
const BLOB_KEY = 'gyms';

async function ensureBlobSync(gyms: Gym[]): Promise<void> {
  if (process.env.STORAGE_MODE === 'blob') {
    try {
      await storeBlobData(BLOB_KEY, gyms);
    } catch (error) {
      console.error('[blobGymRepository] Failed to sync to blob:', error);
      // Continue anyway - JSON is still valid
    }
  }
}

async function getBlobOrJsonGyms(): Promise<Gym[]> {
  // Try blob first if enabled
  if (process.env.STORAGE_MODE === 'blob') {
    try {
      const blobData = await retrieveBlobData(BLOB_KEY);
      if (Array.isArray(blobData)) {
        console.log('[blobGymRepository] ✓ Retrieved gyms from blob storage');
        return blobData as Gym[];
      }
    } catch (error) {
      console.error('[blobGymRepository] Blob retrieval failed, falling back to JSON:', error);
    }
  }

  // Fall back to JSON
  return readJsonFile<Gym>(FILE);
}

export const blobGymRepository: GymRepository = {
  async findById(id) {
    const gyms = await getBlobOrJsonGyms();
    return gyms.find((g) => g.id === id) ?? null;
  },

  async findAll() {
    return getBlobOrJsonGyms();
  },

  async create(gym) {
    const gyms = await getBlobOrJsonGyms();
    gyms.push(gym);
    writeJsonFile(FILE, gyms);
    await ensureBlobSync(gyms);
    return gym;
  },

  async update(id, data) {
    const gyms = await getBlobOrJsonGyms();
    const idx = gyms.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    gyms[idx] = { ...gyms[idx], ...data, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, gyms);
    await ensureBlobSync(gyms);
    return gyms[idx];
  },
};
