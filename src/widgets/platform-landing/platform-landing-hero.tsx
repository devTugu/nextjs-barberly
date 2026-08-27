'use client';

import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { PlatformLandingContent, PublicShopCard } from '@/entities/tenant';
import { FadeIn } from '@/shared/ui/motion';
import {
  AnimatedMesh,
  Container,
  FilmGrain,
  MarketingButton,
  TiltStage,
} from '@/shared/ui/marketing';
import { PlatformHeroMockup } from './platform-hero-mockup';

interface PlatformLandingHeroProps {
  content: PlatformLandingContent;
  platformLoginUrl: string;
  featuredShop: PublicShopCard | null;
}

export function PlatformLandingHero({
  content,
  platformLoginUrl,
  featuredShop,
}: PlatformLandingHeroProps) {
  const t = useTranslations('marketing');

  return (
    <section className="relative overflow-hidden pb-10 pt-4 md:pb-16">
      <AnimatedMesh className="-top-24" />
      <FilmGrain />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-white/55 to-white" />
      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <FadeIn className="max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-[var(--marketing-indigo)]">
              {t('platform.eyebrow')}
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--marketing-navy)] md:text-6xl lg:text-[4.25rem]">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--marketing-text-muted)]">
              {content.heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MarketingButton
                href={platformLoginUrl}
                variant="signIn"
                external={platformLoginUrl.startsWith('http')}
              >
                {content.heroCtaPrimary}
              </MarketingButton>
              <MarketingButton href="#shops" variant="secondary" showArrow={false}>
                {content.heroCtaSecondary}
                <ArrowRight className="size-3.5" />
              </MarketingButton>
            </div>
          </FadeIn>
          <FadeIn delay={0.12} className="lg:pl-4">
            <TiltStage className="mx-auto max-w-lg">
              <PlatformHeroMockup
                shop={featuredShop}
                fallbackTitle={t('hero.mockupTitle')}
              />
            </TiltStage>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
