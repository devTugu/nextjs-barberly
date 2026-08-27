import { getTranslations } from 'next-intl/server';
import type { PlatformLandingContent, PublicShopCard } from '@/entities/tenant';
import { Container, Section, SectionHeader } from '@/shared/ui/marketing';
import { PlatformShopCard } from './platform-shop-card';

interface PlatformShopGalleryProps {
  shops: PublicShopCard[];
  content: PlatformLandingContent;
}

export async function PlatformShopGallery({
  shops,
  content,
}: PlatformShopGalleryProps) {
  const t = await getTranslations('marketing.platform');

  return (
    <Section id="partners" className="scroll-mt-24 bg-white" showGridPattern allowBleed>
      <Container>
        <SectionHeader
          align="left"
          eyebrow={t('shopsEyebrow')}
          title={content.partnersTitle || t('shopsTitle')}
          description={t('shopsDescription')}
        />
        {shops.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 px-6 py-16 text-center text-sm text-[var(--marketing-text-muted)]">
            {t('emptyShops')}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {shops.map((shop) => (
              <PlatformShopCard key={shop.subdomain} shop={shop} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
