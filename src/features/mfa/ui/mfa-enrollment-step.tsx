'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { MfaSetupPanel } from './mfa-setup-panel';
import { resolveMfaErrorMessage } from '../lib/resolve-mfa-error-message';
import { bffEnrollmentEnroll } from '@/shared/lib/bff-auth';

interface MfaEnrollmentStepProps {
  enrollmentToken: string;
  onBack: () => void;
  onConfirm: (code: string) => Promise<void>;
  isConfirming: boolean;
}

export function MfaEnrollmentStep({
  enrollmentToken,
  onBack,
  onConfirm,
  isConfirming,
}: MfaEnrollmentStepProps) {
  const t = useTranslations('mfa');
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const enrolledForToken = useRef<string | null>(null);

  useEffect(() => {
    if (enrolledForToken.current === enrollmentToken) return;
    enrolledForToken.current = enrollmentToken;

    void (async () => {
      try {
        const result = await bffEnrollmentEnroll(enrollmentToken);
        setOtpauthUrl(result.otpauthUrl);
      } catch (error) {
        enrolledForToken.current = null;
        toast.error(resolveMfaErrorMessage(error, t));
      } finally {
        setIsLoadingSetup(false);
      }
    })();
  }, [enrollmentToken, t]);

  const handleConfirm = async () => {
    try {
      await onConfirm(code);
    } catch (error) {
      toast.error(resolveMfaErrorMessage(error, t));
    }
  };

  return (
    <MfaSetupPanel
      otpauthUrl={otpauthUrl}
      isLoading={isLoadingSetup}
      code={code}
      onCodeChange={setCode}
      onConfirm={handleConfirm}
      isConfirming={isConfirming}
      onBack={onBack}
    />
  );
}
