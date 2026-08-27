'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, LayoutDashboard, Wallet } from 'lucide-react';
import type { PlatformLandingContent } from '@/entities/tenant';
import { MarketingGridPattern } from '@/shared/ui/marketing';
import { Button } from '@/shared/ui/button';

interface PlatformLandingPageProps {
  content: PlatformLandingContent;
  platformLoginUrl: string;
}

export function PlatformLandingPage({
  content,
  platformLoginUrl,
}: PlatformLandingPageProps) {
  const featureIcons = [Calendar, LayoutDashboard, Wallet];
  const features = content.features ?? [];
  const benefits = content.benefits ?? [];
  const partners = content.partners ?? [];

  return (
    <div className="relative min-h-svh overflow-hidden bg-[#050505] text-white">
      <MarketingGridPattern className="opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,90,60,0.18),_transparent_60%)]" />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-sm font-semibold tracking-[0.25em] uppercase">Barberly</span>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
          >
            <Link href={platformLoginUrl}>{content.heroCtaPrimary}</Link>
          </Button>
        </header>

        <section className="relative overflow-hidden border-y border-white/10">
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">SaaS for barbershops</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              {content.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/60">{content.heroSubtitle}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild className="rounded-full bg-white px-8 text-black hover:bg-white/90">
                <Link href={platformLoginUrl}>
                  {content.heroCtaPrimary}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <a href="#features">{content.heroCtaSecondary}</a>
              </Button>
            </div>
          </div>
        </section>

        {features.length > 0 ? (
          <section id="features" className="mx-auto max-w-6xl px-6 py-20">
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = featureIcons[index] ?? Calendar;
                return (
                  <article
                    key={feature.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                  >
                    <Icon className="mb-4 size-5 text-amber-200/80" />
                    <h2 className="text-lg font-semibold">{feature.title}</h2>
                    <p className="mt-2 text-sm text-white/55">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {benefits.length > 0 ? (
          <section className="border-t border-white/10 bg-white/[0.02] py-20">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
              {benefits.map((item) => (
                <div key={item.title} className="rounded-xl border border-white/10 p-6">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/55">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {partners.length > 0 ? (
          <section className="border-t border-white/10 py-16">
            <div className="mx-auto max-w-6xl px-6">
              <h2 className="text-sm uppercase tracking-[0.25em] text-white/45">
                {content.partnersTitle}
              </h2>
              <div className="mt-6 flex flex-wrap gap-3">
                {partners.map((partner) => (
                  <span
                    key={partner}
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <footer className="border-t border-white/10 py-10 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Barberly Platform
        </footer>
      </div>
    </div>
  );
}
