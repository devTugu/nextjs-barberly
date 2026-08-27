'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import type { PublicShopCard } from '@/entities/tenant';
import { buildBrandHeroPalette } from '@/shared/lib/marketing/brand-hero-palette';
import { TiltStage } from '@/shared/ui/marketing';

interface PlatformShopCardProps {
  shop: PublicShopCard;
}

export function PlatformShopCard({ shop }: PlatformShopCardProps) {
  const t = useTranslations('marketing.platform');
  const palette = buildBrandHeroPalette(shop.brandColor);
  const hostLabel = `${shop.subdomain}.barberly.mn`;

  return (
    <TiltStage maxTilt={8} className="h-full">
      <a
        href={shop.href}
        rel="noreferrer"
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/8 bg-[#0a0a0a] text-white shadow-[0_24px_60px_-28px_rgba(15,10,40,0.55)] transition-shadow hover:shadow-[0_32px_70px_-24px_rgba(15,10,40,0.7)]"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
          <span className="size-2 rounded-full bg-red-400/80" />
          <span className="size-2 rounded-full bg-amber-400/80" />
          <span className="size-2 rounded-full bg-emerald-400/80" />
          <span className="ml-2 truncate font-mono text-[10px] text-white/45">
            {hostLabel}
          </span>
        </div>
        <div className="relative aspect-[16/11] overflow-hidden">
          {shop.bannerUrl ? (
            <Image
              src={shop.bannerUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: palette.heroGradient }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            {shop.logoUrl ? (
              <Image
                src={shop.logoUrl}
                alt=""
                width={88}
                height={24}
                className="mb-2 h-6 w-auto object-contain"
                unoptimized
              />
            ) : null}
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">
              {shop.heroTagline ?? t('shopsEyebrow')}
            </p>
            <h3 className="mt-1 text-lg font-medium tracking-tight">{shop.name}</h3>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-white/70">
          <p className="min-w-0 truncate">
            {shop.heroSubtitle ?? shop.address ?? hostLabel}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-white">
            {t('visitShop')}
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </a>
    </TiltStage>
  );
}
