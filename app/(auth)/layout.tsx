import { CsrfBootstrap } from '@/shared/ui/csrf-bootstrap';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CsrfBootstrap />
      {children}
    </>
  );
}
