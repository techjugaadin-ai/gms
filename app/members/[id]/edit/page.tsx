'use client';
import { useEffect, useState } from 'react';
import { useParams, redirect } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { MemberForm } from '@/components/members/MemberForm';
import type { Member } from '@/types/member';

export default function EditMemberPage() {
  const params = useParams<{ id: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/members/${params.id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setMember(d.data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout role="GYM_OWNER" title="Edit Member">
        <p className="text-sm text-gray-400">Loading...</p>
      </AppLayout>
    );
  }

  if (!member) {
    return (
      <AppLayout role="GYM_OWNER" title="Edit Member">
        <p className="text-sm text-red-500">Member not found.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="GYM_OWNER" title="Edit Member">
      <div className="max-w-3xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <MemberForm mode="edit" memberId={member.id} initialValues={member as any} />
        </div>
      </div>
    </AppLayout>
  );
}
