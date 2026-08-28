import { getTranslations } from 'next-intl/server';
import type { PlatformLandingFeature } from '@/entities/tenant';
import { Container, Section, SectionHeader } from '@/shared/ui/marketing';

interface PlatformFeaturesProps {
  features: PlatformLandingFeature[];
}

export async function PlatformFeatures({ features }: PlatformFeaturesProps) {
  const t = await getTranslations('marketing.platform');
  if (features.length === 0) return null;

  return (
    <Section id="product" className="scroll-mt-24 bg-white" showGridPattern>
      <Container>
        <SectionHeader
          align="left"
          eyebrow={t('featuresEyebrow')}
          title={t('productTitle')}
          description={t('productDescription')}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-black/8 bg-white p-6 shadow-[0_20px_50px_-32px_rgba(20,10,50,0.28)]"
            >
              <h3 className="text-lg font-semibold tracking-tight text-[var(--marketing-navy)]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
