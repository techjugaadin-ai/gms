import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { getGym } from '@/lib/services/gym.service';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemberForm } from '@/components/members/MemberForm';

export default async function NewMemberPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER') redirect('/');
  
  let gym = null;
  if (user.gymId) {
    try {
      gym = await getGym(user.gymId);
    } catch {}
  }
  
  return (
    <AppLayout role="GYM_OWNER" gymName={gym?.name} userName={user.name} title="Add Member">
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <MemberForm mode="create" />
        </div>
      </div>
    </AppLayout>
  );
}
