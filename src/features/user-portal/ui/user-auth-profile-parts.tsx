'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { env } from '@/shared/config/env';
import { useTenantSubdomain } from '@/shared/hooks/use-tenant-subdomain';
import { PageLoading } from '@/shared/ui/page-states';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

export function UserProfileForm() {
  const t = useTranslations('userPortal');
  const tenant = useTenantSubdomain();
  const [phone, setPhone] = useState('');
  const [originalPhone, setOriginalPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpHint, setOtpHint] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const devOtpBypass = env.OTP_DEV_BYPASS_CODE;
  const isDev = env.APP_ENV !== 'production' && devOtpBypass !== null;
  const phoneChanged = phone.trim() !== originalPhone;

  useEffect(() => {
    fetch(`/api/customer-auth/me?tenant=${tenant}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((body) => {
        const nextPhone = body.data?.phone ?? '';
        setPhone(nextPhone);
        setOriginalPhone(nextPhone);
        setName(body.data?.name ?? '');
      })
      .finally(() => setLoading(false));
  }, [tenant]);

  useEffect(() => {
    if (!phoneChanged) {
      setPhoneVerified(true);
      setOtp('');
      setOtpHint(null);
    } else {
      setPhoneVerified(false);
    }
  }, [phoneChanged]);

  const csrfHeaders = () =>
    import('@/shared/lib/csrf-client').then((m) => m.mutatingFetchHeaders());

  const sendOtp = async () => {
    if (!phone.trim()) return;
    setBusy(true);
    setMessage(null);
    setOtpHint(null);
    try {
      const res = await fetch(`/api/customer-auth/otp/send?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrfHeaders()) },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.message ?? t('otpSendFailed'));
      }
      if (isDev) {
        setOtpHint(t('devOtpHint', { code: devOtpBypass }));
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('otpSendFailed'));
    } finally {
      setBusy(false);
    }
  };

  const confirmPhone = async () => {
    if (!phone.trim() || !otp.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/customer-auth/me/phone/confirm?tenant=${tenant}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(await csrfHeaders()),
          },
          body: JSON.stringify({ newPhone: phone.trim(), code: otp.trim() }),
        },
      );
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('phoneConfirmFailed'));
      }
      const confirmedPhone = body.data?.phone ?? phone.trim();
      setPhone(confirmedPhone);
      setOriginalPhone(confirmedPhone);
      setPhoneVerified(true);
      setOtp('');
      setMessage(t('phoneConfirmed'));
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t('phoneConfirmFailed'));
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setMessage(t('nameRequired'));
      return;
    }
    if (phoneChanged && !phoneVerified) {
      setMessage(t('phoneVerifyRequired'));
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/customer-auth/me?tenant=${tenant}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(await csrfHeaders()),
        },
        body: JSON.stringify({ name: trimmedName }),
      });
      setMessage(res.ok ? t('saved') : t('saveFailed'));
    } catch {
      setMessage(t('saveFailed'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoading rows={2} />;

  return (
    <div className="space-y-4 px-4 py-6">
      <h1 className="text-xl font-semibold">{t('profileTitle')}</h1>
      <div className="space-y-2">
        <Label htmlFor="profile-name">{t('name')}</Label>
        <Input
          id="profile-name"
          placeholder={t('name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-phone">{t('phone')}</Label>
        {phoneChanged ? (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            {t('phoneChangeBanner')}
          </p>
        ) : null}
        <Input
          id="profile-phone"
          placeholder={t('phone')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>
      {phoneChanged ? (
        <div className="space-y-3 rounded-xl border border-border/60 p-4">
          <p className="text-sm text-muted-foreground">{t('phoneChangeHint')}</p>
          <div className="space-y-2">
            <Label htmlFor="profile-otp">{t('otp')}</Label>
            <Input
              id="profile-otp"
              placeholder={t('otp')}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
          </div>
          {otpHint ? (
            <p className="text-xs text-muted-foreground">{otpHint}</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 flex-1 rounded-xl"
              disabled={busy || !phone.trim()}
              onClick={sendOtp}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : t('sendOtp')}
            </Button>
            <Button
              type="button"
              className="min-h-11 flex-1 rounded-xl"
              disabled={busy || !phone.trim() || !otp.trim()}
              onClick={confirmPhone}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : t('verifyPhone')}
            </Button>
          </div>
        </div>
      ) : null}
      <Button
        className="min-h-11 w-full rounded-xl"
        disabled={busy || (phoneChanged && !phoneVerified)}
        onClick={save}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : t('save')}
      </Button>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
