import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { TenantLandingContent } from '@/entities/tenant';

interface LuxuryAboutProps {
  tenantName: string;
  landingContent: TenantLandingContent;
}

export async function LuxuryAbout({ tenantName, landingContent }: LuxuryAboutProps) {
  const t = await getTranslations('home');
  const aboutImage = landingContent.aboutImageUrl;

  return (
    <section id="about" className="scroll-mt-24 border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[0.2em]">
            {landingContent.aboutTitle ?? t('navAbout')}
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-white/65 md:text-base">
            {landingContent.aboutDescription}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
          {aboutImage ? (
            <Image
              src={aboutImage}
              alt={`${tenantName} salon`}
              fill
              className="object-cover"
              unoptimized
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
