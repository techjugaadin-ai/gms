import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemberForm } from '@/components/members/MemberForm';

export default async function NewMemberPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER') redirect('/');
  return (
    <AppLayout role="GYM_OWNER" title="Add Member">
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <MemberForm mode="create" />
        </div>
      </div>
    </AppLayout>
  );
}
