import { Suspense } from 'react';
import { UserLoginForm } from '@/features/user-portal';
import { CsrfBootstrap } from '@/widgets/csrf-bootstrap/csrf-bootstrap';

export default function UserLoginPage() {
  return (
    <>
      <CsrfBootstrap />
      <Suspense>
        <UserLoginForm />
      </Suspense>
    </>
  );
}
