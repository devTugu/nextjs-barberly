import { Suspense } from 'react';
import { BookBranchStep } from '@/features/booking-wizard';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

export default function BookBranchPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense fallback={<p className="p-8 text-center">Loading…</p>}>
        <BookBranchStep />
      </Suspense>
    </>
  );
}
