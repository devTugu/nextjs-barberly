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
    <section className="relative min-h-[78vh] overflow-hidden pb-16 pt-6 md:pb-24">
      <AnimatedMesh className="-top-28" />
      <FilmGrain className="opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/55 to-transparent lg:via-white/25" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
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
                fallbackTitle={t('platform.brand')}
                fallbackTagline={t('platform.mockupTagline')}
              />
            </TiltStage>
          </FadeIn>
        </div>
      </Container>
    </section>
  );
}
