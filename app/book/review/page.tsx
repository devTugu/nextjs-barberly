import { Suspense } from 'react';
import { BookReviewStep } from '@/features/booking-wizard';

export default function BookReviewPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <BookReviewStep />
    </Suspense>
  );
}
