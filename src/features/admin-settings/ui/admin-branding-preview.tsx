'use client';

import type { CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

interface BrandingPreviewValues {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  brandColor?: string | null;
}

interface AdminBrandingPreviewProps {
  values: BrandingPreviewValues;
  name: string;
}

export function AdminBrandingPreview({
  values,
  name,
}: AdminBrandingPreviewProps) {
  const t = useTranslations('adminSettings');

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>{t('brandingPreviewTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="overflow-hidden rounded-lg border"
          style={
            values.brandColor
              ? ({
                  '--brand-primary': values.brandColor,
                } as CSSProperties)
              : undefined
          }
        >
          {values.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={values.bannerUrl}
              alt=""
              className="h-24 w-full object-cover"
            />
          ) : (
            <div className="bg-muted h-24 w-full" />
          )}
          <div className="space-y-3 p-4 text-center">
            {values.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={values.logoUrl}
                alt=""
                className="mx-auto size-14 rounded-xl object-cover"
              />
            ) : (
              <div className="bg-muted mx-auto size-14 rounded-xl" />
            )}
            <p className="font-semibold">{name}</p>
            <div
              className="mx-auto h-9 w-full max-w-[180px] rounded-md bg-[var(--brand-primary,hsl(var(--primary)))]"
              aria-hidden
            />
          </div>
        </div>
        <p className="text-muted-foreground text-xs">{t('brandingPreviewHint')}</p>
      </CardContent>
    </Card>
  );
}
