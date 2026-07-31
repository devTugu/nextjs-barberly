import { Suspense } from 'react';
import { BookOtpStep } from '@/features/booking-wizard';
import { CsrfBootstrap } from '@/widgets/csrf-bootstrap/csrf-bootstrap';

export default function BookOtpPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
        <BookOtpStep />
      </Suspense>
    </>
  );
}
