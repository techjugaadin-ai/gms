import type { GymRepository } from '../interfaces';
import type { Gym } from '@/types/gym';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'gyms.json';

export const jsonGymRepository: GymRepository = {
  async findById(id) {
    const gyms = readJsonFile<Gym>(FILE);
    return gyms.find((g) => g.id === id) ?? null;
  },

  async findAll() {
    return readJsonFile<Gym>(FILE);
  },

  async create(gym) {
    const gyms = readJsonFile<Gym>(FILE);
    gyms.push(gym);
    writeJsonFile(FILE, gyms);
    return gym;
  },

  async update(id, data) {
    const gyms = readJsonFile<Gym>(FILE);
    const idx = gyms.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    gyms[idx] = { ...gyms[idx], ...data, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, gyms);
    return gyms[idx];
  },
};
