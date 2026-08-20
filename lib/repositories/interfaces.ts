import type { Gym } from '@/types/gym';
import type { User } from '@/types/user';
import type { Member } from '@/types/member';
import type { MembershipPlan } from '@/types/membership-plan';
import type { Payment } from '@/types/payment';
import type { Notification } from '@/types/notification';

export interface GymRepository {
  findById(id: string): Promise<Gym | null>;
  findAll(): Promise<Gym[]>;
  create(gym: Gym): Promise<Gym>;
  update(id: string, data: Partial<Gym>): Promise<Gym | null>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByGymId(gymId: string): Promise<User[]>;
  create(user: User): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User | null>;
}

export interface MemberRepository {
  findById(id: string, gymId: string): Promise<Member | null>;
  findByGymId(gymId: string): Promise<Member[]>;
  create(member: Member): Promise<Member>;
  update(id: string, gymId: string, data: Partial<Member>): Promise<Member | null>;
  softDelete(id: string, gymId: string): Promise<boolean>;
}

export interface MembershipPlanRepository {
  findById(id: string, gymId: string): Promise<MembershipPlan | null>;
  findByGymId(gymId: string): Promise<MembershipPlan[]>;
  create(plan: MembershipPlan): Promise<MembershipPlan>;
  update(id: string, gymId: string, data: Partial<MembershipPlan>): Promise<MembershipPlan | null>;
  delete(id: string, gymId: string): Promise<boolean>;
}

export interface PaymentRepository {
  findById(id: string, gymId: string): Promise<Payment | null>;
  findByGymId(gymId: string): Promise<Payment[]>;
  findByMemberId(memberId: string, gymId: string): Promise<Payment[]>;
  create(payment: Payment): Promise<Payment>;
}

export interface NotificationRepository {
  findByGymId(gymId: string): Promise<Notification[]>;
  findUnreadByGymId(gymId: string): Promise<Notification[]>;
  create(notification: Notification): Promise<Notification>;
  markAsRead(id: string, gymId: string): Promise<boolean>;
  upsertForMember(notification: Notification): Promise<Notification>;
}
