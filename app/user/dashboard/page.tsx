import { Suspense } from 'react';
import { UserBookingsDashboard } from '@/features/user-portal';

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <UserBookingsDashboard />
    </Suspense>
  );
}
