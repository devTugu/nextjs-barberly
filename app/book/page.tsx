import { Suspense } from 'react';
import { BookServicesEntry } from '@/features/booking-wizard';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

export default function BookPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
        <BookServicesEntry />
      </Suspense>
    </>
  );
}
