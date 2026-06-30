import { Suspense } from 'react';
import { BookingWizard } from '@/features/booking-wizard';
import { CsrfBootstrap } from '@/widgets/csrf-bootstrap/csrf-bootstrap';

export default function BookPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
        <BookingWizard />
      </Suspense>
    </>
  );
}
