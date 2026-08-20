export type Gender = 'male' | 'female' | 'other';
export type MembershipStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED';

export interface Member {
  id: string;
  gymId: string;
  name: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  permanentAddress?: string;
  emergencyContact?: string;
  weight?: number;
  height?: number;
  medicalInfo?: string;
  membershipPlanId: string;
  joiningDate: string;
  membershipStartDate: string;
  membershipEndDate: string;
  referralCode: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}
