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
        {content.partners.length > 0 ? (
          <div className="mb-10 flex flex-wrap gap-3">
            {content.partners.map((partner) => (
              <span
                key={partner}
                className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-[var(--marketing-navy)]"
              >
                {partner}
              </span>
            ))}
          </div>
        ) : null}
        {shops.length === 0 ? (
          <EmptyShopStage message={t('emptyShops')} />
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

function EmptyShopStage({ message }: { message: string }) {
  return (
    <div className="[perspective:1200px]">
      <div className="grid gap-5 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-52 overflow-hidden rounded-2xl border border-black/8 bg-gradient-to-br from-[#f4f1ff] via-white to-[#fff6ea] shadow-[0_24px_50px_-32px_rgba(40,20,80,0.45)]"
            style={{ transform: `rotateX(8deg) rotateY(${-12 + index * 8}deg)` }}
          >
            <div className="flex items-center gap-1.5 border-b border-black/6 px-3 py-2">
              <span className="size-1.5 rounded-full bg-black/15" />
              <span className="size-1.5 rounded-full bg-black/10" />
              <span className="size-1.5 rounded-full bg-black/10" />
            </div>
            <div className="h-full bg-[linear-gradient(135deg,#a960ee22,#ff333d18,#90e0ff22)]" />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-[var(--marketing-text-muted)]">
        {message}
      </p>
    </div>
  );
}
