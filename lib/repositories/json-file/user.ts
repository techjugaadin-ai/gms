import type { UserRepository } from '../interfaces';
import type { User } from '@/types/user';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'users.json';

export const jsonUserRepository: UserRepository = {
  async findById(id) {
    const users = readJsonFile<User>(FILE);
    return users.find((u) => u.id === id) ?? null;
  },

  async findByEmail(email) {
    const users = readJsonFile<User>(FILE);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async findByGymId(gymId) {
    const users = readJsonFile<User>(FILE);
    return users.filter((u) => u.gymId === gymId);
  },

  async create(user) {
    const users = readJsonFile<User>(FILE);
    users.push(user);
    writeJsonFile(FILE, users);
    return user;
  },

  async update(id, data) {
    const users = readJsonFile<User>(FILE);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, users);
    return users[idx];
  },
};
