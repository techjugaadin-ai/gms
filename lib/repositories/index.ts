import { jsonGymRepository } from './json-file/gym';
import { jsonUserRepository } from './json-file/user';
import { jsonMemberRepository } from './json-file/member';
import { jsonMembershipPlanRepository } from './json-file/membership-plan';
import { jsonPaymentRepository } from './json-file/payment';
import { jsonNotificationRepository } from './json-file/notification';

import type {
  GymRepository,
  UserRepository,
  MemberRepository,
  MembershipPlanRepository,
  PaymentRepository,
  NotificationRepository,
} from './interfaces';

export const gymRepo: GymRepository = jsonGymRepository;
export const userRepo: UserRepository = jsonUserRepository;
export const memberRepo: MemberRepository = jsonMemberRepository;
export const planRepo: MembershipPlanRepository = jsonMembershipPlanRepository;
export const paymentRepo: PaymentRepository = jsonPaymentRepository;
export const notificationRepo: NotificationRepository = jsonNotificationRepository;
