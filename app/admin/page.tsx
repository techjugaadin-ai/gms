import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'GYM_OWNER') redirect('/');
  redirect('/admin/settings');
}
