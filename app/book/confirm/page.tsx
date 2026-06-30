import { Suspense } from 'react';
import BookConfirmClient from './confirm-client';

export default function BookConfirmPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
      <BookConfirmClient />
    </Suspense>
  );
}
