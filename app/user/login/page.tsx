import { Suspense } from 'react';
import { CustomerLoginForm } from '@/features/customer-auth';
import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

export default function UserLoginPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense>
        <CustomerLoginForm />
      </Suspense>
    </>
  );
}
