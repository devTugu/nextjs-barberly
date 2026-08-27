import { Calendar, LayoutDashboard, Wallet } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { PlatformLandingContent } from '@/entities/tenant';
import { Container, GradientRibbon, Section } from '@/shared/ui/marketing';

const FEATURE_ICONS = [Calendar, LayoutDashboard, Wallet];

interface PlatformLandingSectionsProps {
  content: PlatformLandingContent;
}

export async function PlatformLandingSections({
  content,
}: PlatformLandingSectionsProps) {
  const t = await getTranslations('marketing.platform');
  const features = content.features ?? [];
  const benefits = content.benefits ?? [];
  const partners = content.partners ?? [];

  return (
    <>
      {features.length > 0 ? (
        <Section id="features" className="bg-white">
          <Container>
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.28em] text-[var(--marketing-indigo)]">
              {t('featuresEyebrow')}
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = FEATURE_ICONS[index] ?? Calendar;
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-black/8 bg-white/80 p-6 shadow-sm"
                  >
                    <Icon className="mb-4 size-5 text-[var(--marketing-indigo)]" />
                    <h2 className="text-lg font-semibold text-[var(--marketing-navy)]">
                      {feature.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </Container>
        </Section>
      ) : null}

      {benefits.length > 0 ? (
        <Section className="bg-[var(--marketing-surface-muted)]" showGridPattern={false}>
          <Container>
            <p className="mb-8 text-xs font-medium uppercase tracking-[0.28em] text-[var(--marketing-indigo)]">
              {t('benefitsEyebrow')}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/8 bg-white p-7"
                >
                  <h3 className="text-xl font-semibold text-[var(--marketing-navy)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--marketing-text-muted)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      {partners.length > 0 ? (
        <section className="relative overflow-hidden border-t border-black/6 py-16">
          <GradientRibbon className="top-0 opacity-70" />
          <Container className="relative z-10">
            <h2 className="text-xs font-medium uppercase tracking-[0.28em] text-[var(--marketing-text-muted)]">
              {content.partnersTitle}
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {partners.map((partner) => (
                <span
                  key={partner}
                  className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-[var(--marketing-navy)]"
                >
                  {partner}
                </span>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
