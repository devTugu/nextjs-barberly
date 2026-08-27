import { getTranslations } from 'next-intl/server';
import type { PlatformLandingContent, PublicShopCard } from '@/entities/tenant';
import { PlatformLandingHeader } from './platform-landing-header';
import { PlatformLandingHero } from './platform-landing-hero';
import { PlatformLandingSections } from './platform-landing-sections';
import { PlatformShopGallery } from './platform-shop-gallery';

interface PlatformLandingPageProps {
  content: PlatformLandingContent;
  platformLoginUrl: string;
  shops: PublicShopCard[];
}

export async function PlatformLandingPage({
  content,
  platformLoginUrl,
  shops,
}: PlatformLandingPageProps) {
  const t = await getTranslations('marketing');
  const year = new Date().getFullYear();

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-white text-[var(--marketing-navy)]">
      <PlatformLandingHeader loginUrl={platformLoginUrl} />
      <PlatformLandingHero
        content={content}
        platformLoginUrl={platformLoginUrl}
        featuredShop={shops[0] ?? null}
      />
      <PlatformShopGallery shops={shops} />
      <PlatformLandingSections content={content} />
      <footer className="border-t border-black/8 py-10 text-center text-xs text-[var(--marketing-text-muted)]">
        {t('footer.copyright', { year, siteName: t('platform.brand') })}
      </footer>
    </div>
  );
}
