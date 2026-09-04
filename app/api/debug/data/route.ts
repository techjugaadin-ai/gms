import { successResponse } from '@/lib/utils/api';
import { memberRepo, paymentRepo, notificationRepo } from '@/lib/repositories';

export async function GET() {
  const members = await memberRepo.findByGymId('gym_001');
  const gym2Members = await memberRepo.findByGymId('gym_002');
  const payments1 = await paymentRepo.findByGymId('gym_001');
  const payments2 = await paymentRepo.findByGymId('gym_002');
  const notifs1 = await notificationRepo.findByGymId('gym_001');
  const notifs2 = await notificationRepo.findByGymId('gym_002');

  console.log('[DEBUG/DATA] gym_001 members:', members.length, 'members names:', members.slice(0, 3).map(m => m.name));
  console.log('[DEBUG/DATA] gym_002 members:', gym2Members.length, 'members names:', gym2Members.slice(0, 3).map(m => m.name));
  console.log('[DEBUG/DATA] gym_001 payments:', payments1.length);
  console.log('[DEBUG/DATA] gym_002 payments:', payments2.length);
  console.log('[DEBUG/DATA] gym_001 notifications:', notifs1.length, 'sample:', notifs1.slice(0, 2).map(n => ({ memberId: n.memberId, gymId: n.gymId })));
  console.log('[DEBUG/DATA] gym_002 notifications:', notifs2.length, 'sample:', notifs2.slice(0, 2).map(n => ({ memberId: n.memberId, gymId: n.gymId })));

  return successResponse({
    gym_001: {
      members: members.length,
      memberNames: members.slice(0, 5).map(m => m.name),
      payments: payments1.length,
      notifications: notifs1.length,
    },
    gym_002: {
      members: gym2Members.length,
      memberNames: gym2Members.slice(0, 5).map(m => m.name),
      payments: payments2.length,
      notifications: notifs2.length,
    },
  });
}
