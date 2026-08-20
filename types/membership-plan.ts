export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  price: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
