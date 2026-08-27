import { getTranslations } from 'next-intl/server';
import type { PublicShopCard } from '@/entities/tenant';
import { Container, Section, SectionHeader } from '@/shared/ui/marketing';
import { PlatformShopCard } from './platform-shop-card';

interface PlatformShopGalleryProps {
  shops: PublicShopCard[];
}

export async function PlatformShopGallery({ shops }: PlatformShopGalleryProps) {
  const t = await getTranslations('marketing.platform');

  return (
    <Section id="shops" className="bg-white" showGridPattern allowBleed>
      <Container>
        <SectionHeader
          align="left"
          eyebrow={t('shopsEyebrow')}
          title={t('shopsTitle')}
          description={t('shopsDescription')}
        />
        {shops.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 bg-white/70 px-6 py-16 text-center text-sm text-[var(--marketing-text-muted)]">
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
