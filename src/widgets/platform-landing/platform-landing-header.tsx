import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { MarketingButton } from '@/shared/ui/marketing';

interface PlatformLandingHeaderProps {
  loginUrl: string;
}

export async function PlatformLandingHeader({
  loginUrl,
}: PlatformLandingHeaderProps) {
  const t = await getTranslations('marketing');

  return (
    <header className="relative z-30">
      <div className="mx-auto flex max-w-[var(--marketing-max-width)] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-[0.28em] uppercase text-[var(--marketing-navy)]"
        >
          {t('platform.brand')}
        </Link>
        <nav className="flex items-center gap-5">
          <a
            href="#shops"
            className="hidden text-sm text-[var(--marketing-navy)]/70 transition-colors hover:text-[var(--marketing-navy)] sm:inline"
          >
            {t('platform.shopsNav')}
          </a>
          <a
            href="#features"
            className="hidden text-sm text-[var(--marketing-navy)]/70 transition-colors hover:text-[var(--marketing-navy)] md:inline"
          >
            {t('platform.featuresEyebrow')}
          </a>
          <MarketingButton
            href={loginUrl}
            variant="signIn"
            showArrow={false}
            external={loginUrl.startsWith('http')}
          >
            {t('nav.signIn')}
          </MarketingButton>
        </nav>
      </div>
    </header>
  );
}
