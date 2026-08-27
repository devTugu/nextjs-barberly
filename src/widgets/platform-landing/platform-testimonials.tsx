import { getTranslations } from 'next-intl/server';
import type { PlatformTestimonial, PublicShopCard } from '@/entities/tenant';
import { Container, Section, SectionHeader } from '@/shared/ui/marketing';

interface PlatformTestimonialsProps {
  title: string;
  testimonials: PlatformTestimonial[];
  shops: PublicShopCard[];
}

export async function PlatformTestimonials({
  title,
  testimonials,
  shops,
}: PlatformTestimonialsProps) {
  const t = await getTranslations('marketing.platform');
  if (testimonials.length === 0) return null;
  const shopBySubdomain = new Map(shops.map((shop) => [shop.subdomain, shop]));

  return (
    <Section
      id="testimonials"
      className="scroll-mt-24 bg-[var(--marketing-surface-muted)]"
      showGridPattern={false}
    >
      <Container>
        <SectionHeader
          align="left"
          eyebrow={t('testimonialsEyebrow')}
          title={title}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => {
            const shop = item.tenantSubdomain
              ? shopBySubdomain.get(item.tenantSubdomain)
              : undefined;
            return (
              <figure
                key={`${item.name}-${item.role}-${item.tenantSubdomain ?? ''}`}
                className="flex h-full flex-col justify-between rounded-2xl border border-black/8 bg-white p-7 shadow-[0_20px_50px_-32px_rgba(20,10,50,0.35)]"
              >
                <blockquote className="text-lg leading-relaxed text-[var(--marketing-navy)]">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-8">
                  <p className="text-sm font-semibold text-[var(--marketing-navy)]">
                    {item.name}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--marketing-text-muted)]">
                    {item.role}
                    {shop ? ` · ${shop.name}` : null}
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
