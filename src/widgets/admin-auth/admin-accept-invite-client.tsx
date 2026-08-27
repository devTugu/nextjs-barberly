'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function AdminAcceptInviteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const t = useTranslations('adminAuth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    void fetch(`/api/public/owner-invites/accept?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.data?.email) setEmail(body.data.email);
      })
      .catch(() => undefined);
  }, [token]);

  const accept = async () => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch('/api/public/owner-invites/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? t('inviteFailed'));
      }
      router.push(ROUTES.ADMIN_LOGIN);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('inviteFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <p className="p-6 text-sm text-muted-foreground">{t('inviteMissingToken')}</p>;
  }

  return (
    <Card className="mx-auto mt-12 max-w-md">
      <CardHeader>
        <CardTitle>{t('acceptInviteTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Input value={email} readOnly placeholder={t('email')} />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('password')}
        />
        <Button disabled={loading} onClick={accept}>
          {t('acceptInvite')}
        </Button>
      </CardContent>
    </Card>
  );
}
