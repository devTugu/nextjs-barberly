import { Suspense } from 'react';
import { BookSlotStep } from '@/features/booking-wizard';

export default function BookSlotPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <BookSlotStep />
    </Suspense>
  );
}
