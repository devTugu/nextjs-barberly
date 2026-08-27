'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { sessionHint } from '@/shared/lib/session-hint';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export function AdminStaffLoginClient() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const t = useTranslations('adminAuth');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/staff-auth/otp/send?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) throw new Error(t('otpSendFailed'));
    } catch (e) {
      setError(e instanceof Error ? e.message : t('otpSendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const code =
        env.APP_ENV !== 'production' && env.OTP_DEV_BYPASS_CODE
          ? env.OTP_DEV_BYPASS_CODE
          : otp;
      const res = await fetch(
        `/api/staff-auth/otp/verify?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(await csrf) },
          body: JSON.stringify({ phone, code }),
        },
      );
      if (!res.ok) throw new Error(t('otpVerifyFailed'));
      sessionHint.setSession(3600);
      router.push(ROUTES.ADMIN_CALENDAR);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('otpVerifyFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto mt-12 max-w-md">
      <CardHeader>
        <CardTitle>{t('staffLoginTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phone')} />
        <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={t('otpCode')} />
        <Button variant="outline" disabled={loading} onClick={sendOtp}>
          {t('sendOtp')}
        </Button>
        <Button disabled={loading} onClick={verify}>
          {t('verifyOtp')}
        </Button>
      </CardContent>
    </Card>
  );
}
