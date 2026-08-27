import { Suspense } from 'react';
import { AdminAcceptInviteClient } from '@/widgets/admin-auth';

export default function AdminAcceptInvitePage() {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <AdminAcceptInviteClient />
    </Suspense>
  );
}
