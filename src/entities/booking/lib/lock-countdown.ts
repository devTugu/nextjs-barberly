/** Pure lock-expiry countdown helpers (no React / Date.now during render). */

export interface LockCountdown {
  expired: boolean;
  remainingMs: number;
  /** `m:ss` when still active */
  label: string;
}

export function computeLockCountdown(
  expiresAt: string,
  nowMs: number,
): LockCountdown {
  const remainingMs = new Date(expiresAt).getTime() - nowMs;
  if (remainingMs <= 0) {
    return { expired: true, remainingMs: 0, label: '0:00' };
  }
  const min = Math.floor(remainingMs / 60_000);
  const sec = Math.floor((remainingMs % 60_000) / 1000);
  return {
    expired: false,
    remainingMs,
    label: `${min}:${String(sec).padStart(2, '0')}`,
  };
}
