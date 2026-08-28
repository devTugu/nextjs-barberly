'use client';

import { useEffect } from 'react';
import { ensureCsrfToken } from '@/shared/lib/csrf-client';

export function CsrfBootstrap() {
  useEffect(() => {
    void ensureCsrfToken().catch(() => undefined);
  }, []);

  return null;
}
