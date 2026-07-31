import { Suspense } from 'react';
import { UserProfileForm } from '@/features/user-portal';

export default function UserProfilePage() {
  return (
    <Suspense>
      <UserProfileForm />
    </Suspense>
  );
}
