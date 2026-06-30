'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { publicGet } from '@/shared/lib/public-api';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

export default function BookConfirmClient() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant') ?? 'demo';
  const bookingId = searchParams.get('bookingId');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    publicGet<{ status: string }>(`/bookings/${bookingId}`, tenant)
      .then((b) => setStatus(b.status))
      .catch(() => setStatus('unknown'));
  }, [bookingId, tenant]);

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Booking #{bookingId ?? '—'}:{' '}
            <strong>{status ?? 'Loading…'}</strong>
          </p>
          {status === 'confirmed' && (
            <p className="text-sm text-muted-foreground">
              You will receive an SMS confirmation shortly.
            </p>
          )}
          <Button asChild>
            <Link href={ROUTES.HOME}>Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
