'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { fetchCustomerSession } from '@/features/customer-auth';
import { readBookingDraft, writeBookingDraft } from '../lib/booking-session';
import { BookingWizardShell } from './booking-wizard-shell';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function BookOtpStep() {
  const router = useRouter();
  const tenant = useTenantSubdomain();
  const t = useTranslations('bookingWizard');
  const draft = readBookingDraft();
  const [phone, setPhone] = useState(draft.phone);
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const devOtpBypass = env.OTP_DEV_BYPASS_CODE;
  const isDevBooking = env.APP_ENV !== 'production' && devOtpBypass !== null;

  useEffect(() => {
    if (!draft.booking) {
      router.replace(ROUTES.BOOK);
      return;
    }
    void fetchCustomerSession(tenant).then((session) => {
      if (session && !session.needsProfile) {
        router.replace(ROUTES.BOOK_PAY);
      }
    });
  }, [draft.booking, router, tenant]);

  if (!draft.booking) return null;

  const verifyAndContinue = async (code: string) => {
    setLoading(true);
    setError(null);
    writeBookingDraft({ phone });
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/verify?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({
          phone,
          code,
          bookingId: draft.booking?.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? t('errors.otpFailed'));
      }
      router.push(ROUTES.BOOK_PAY);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError(null);
    setOtpHint(null);
    writeBookingDraft({ phone });
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/send?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ phone }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('errors.otpFailed'));
      }
      const data = body.data as { devCode?: string; devBypassCode?: string };
      if (data.devCode) {
        setOtp(data.devCode);
        setOtpHint(t('otp.devHint', { code: data.devCode }));
      } else if (data.devBypassCode) {
        setOtp(data.devBypassCode);
        setOtpHint(t('otp.devHint', { code: data.devBypassCode }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.otpFailed'));
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <Button
      onClick={() => verifyAndContinue(otp)}
      disabled={!otp || !phone || loading}
      className="min-h-12 w-full rounded-xl text-base"
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : t('otp.verify')}
    </Button>
  );

  return (
    <BookingWizardShell
      step={4}
      title={t('otp.title')}
      backHref={ROUTES.BOOK_SLOT}
      footer={footer}
    >
      {error ? (
        <p className="mb-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="mb-6 text-sm text-muted-foreground">
        #{draft.booking.id} · {draft.booking.totalPrice.toLocaleString()}₮
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="book-phone">{t('otp.phone')}</Label>
          <Input
            id="book-phone"
            placeholder={t('otp.phone')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="min-h-12 rounded-xl"
            autoComplete="tel"
          />
        </div>

        {isDevBooking ? (
          <Button
            variant="secondary"
            onClick={() => devOtpBypass && verifyAndContinue(devOtpBypass)}
            disabled={!phone || loading}
            className="min-h-11 w-full rounded-xl"
          >
            Dev bypass
          </Button>
        ) : null}

        <Button
          variant="outline"
          onClick={sendOtp}
          disabled={!phone || loading}
          className="min-h-11 w-full rounded-xl"
        >
          {t('otp.send')}
        </Button>

        {otpHint ? (
          <p className="text-sm text-muted-foreground">{otpHint}</p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="book-otp">{t('otp.code')}</Label>
          <Input
            id="book-otp"
            placeholder={t('otp.code')}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="min-h-12 rounded-xl text-center text-lg tracking-widest"
            inputMode="numeric"
          />
        </div>
      </div>
    </BookingWizardShell>
  );
}
