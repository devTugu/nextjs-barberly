import { Suspense } from 'react';
import { UserBookingCancel } from '@/features/user-portal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserBookingCancelPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense>
      <UserBookingCancel bookingId={Number(id)} />
    </Suspense>
  );
}
