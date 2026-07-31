'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { env } from '@/shared/config/env';
import { ROUTES } from '@/shared/config/routes';
import { fetchCustomerSession } from '../lib/customer-session';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

type AuthStep = 'phone' | 'otp' | 'name';

export interface CustomerAuthFlowProps {
  tenant: string;
  /** Where to go after auth + profile complete. */
  redirectTo?: string;
  onComplete?: () => void;
  initialStep?: AuthStep;
  className?: string;
}

export function CustomerAuthFlow({
  tenant,
  redirectTo = ROUTES.BOOK,
  onComplete,
  initialStep = 'phone',
  className,
}: CustomerAuthFlowProps) {
  const t = useTranslations('customerAuth');
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const devOtpBypass = env.OTP_DEV_BYPASS_CODE;

  useEffect(() => {
    if (initialStep !== 'name') return;
    void fetchCustomerSession(tenant).then((session) => {
      if (session?.phone) setPhone(session.phone);
      if (session?.name) setName(session.name);
    });
  }, [initialStep, tenant]);

  const finish = useCallback(() => {
    onComplete?.();
    if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
      window.location.href = redirectTo;
      return;
    }
    router.push(redirectTo);
  }, [onComplete, redirectTo, router]);

  const sendOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    setOtpHint(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/send?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('otpSendFailed'));
      }
      const data = body.data as { devCode?: string; devBypassCode?: string };
      if (data.devCode) {
        setOtp(data.devCode);
        setOtpHint(t('devOtpHint', { code: data.devCode }));
      } else if (data.devBypassCode) {
        setOtp(data.devBypassCode);
        setOtpHint(t('devOtpHint', { code: data.devBypassCode }));
      }
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('otpSendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/otp/verify?tenant=${tenant}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ phone: phone.trim(), code }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('otpInvalid'));
      }
      const customer = body.data?.customer as {
        needsProfile?: boolean;
        name?: string | null;
      };
      if (customer?.needsProfile || !customer?.name?.trim()) {
        setStep('name');
        return;
      }
      finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('otpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  const saveName = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t('nameRequired'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const csrf = await import('@/shared/lib/csrf-client').then((m) =>
        m.mutatingFetchHeaders(),
      );
      const res = await fetch(`/api/customer-auth/me?tenant=${tenant}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(await csrf) },
        body: JSON.stringify({ name: trimmedName }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? t('saveFailed'));
      }
      finish();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {step === 'phone' ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('signInTitle')}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t('signInSubtitle')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">{t('phone')}</Label>
            <Input
              id="customer-phone"
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              className="min-h-12 rounded-xl"
            />
          </div>
          <Button
            className="min-h-12 w-full rounded-xl text-base"
            onClick={() => void sendOtp()}
            disabled={!phone.trim() || loading}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : t('continue')}
          </Button>
        </div>
      ) : null}

      {step === 'otp' ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('otpTitle')}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {t('otpSubtitle', { phone })}
            </p>
          </div>
          {devOtpBypass ? (
            <Button
              variant="secondary"
              className="w-full rounded-xl"
              onClick={() => void verifyOtp(devOtpBypass)}
              disabled={loading}
            >
              {t('devBypass')}
            </Button>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="customer-otp">{t('otp')}</Label>
            <Input
              id="customer-otp"
              placeholder={t('otp')}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              inputMode="numeric"
              className="min-h-12 rounded-xl text-center text-lg tracking-widest"
            />
          </div>
          {otpHint ? (
            <p className="text-muted-foreground text-sm">{otpHint}</p>
          ) : null}
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => void sendOtp()}
            disabled={loading}
          >
            {t('resendOtp')}
          </Button>
          <Button
            className="min-h-12 w-full rounded-xl text-base"
            onClick={() => void verifyOtp(otp)}
            disabled={!otp.trim() || loading}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : t('verify')}
          </Button>
        </div>
      ) : null}

      {step === 'name' ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{t('registerTitle')}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{t('registerSubtitle')}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-name">{t('name')}</Label>
            <Input
              id="customer-name"
              placeholder={t('namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="min-h-12 rounded-xl"
            />
          </div>
          <Button
            className="min-h-12 w-full rounded-xl text-base"
            onClick={() => void saveName()}
            disabled={!name.trim() || loading}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : t('completeRegistration')}
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive mt-4 text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
