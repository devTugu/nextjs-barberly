import { Suspense } from 'react';
import { BookPayStep } from '@/features/booking-wizard';

export default function BookPayPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <BookPayStep />
    </Suspense>
  );
}
