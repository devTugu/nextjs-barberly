import { Suspense } from 'react';
import { UserBookingReschedule } from '@/features/user-portal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserBookingReschedulePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense>
      <UserBookingReschedule bookingId={Number(id)} />
    </Suspense>
  );
}
