import type { MemberRepository } from '../interfaces';
import type { Member } from '@/types/member';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'members.json';

export const jsonMemberRepository: MemberRepository = {
  async findById(id, gymId) {
    const members = readJsonFile<Member>(FILE);
    return members.find((m) => m.id === id && m.gymId === gymId && !m.isDeleted) ?? null;
  },

  async findByGymId(gymId) {
    const members = readJsonFile<Member>(FILE);
    return members.filter((m) => m.gymId === gymId && !m.isDeleted);
  },

  async create(member) {
    const members = readJsonFile<Member>(FILE);
    members.push(member);
    writeJsonFile(FILE, members);
    return member;
  },

  async update(id, gymId, data) {
    const members = readJsonFile<Member>(FILE);
    const idx = members.findIndex((m) => m.id === id && m.gymId === gymId && !m.isDeleted);
    if (idx === -1) return null;
    members[idx] = { ...members[idx], ...data, updatedAt: new Date().toISOString() };
    writeJsonFile(FILE, members);
    return members[idx];
  },

  async softDelete(id, gymId) {
    const members = readJsonFile<Member>(FILE);
    const idx = members.findIndex((m) => m.id === id && m.gymId === gymId && !m.isDeleted);
    if (idx === -1) return false;
    members[idx] = {
      ...members[idx],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile(FILE, members);
    return true;
  },
};
