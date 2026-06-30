'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/model/store';
import { MfaSetupPanel } from '@/features/mfa/ui/mfa-setup-panel';
import { TotpCodeInput } from '@/features/mfa/ui/totp-code-input';
import { bffMe } from '@/shared/lib/bff-auth';
import type { UserOutput } from '@/entities/user';
import { getErrorMessage } from '@/shared/api';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  useConfirmMfaEnroll,
  useDisableMfa,
  useEnrollMfa,
} from '../api/mutations';

export function MfaSettingsPanel() {
  const t = useTranslations('security');
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const enroll = useEnrollMfa();
  const confirm = useConfirmMfaEnroll();
  const disable = useDisableMfa();

  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');

  const refreshUser = async () => {
    const me = await bffMe<UserOutput>();
    setSession(me);
  };

  const handleStartEnroll = async () => {
    try {
      const result = await enroll.mutateAsync();
      setOtpauthUrl(result.otpauthUrl);
      setCode('');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleConfirm = async () => {
    try {
      await confirm.mutateAsync(code);
      setOtpauthUrl(null);
      setCode('');
      await refreshUser();
      toast.success(t('mfaEnabledToast'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDisable = async () => {
    try {
      await disable.mutateAsync(code);
      setCode('');
      await refreshUser();
      toast.success(t('mfaDisabledToast'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>{t('mfaTitle')}</CardTitle>
        <CardDescription>
          {user?.mfaEnabled ? t('mfaEnabled') : t('mfaDisabledHint')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user?.mfaEnabled && !otpauthUrl && (
          <Button onClick={handleStartEnroll} disabled={enroll.isPending}>
            {enroll.isPending ? t('preparingSetup') : t('setupAuthenticator')}
          </Button>
        )}

        {otpauthUrl && (
          <MfaSetupPanel
            otpauthUrl={otpauthUrl}
            isLoading={enroll.isPending}
            code={code}
            onCodeChange={setCode}
            onConfirm={handleConfirm}
            isConfirming={confirm.isPending}
            confirmLabel={t('confirmMfa')}
            confirmingLabel={t('confirming')}
            onBack={() => {
              setOtpauthUrl(null);
              setCode('');
            }}
            backLabel={t('cancelSetup')}
          />
        )}

        {user?.mfaEnabled && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="mfa-disable-code">{t('currentCode')}</Label>
              <TotpCodeInput
                id="mfa-disable-code"
                value={code}
                onChange={setCode}
                disabled={disable.isPending}
              />
            </div>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disable.isPending || code.length !== 6}
            >
              {disable.isPending ? t('disabling') : t('disableMfa')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
