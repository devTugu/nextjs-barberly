import { Suspense } from 'react';
import { BookStaffStep } from '@/features/booking-wizard';

export default function BookStaffPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <BookStaffStep />
    </Suspense>
  );
}
