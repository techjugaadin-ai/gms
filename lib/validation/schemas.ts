import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  membershipPlanId: z.string().min(1, 'Membership plan is required'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  permanentAddress: z.string().optional(),
  emergencyContact: z.string().optional(),
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  medicalInfo: z.string().optional(),
});

export const UpdateMemberSchema = CreateMemberSchema.partial();

export const CreatePaymentSchema = z.object({
  memberId: z.string().min(1),
  planId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentType: z.enum(['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other']),
  notes: z.string().optional(),
});

export const CreateMembershipPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(100),
  durationMonths: z.number().int().positive('Duration must be a positive integer'),
  price: z.number().positive('Price must be positive'),
  active: z.boolean().default(true),
});

export const UpdateMembershipPlanSchema = CreateMembershipPlanSchema.partial();

export const UpdateGymSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  currency: z.string().optional(),
});

export const UpdateSubscriptionSchema = z.object({
  subscriptionPlan: z.enum(['monthly', 'quarterly', 'half-yearly', 'yearly', 'custom']),
  subscriptionStartDate: z.string().min(1),
  subscriptionEndDate: z.string().min(1),
  paymentStatus: z.enum(['paid', 'pending', 'overdue']),
  subscriptionAmount: z.number().positive(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type CreateMembershipPlanInput = z.infer<typeof CreateMembershipPlanSchema>;
export type UpdateMembershipPlanInput = z.infer<typeof UpdateMembershipPlanSchema>;
export type UpdateGymInput = z.infer<typeof UpdateGymSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
