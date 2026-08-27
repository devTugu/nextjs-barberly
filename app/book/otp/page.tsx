import { Suspense } from 'react';
import { BookOtpStep } from '@/features/booking-wizard';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

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
