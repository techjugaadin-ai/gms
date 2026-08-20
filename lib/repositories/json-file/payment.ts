import type { PaymentRepository } from '../interfaces';
import type { Payment } from '@/types/payment';
import { readJsonFile, writeJsonFile } from './base';

const FILE = 'payments.json';

export const jsonPaymentRepository: PaymentRepository = {
  async findById(id, gymId) {
    const payments = readJsonFile<Payment>(FILE);
    return payments.find((p) => p.id === id && p.gymId === gymId) ?? null;
  },

  async findByGymId(gymId) {
    const payments = readJsonFile<Payment>(FILE);
    return payments.filter((p) => p.gymId === gymId);
  },

  async findByMemberId(memberId, gymId) {
    const payments = readJsonFile<Payment>(FILE);
    return payments.filter((p) => p.memberId === memberId && p.gymId === gymId);
  },

  async create(payment) {
    const payments = readJsonFile<Payment>(FILE);
    payments.push(payment);
    writeJsonFile(FILE, payments);
    return payment;
  },
};
