import { getErrorMessage } from '@/shared/api';

const MFA_ERROR_PATTERNS: Array<{ match: RegExp; key: string }> = [
  { match: /invalid mfa code/i, key: 'invalidMfaCode' },
  { match: /mfa secret cannot be read/i, key: 'mfaSecretCorrupt' },
  { match: /start mfa enrollment first/i, key: 'enrollmentNotStarted' },
  { match: /mfa is not enabled/i, key: 'mfaNotEnabled' },
  { match: /invalid mfa session/i, key: 'invalidMfaSession' },
  { match: /mfa not configured/i, key: 'mfaNotConfigured' },
];

type SecurityTranslator = (key: string) => string;

export function resolveMfaErrorMessage(
  error: unknown,
  t: SecurityTranslator,
): string {
  const message = getErrorMessage(error);
  const matched = MFA_ERROR_PATTERNS.find((pattern) =>
    pattern.match.test(message),
  );

  if (matched) {
    return t(matched.key);
  }

  return message;
}
