import { Suspense } from 'react';
import { AdminAcceptInviteClient } from '@/features/admin-auth/ui/admin-accept-invite-client';

export default function AdminAcceptInvitePage() {
  return (
    <Suspense fallback={<p className="p-6">Loading…</p>}>
      <AdminAcceptInviteClient />
    </Suspense>
  );
}
