'use client';

import { useEffect, useState } from 'react';
import { CustomerBranchPicker } from '@/features/user-portal';
import { ROUTES } from '@/shared/config/routes';

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 2000 });
    return () => window.cancelIdleCallback(idleId);
  }
  const timeoutId = window.setTimeout(callback, 1);
  return () => window.clearTimeout(timeoutId);
}

export function IdleBranchPicker() {
  const [ready, setReady] = useState(false);

  useEffect(() => scheduleIdle(() => setReady(true)), []);

  if (!ready) return null;
  return (
    <CustomerBranchPicker
      preferBookable
      path={ROUTES.HOME}
      className="border-b border-white/5 px-4 py-2"
    />
  );
}
