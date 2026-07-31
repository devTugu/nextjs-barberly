'use client';

import { AlertCircle, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

export function PageLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function PageEmpty({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const t = useTranslations('common');
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="size-10 text-muted-foreground" aria-hidden />
      <p className="font-medium">{title ?? t('noResults')}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : (
        <p className="text-muted-foreground max-w-sm text-sm">
          {t('noResultsDescription')}
        </p>
      )}
    </div>
  );
}

export function PageError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset?: () => void;
}) {
  const t = useTranslations('common');
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
      role="alert"
    >
      <AlertCircle className="text-destructive size-10" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium">{t('errorTitle')}</p>
        <p className="text-muted-foreground max-w-md text-sm">
          {error?.message ?? t('errorDescription')}
        </p>
      </div>
      {reset ? (
        <Button onClick={reset} variant="outline">
          {t('retry')}
        </Button>
      ) : null}
    </div>
  );
}
