import { Check } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { PlatformPricePlan } from '@/entities/tenant';
import { cn } from '@/shared/lib/utils';
import { Container, MarketingButton, Section, SectionHeader } from '@/shared/ui/marketing';

interface PlatformPricingProps {
  title: string;
  subtitle: string;
  plans: PlatformPricePlan[];
}

export async function PlatformPricing({
  title,
  subtitle,
  plans,
}: PlatformPricingProps) {
  const t = await getTranslations('marketing.platform');
  if (plans.length === 0) return null;

  return (
    <Section id="pricing" className="scroll-mt-24 bg-white" showGridPattern>
      <Container>
        <SectionHeader
          align="left"
          eyebrow={t('pricingEyebrow')}
          title={title}
          description={subtitle}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                'flex flex-col rounded-2xl border p-7',
                plan.highlighted
                  ? 'border-transparent bg-[var(--marketing-navy)] text-white shadow-[0_32px_70px_-28px_rgba(15,10,40,0.55)]'
                  : 'border-black/8 bg-white text-[var(--marketing-navy)]',
              )}
            >
              {plan.highlighted ? (
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/60">
                  {t('highlightedPlan')}
                </p>
              ) : null}
              <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price}</p>
              <p
                className={cn(
                  'mt-1 text-sm',
                  plan.highlighted ? 'text-white/65' : 'text-[var(--marketing-text-muted)]',
                )}
              >
                {plan.cadence}
              </p>
              <p
                className={cn(
                  'mt-4 text-sm leading-relaxed',
                  plan.highlighted ? 'text-white/75' : 'text-[var(--marketing-text-muted)]',
                )}
              >
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <MarketingButton
                  href="#contact"
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  className={
                    plan.highlighted
                      ? 'bg-white text-[var(--marketing-navy)] hover:bg-white/90'
                      : undefined
                  }
                  showArrow={false}
                >
                  {plan.cta}
                </MarketingButton>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
