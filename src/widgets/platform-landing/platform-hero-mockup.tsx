import Image from 'next/image';
import type { PublicShopCard } from '@/entities/tenant';
import { cn } from '@/shared/lib/utils';

interface PlatformHeroMockupProps {
  shop: PublicShopCard | null;
  fallbackTitle: string;
  fallbackTagline: string;
}

export function PlatformHeroMockup({
  shop,
  fallbackTitle,
  fallbackTagline,
}: PlatformHeroMockupProps) {
  const title = shop?.name ?? fallbackTitle;
  const tagline = shop?.heroSubtitle ?? shop?.heroTagline ?? fallbackTagline;
  const brand = shop?.brandColor ?? '#d4b896';
  const chrome = shop ? `${shop.subdomain}.barberly.mn` : 'shop.barberly.mn';
  const imageAlt = shop ? `${shop.name} landing` : fallbackTitle;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#0c0c0c] text-white shadow-[0_40px_80px_-24px_rgba(15,10,40,0.55)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-400/80" />
        <span className="size-2.5 rounded-full bg-amber-400/80" />
        <span className="size-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 truncate font-mono text-[11px] text-white/65">
          {chrome}
        </span>
      </div>
      <div className="relative min-h-[280px] overflow-hidden bg-zinc-900 md:min-h-[340px]">
        {shop?.bannerUrl ? (
          <Image
            src={shop.bannerUrl}
            alt={imageAlt}
            fill
            className="object-cover opacity-80"
            unoptimized
            priority
            sizes="(max-width: 768px) 100vw, 480px"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${brand} 0%, #111 58%, #050505 100%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 md:p-6">
          {shop?.logoUrl ? (
            <Image
              src={shop.logoUrl}
              alt={`${title} logo`}
              width={96}
              height={28}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          ) : null}
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
            {shop?.heroTagline ?? 'INSIGHT'}
          </p>
          <p className="max-w-sm text-xl font-light leading-snug md:text-2xl">
            {tagline}
          </p>
          <span
            className={cn(
              'mt-3 inline-flex px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black',
            )}
            style={{ background: brand }}
          >
            {title}
          </span>
        </div>
      </div>
    </div>
  );
}
