import { Suspense } from 'react';
import { UserBookingDetail } from '@/features/user-portal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserBookingPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense>
      <UserBookingDetail bookingId={Number(id)} />
    </Suspense>
  );
}
