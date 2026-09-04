import { supabaseGymRepository } from './supabase/gym';
import { supabaseUserRepository } from './supabase/user';
import { supabaseMemberRepository } from './supabase/member';
import { supabaseMembershipPlanRepository } from './supabase/membership-plan';
import { supabasePaymentRepository } from './supabase/payment';
import { supabaseNotificationRepository } from './supabase/notification';

import type {
  GymRepository,
  UserRepository,
  MemberRepository,
  MembershipPlanRepository,
  PaymentRepository,
  NotificationRepository,
} from './interfaces';

export const gymRepo: GymRepository = supabaseGymRepository;
export const userRepo: UserRepository = supabaseUserRepository;
export const memberRepo: MemberRepository = supabaseMemberRepository;
export const planRepo: MembershipPlanRepository = supabaseMembershipPlanRepository;
export const paymentRepo: PaymentRepository = supabasePaymentRepository;
export const notificationRepo: NotificationRepository = supabaseNotificationRepository;
